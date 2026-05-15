/**
 * src/components/Dashboard.js
 *
 * CHANGES IN THIS VERSION:
 *       Recent Cases table limited to 6 rows (was 20).
 *      The dashboard is a summary view — 6 cases is enough to show at a glance.
 *      The full list is always one click away via "View all →".
 *
 * Everything else (wake-up hint, KPI cards, skeleton loading, error banner,
 * quick actions) is unchanged from the previous working version.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate }                         from 'react-router-dom';
import { useUser }                             from './UserContext';
import api                                     from '../services/api';
import './Dashboard.css';

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = {
  Briefcase: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      <line x1="2" y1="13" x2="22" y2="13"/>
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="8" r="3"/>
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
      <circle cx="17" cy="8" r="3"/>
      <path d="M21 20c0-3.3-2.7-6-6-6"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9"/>
      <path d="M8 12l3 3 5-5" strokeLinecap="round"/>
    </svg>
  ),
  TrendUp: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="17 6 23 6 23 12" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5"  y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Arrow: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M5 12h14M13 6l6 6-6 6"/>
    </svg>
  ),
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function normaliseStatus(raw = '') {
  const s = raw.toLowerCase();
  if (s === 'closed'  || s.includes('complete') || s.includes('done'))   return 'Closed';
  if (s === 'pending' || s.includes('pending')  || s.includes('review')) return 'Pending';
  return 'Active';
}

const STATUS_COLORS = {
  Active:  { bg: '#DCFCE7', text: '#166534' },
  Pending: { bg: '#FEF9C3', text: '#854D0E' },
  Closed:  { bg: '#F1F5F9', text: '#475569' },
};

const Skeleton = ({ width = '100%', height = 16, radius = 6 }) => (
  <div className="dash-skeleton" style={{ width, height, borderRadius: radius }} aria-hidden="true" />
);

// ── How many recent cases to show on the dashboard ────────────────────────────
// 6 is the right number for a summary view — enough context without overwhelming.
// The full paginated list is always accessible via "View all →" → /cases.
const DASHBOARD_CASES_LIMIT = 6;

// ── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const [cases,       setCases]       = useState([]);
  const [clients,     setClients]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [wakingUp,    setWakingUp]    = useState(false);
  const [error,       setError]       = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const wakeTimerRef = useRef(null);

  // ── Fetch data ───────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setWakingUp(false);

      // Show "waking up" hint after 8 s — Render free tier takes up to 50 s
      wakeTimerRef.current = setTimeout(() => {
        if (!cancelled) setWakingUp(true);
      }, 8000);

      try {
        const [casesRes, clientsRes] = await Promise.all([
          api.get('/cases/'),
          api.get('/clients/'),
        ]);
        if (!cancelled) {
          setCases(Array.isArray(casesRes.data) ? casesRes.data : (casesRes.data.results || []));
          setClients(Array.isArray(clientsRes.data) ? clientsRes.data : (clientsRes.data.results || []));
        }
      } catch (err) {
        if (!cancelled) {
          const isNetwork = !err.response;
          setError(
            isNetwork
              ? 'Could not reach the server. It may still be waking up — wait 30 s and retry.'
              : err.response?.data?.detail || err.message || 'Failed to load data.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setWakingUp(false);
          clearTimeout(wakeTimerRef.current);
        }
      }
    };

    fetchData();
    return () => { cancelled = true; clearTimeout(wakeTimerRef.current); };
  }, []);

  // ── KPI stats ────────────────────────────────────────────────────────────────
  const activeCases  = cases.filter(c => normaliseStatus(c.status) === 'Active').length;
  const pendingCases = cases.filter(c => normaliseStatus(c.status) === 'Pending').length;
  const closedCases  = cases.filter(c => normaliseStatus(c.status) === 'Closed').length;
  const successRate  = cases.length > 0 ? Math.round((closedCases / cases.length) * 100) : 0;

  const STATS = [
    { label: 'Active Cases',  value: activeCases,      change: `${pendingCases} pending`,                        icon: Icon.Briefcase,   color: '#2563EB' },
    { label: 'Total Clients', value: clients.length,   change: 'All time',                                       icon: Icon.Users,       color: '#059669' },
    { label: 'Pending Cases', value: pendingCases,     change: pendingCases > 0 ? 'Need attention' : 'All clear', icon: Icon.CheckCircle, color: '#7C3AED' },
    { label: 'Success Rate',  value: `${successRate}%`, change: `${closedCases} closed`,                         icon: Icon.TrendUp,     color: '#D97706' },
  ];

  // ── Recent cases: limit to DASHBOARD_CASES_LIMIT (6) ─────────────────────────
  // These are the most recently-fetched cases (API returns them in server order).
  // Apply filter tab on top of the limit so tabs still work in this table.
  const FILTER_TABS = ['All', 'Active', 'Pending', 'Closed'];

  const recentCases = cases
    .filter(c => activeFilter === 'All' || normaliseStatus(c.status) === activeFilter)
    .slice(0, DASHBOARD_CASES_LIMIT); // ← LIMIT TO 6

  const firstName = user?.first_name || user?.username || 'there';

  return (
    <div className="dash-page">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Dashboard</h1>
          <p className="dash-subtitle">Welcome back, {firstName}</p>
        </div>
        <button className="dash-btn-new" onClick={() => navigate('/create-case')}>
          <span className="dash-btn-icon"><Icon.Plus /></span>
          New Case
        </button>
      </div>

      {/* ── Server waking-up hint (shown after 8 s of loading) ─────────── */}
      {loading && wakingUp && (
        <div className="dash-wakeup" role="status">
          <span className="dash-wakeup-spinner" aria-hidden="true" />
          <span>
            <strong>Waking up the server…</strong>
            &nbsp;The backend is on a free plan and takes 30–50 s to start.
            Your data will appear shortly.
          </span>
        </div>
      )}

      {/* ── Error banner ──────────────────────────────────────────────────── */}
      {error && (
        <div className="dash-error" role="alert">
          <span>{error}</span>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {/* ── KPI stat cards ────────────────────────────────────────────────── */}
      <div className="dash-stats">
        {STATS.map((stat, i) => {
          const Ico = stat.icon;
          return (
            <div className="dash-stat-card" key={i} style={{ '--accent': stat.color }}>
              <div className="dash-stat-icon"><Ico /></div>
              <div className="dash-stat-body">
                {loading ? <Skeleton width={60} height={28} /> : <span className="dash-stat-value">{stat.value}</span>}
                <span className="dash-stat-label">{stat.label}</span>
                {loading ? <Skeleton width={80} height={12} /> : <span className="dash-stat-change">{stat.change}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Recent Cases (limited to 6) ───────────────────────────────────── */}
      <div className="dash-section">
        <div className="dash-section-header">
          <h2 className="dash-section-title">Recent Cases</h2>

          {/* Filter tabs */}
          <div className="dash-filters" role="tablist">
            {FILTER_TABS.map(f => (
              <button
                key={f}
                role="tab"
                aria-selected={activeFilter === f}
                className={`dash-filter${activeFilter === f ? ' dash-filter--active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {/* "View all →" navigates to /cases (full paginated list) */}
          <button className="dash-view-all" onClick={() => navigate('/cases')}>
            View all <Icon.Arrow />
          </button>
        </div>

        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Case Code</th>
                <th>Title</th>
                <th>Client</th>
                <th>Status</th>
                <th>Opened</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {/* Skeleton rows while loading — match the 6-row limit */}
              {loading && Array.from({ length: DASHBOARD_CASES_LIMIT }).map((_, i) => (
                <tr key={`sk-${i}`}>
                  {[70, 150, 110, 70, 90, 20].map((w, j) => (
                    <td key={j}><Skeleton width={w} height={14} /></td>
                  ))}
                </tr>
              ))}

              {/* Real rows (max 6) */}
              {!loading && recentCases.map(c => {
                const ns = normaliseStatus(c.status);
                const sc = STATUS_COLORS[ns] || STATUS_COLORS.Active;
                return (
                  <tr key={c.id} className="dash-table-row" onClick={() => navigate('/cases')} title="Go to cases">
                    <td className="dash-td-id">{c.code}</td>
                    <td className="dash-td-client">{c.title}</td>
                    <td>{c.client_name || '—'}</td>
                    <td>
                      <span className="dash-badge" style={{ background: sc.bg, color: sc.text }}>{ns}</span>
                    </td>
                    <td>{c.start_date || '—'}</td>
                    <td className="dash-td-arrow"><Icon.Arrow /></td>
                  </tr>
                );
              })}

              {/* Empty state */}
              {!loading && recentCases.length === 0 && (
                <tr>
                  <td colSpan={6} className="dash-empty">
                    {cases.length === 0 ? 'No cases yet. Open your first case to get started.' : `No ${activeFilter.toLowerCase()} cases.`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Quick actions ─────────────────────────────────────────────────── */}
      <div className="dash-quick">
        {[
          { label: 'Open a Case',  desc: 'Start a new client file',   path: '/create-case',         color: '#2563EB' },
          { label: 'Add a Task',   desc: 'Log tasks and to-dos',      path: '/tasks',               color: '#7C3AED' },
          { label: 'Upload Docs',  desc: 'Attach documents to cases', path: '/document-management', color: '#059669' },
          { label: 'Time Log',     desc: 'Record billable hours',     path: '/time-management',     color: '#D97706' },
        ].map(q => (
          <button key={q.label} className="dash-quick-card" onClick={() => navigate(q.path)} style={{ '--qcolor': q.color }}>
            <div className="dash-quick-dot" />
            <div>
              <p className="dash-quick-label">{q.label}</p>
              <p className="dash-quick-desc">{q.desc}</p>
            </div>
            <span className="dash-quick-arrow"><Icon.Arrow /></span>
          </button>
        ))}
      </div>

    </div>
  );
};

export default Dashboard;