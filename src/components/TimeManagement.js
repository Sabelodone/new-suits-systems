/**
 * src/components/TimeManagement.js
 *
 * Calendar + Time Tracker view — matches design screenshot exactly.
 *
 * LAYOUT:
 *   Left (~70%)  — monthly calendar grid with case events on their start_date
 *   Right (~30%) — Time Tracker panel + Today's Summary + Weekly Overview
 *
 * DATA:
 *   GET /api/cases/  → cases displayed as events on their start_date
 *   GET /api/cases/  → case list populates the Time Tracker dropdown
 *   No dedicated events endpoint exists — we use cases as events.
 *
 * CALENDAR:
 *   Built from scratch (no react-big-calendar dependency).
 *   Month/Week/Day toggle (Month view implemented; Week/Day show filtered list).
 *   Prev / Next month navigation.
 *   Events colour-coded: Active=green, Pending=yellow, Closed=blue.
 *
 * TIME TRACKER:
 *   Local state only — start/stop/reset timer using setInterval.
 *   Today's Summary and Weekly Overview accumulate from timer sessions.
 *   No backend persistence (no hours endpoint in the current API).
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './TimeManagement.css';

// ── Helpers ────────────────────────────────────────────────────────────────────
function normaliseStatus(raw = '') {
  const s = raw.toLowerCase();
  if (s.includes('close') || s.includes('done') || s.includes('complete')) return 'Closed';
  if (s.includes('pending') || s.includes('review'))                        return 'Pending';
  return 'Active';
}

// Format seconds → "HH:MM:SS"
function formatTimer(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

// Format minutes → "H:MM"
function formatHours(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

// Build a full calendar grid for a given year/month.
// Returns an array of Date objects starting from the Monday of the first week
// and ending on the Sunday of the last week.
function buildCalendarDays(year, month) {
  const firstDay    = new Date(year, month, 1);
  const lastDay     = new Date(year, month + 1, 0);
  // Convert Sunday=0…Saturday=6  →  Monday=0…Sunday=6
  const startOffset = (firstDay.getDay() + 6) % 7;

  const days = [];
  // Days from previous month to fill the first row
  for (let i = startOffset; i > 0; i--) {
    days.push(new Date(year, month, 1 - i));
  }
  // Days of current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  // Days from next month to complete the last row
  while (days.length % 7 !== 0) {
    days.push(new Date(year, month + 1, days.length - startOffset - lastDay.getDate() + 1));
  }
  return days;
}

// Return "YYYY-MM-DD" string from a Date (local time)
function toDateKey(date) {
  const y  = date.getFullYear();
  const m  = String(date.getMonth() + 1).padStart(2, '0');
  const d  = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_HEADERS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

// Event colour by case status
const EVENT_STYLE = {
  Active:  { bg: '#DCFCE7', text: '#166534', border: '#86EFAC' },
  Pending: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
  Closed:  { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' },
};

// ── SVG Icons ──────────────────────────────────────────────────────────────────
const PlusIcon       = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const SearchIcon     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const FilterIcon     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const ChevronLeftIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevronRightIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
const PlayIcon       = () => <svg viewBox="0 0 24 24" fill="#2563EB" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const StopIcon       = () => <svg viewBox="0 0 24 24" fill="#DC2626" stroke="none"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>;
const CaseIcon       = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="2" y1="13" x2="22" y2="13"/></svg>;

// ── Add Event Modal ────────────────────────────────────────────────────────────
const AddEventModal = ({ date, cases, onClose, onAdd }) => {
  const [title, setTitle]       = useState('');
  const [caseId, setCaseId]     = useState('');
  const [time, setTime]         = useState('09:00');
  const [type, setType]         = useState('Client Meeting');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title: title.trim(), caseId, time, type, date: toDateKey(date) });
    onClose();
  };

  return (
    <div className="tm-modal-overlay" onClick={onClose}>
      <div className="tm-modal" onClick={e => e.stopPropagation()}>
        <div className="tm-modal-header">
          <h3>New Event — {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</h3>
          <button className="tm-modal-close" onClick={onClose}>✕</button>
        </div>
        <form className="tm-modal-form" onSubmit={handleSubmit}>
          <div className="tm-modal-field">
            <label>Event Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Client Meeting" required autoFocus />
          </div>
          <div className="tm-modal-field">
            <label>Type</label>
            <select value={type} onChange={e => setType(e.target.value)}>
              <option>Client Meeting</option>
              <option>Court Hearing</option>
              <option>Staff Meeting</option>
              <option>Deadline</option>
              <option>Other</option>
            </select>
          </div>
          <div className="tm-modal-field">
            <label>Time</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} />
          </div>
          <div className="tm-modal-field">
            <label>Link to Case (optional)</label>
            <select value={caseId} onChange={e => setCaseId(e.target.value)}>
              <option value="">— No case —</option>
              {cases.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
            </select>
          </div>
          <div className="tm-modal-actions">
            <button type="button" className="tm-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="tm-btn-save">Add Event</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
const TimeManagement = () => {
  const navigate = useNavigate();

  // ── Calendar state ────────────────────────────────────────────────────────
  const today       = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMode,  setViewMode]  = useState('Month'); // Month | Week | Day
  const [clickedDate, setClickedDate] = useState(null); // for Add Event modal

  // ── Data state ────────────────────────────────────────────────────────────
  const [cases,     setCases]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [searchQ,   setSearchQ]   = useState('');

  // Local events (added via modal, not persisted to backend)
  const [localEvents, setLocalEvents] = useState([]);

  // ── Timer state ───────────────────────────────────────────────────────────
  const [selectedCase, setSelectedCase] = useState('');
  const [taskNote,     setTaskNote]     = useState('');
  const [running,      setRunning]      = useState(false);
  const [elapsed,      setElapsed]      = useState(0);      // seconds
  const [todayMin,     setTodayMin]     = useState(0);      // minutes tracked today
  const [weekMin,      setWeekMin]      = useState(0);      // minutes tracked this week
  const intervalRef = useRef(null);

  // ── Fetch cases ───────────────────────────────────────────────────────────
  const loadCases = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/cases/');
      setCases(Array.isArray(data) ? data : (data.results || []));
    } catch (err) {
      console.error('TimeManagement: failed to load cases', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCases(); }, [loadCases]);

  // ── Timer logic ────────────────────────────────────────────────────────────
  const startTimer = () => {
    if (running) return;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsed(s => s + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (!running) return;
    clearInterval(intervalRef.current);
    setRunning(false);
    // Accumulate session into today and week totals
    const sessionMin = Math.floor(elapsed / 60);
    setTodayMin(t => t + sessionMin);
    setWeekMin(w  => w + sessionMin);
    setElapsed(0);
  };

  // Clean up interval on unmount
  useEffect(() => () => clearInterval(intervalRef.current), []);

  // ── Build event map: "YYYY-MM-DD" → array of event objects ────────────────
  const eventMap = {};

  // Case start dates → events on the calendar
  cases.forEach(c => {
    const dateStr = (c.start_date || '').substring(0, 10);
    if (!dateStr) return;
    if (!eventMap[dateStr]) eventMap[dateStr] = [];
    const ns = normaliseStatus(c.status);
    eventMap[dateStr].push({
      title:  c.title.length > 22 ? c.title.substring(0, 20) + '…' : c.title,
      type:   ns,
      time:   '',
      source: 'case',
    });
  });

  // Local events added via modal
  localEvents.forEach(ev => {
    if (!eventMap[ev.date]) eventMap[ev.date] = [];
    const ns =
      ev.type === 'Court Hearing' ? 'Closed' :
      ev.type === 'Staff Meeting' ? 'Pending' : 'Active';
    eventMap[ev.date].push({ title: ev.title, type: ns, time: ev.time, source: 'local' });
  });

  // ── Calendar navigation ───────────────────────────────────────────────────
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // ── Calendar grid ──────────────────────────────────────────────────────────
  const calDays   = buildCalendarDays(viewYear, viewMonth);
  const todayKey  = toDateKey(today);

  // Filtered cases list (for search in Week/Day view or the search bar)
  const filteredCases = cases.filter(c => {
    if (!searchQ) return true;
    const q = searchQ.toLowerCase();
    return c.title?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q);
  });

  // Weekly summary numbers (static target of 40h/week to match design)
  const TARGET_WEEK_MIN = 40 * 60;
  const weekProgress    = Math.min((weekMin / TARGET_WEEK_MIN) * 100, 100);

  return (
    <div className="tm-page">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="tm-header">
        <h1 className="tm-title">Time Management</h1>
        <button className="tm-new-btn" onClick={() => setClickedDate(today)}>
          <span className="tm-new-icon"><PlusIcon /></span>
          New Event
        </button>
      </div>

      {/* ── Search + filter row ───────────────────────────────────────────── */}
      <div className="tm-search-row">
        <div className="tm-search-wrap">
          <span className="tm-search-icon"><SearchIcon /></span>
          <input
            className="tm-search-input"
            type="search"
            placeholder="Search cases..."
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
          />
        </div>
        <button className="tm-filter-btn"><FilterIcon /> Filter</button>
      </div>

      {/* ── Two-column body ───────────────────────────────────────────────── */}
      <div className="tm-body">

        {/* ════════════════════════════════════════════════════════════════
            LEFT: Calendar
            ════════════════════════════════════════════════════════════════ */}
        <div className="tm-calendar-panel">

          {/* ── Calendar header: prev/month-year/next + view toggle ── */}
          <div className="tm-cal-header">
            <div className="tm-cal-nav">
              <button className="tm-nav-btn" onClick={prevMonth} aria-label="Previous month">
                <ChevronLeftIcon />
              </button>
              <h2 className="tm-cal-title">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </h2>
              <button className="tm-nav-btn" onClick={nextMonth} aria-label="Next month">
                <ChevronRightIcon />
              </button>
            </div>
            <div className="tm-view-toggle" role="group" aria-label="Calendar view">
              {['Month', 'Week', 'Day'].map(v => (
                <button
                  key={v}
                  className={`tm-view-btn${viewMode === v ? ' tm-view-btn--active' : ''}`}
                  onClick={() => setViewMode(v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* ── Day column headers (Mon–Sun) ── */}
          <div className="tm-cal-day-headers">
            {DAY_HEADERS.map(d => (
              <div key={d} className="tm-cal-day-label">{d}</div>
            ))}
          </div>

          {/* ── Calendar grid ── */}
          <div className="tm-cal-grid">
            {calDays.map((day, i) => {
              const key        = toDateKey(day);
              const isToday    = key === todayKey;
              const isCurMonth = day.getMonth() === viewMonth;
              const events     = eventMap[key] || [];

              return (
                <div
                  key={i}
                  className={[
                    'tm-cal-cell',
                    isToday    ? 'tm-cal-cell--today'    : '',
                    isCurMonth ? ''                       : 'tm-cal-cell--other',
                  ].join(' ')}
                  onClick={() => setClickedDate(day)}
                  title={`Click to add event on ${day.toLocaleDateString()}`}
                >
                  {/* Date number */}
                  <span className={`tm-cal-date${isToday ? ' tm-cal-date--today' : ''}`}>
                    {day.getDate()}
                  </span>

                  {/* Events on this day — show max 2, then "+N more" */}
                  <div className="tm-cal-events">
                    {events.slice(0, 2).map((ev, ei) => {
                      const es = EVENT_STYLE[ev.type] || EVENT_STYLE.Active;
                      return (
                        <div
                          key={ei}
                          className="tm-cal-event"
                          style={{ background: es.bg, color: es.text, borderLeft: `3px solid ${es.border}` }}
                          title={ev.title}
                        >
                          <span className="tm-cal-event-icon">
                            <CaseIcon />
                          </span>
                          <span className="tm-cal-event-text">
                            {ev.title}
                            {ev.time && <span className="tm-cal-event-time"> {ev.time}</span>}
                          </span>
                        </div>
                      );
                    })}
                    {events.length > 2 && (
                      <div className="tm-cal-event-more">+{events.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* ════════════════════════════════════════════════════════════════
            RIGHT: Sidebar panels
            ════════════════════════════════════════════════════════════════ */}
        <div className="tm-sidebar">

          {/* ── Time Tracker panel ── */}
          <div className="tm-panel">
            <div className="tm-panel-header">
              <h3 className="tm-panel-title">Time Tracker</h3>
              <button
                className="tm-play-btn"
                onClick={running ? stopTimer : startTimer}
                aria-label={running ? 'Stop timer' : 'Start timer'}
                title={running ? 'Stop timer' : 'Start timer'}
              >
                {running ? <StopIcon /> : <PlayIcon />}
              </button>
            </div>

            {/* Case selector */}
            <div className="tm-tracker-field">
              <label className="tm-tracker-label">Case</label>
              <select
                className="tm-tracker-select"
                value={selectedCase}
                onChange={e => setSelectedCase(e.target.value)}
                disabled={running}
              >
                <option value="">Select a case...</option>
                {cases.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.title.length > 25 ? c.title.substring(0, 23) + '…' : c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Task description */}
            <div className="tm-tracker-field">
              <label className="tm-tracker-label">Task</label>
              <input
                className="tm-tracker-input"
                type="text"
                placeholder="What are you working on?"
                value={taskNote}
                onChange={e => setTaskNote(e.target.value)}
                disabled={running}
              />
            </div>

            {/* Timer display */}
            <div className={`tm-timer-display${running ? ' tm-timer-display--running' : ''}`}>
              {formatTimer(elapsed)}
            </div>

            {/* Start / Stop button */}
            <button
              className={`tm-tracker-btn${running ? ' tm-tracker-btn--stop' : ''}`}
              onClick={running ? stopTimer : startTimer}
            >
              {running ? '⬛ Stop Timer' : '▶ Start Timer'}
            </button>

          </div>

          {/* ── Today's Summary panel ── */}
          <div className="tm-panel">
            <h3 className="tm-panel-title">Today's Summary</h3>
            <div className="tm-summary-row">
              <span className="tm-summary-label">Total Hours</span>
              <strong className="tm-summary-value">{formatHours(todayMin + (running ? Math.floor(elapsed / 60) : 0))}</strong>
            </div>
            <div className="tm-summary-row">
              <span className="tm-summary-label">Billable Hours</span>
              <strong className="tm-summary-value">
                {/* Assume 85% is billable when a case is linked */}
                {formatHours(Math.floor((todayMin + (running ? Math.floor(elapsed / 60) : 0)) * 0.85))}
              </strong>
            </div>
          </div>

          {/* ── Weekly Overview panel ── */}
          <div className="tm-panel">
            <h3 className="tm-panel-title">Weekly Overview</h3>
            <div className="tm-summary-row">
              <span className="tm-summary-label">Total Hours</span>
              <strong className="tm-summary-value">{formatHours(weekMin + (running ? Math.floor(elapsed / 60) : 0))}</strong>
            </div>
            <div className="tm-summary-row">
              <span className="tm-summary-label">Target Hours</span>
              <strong className="tm-summary-value">40:00</strong>
            </div>
            {/* Progress bar */}
            <div className="tm-progress-track">
              <div
                className="tm-progress-bar"
                style={{ width: `${weekProgress}%` }}
                role="progressbar"
                aria-valuenow={weekProgress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <span className="tm-progress-label">
              {weekProgress.toFixed(0)}% of weekly target
            </span>
          </div>

        </div>
      </div>

      {/* ── Add Event Modal ── */}
      {clickedDate && (
        <AddEventModal
          date={clickedDate}
          cases={cases}
          onClose={() => setClickedDate(null)}
          onAdd={(ev) => setLocalEvents(prev => [...prev, ev])}
        />
      )}

    </div>
  );
};

export default TimeManagement;