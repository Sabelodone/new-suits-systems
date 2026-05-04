/**
 * src/components/Dashboard.js
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT WAS BROKEN — WHY ALL NUMBERS SHOWED ZERO:
 *
 *   The previous Dashboard.js had two separate problems:
 *
 *   1. HARDCODED MOCK DATA — the component never called the API at all.
 *      STATS and RECENT_CASES were plain JavaScript arrays defined at the top
 *      of the file with fake numbers (24 active cases, 156 clients, etc.).
 *      No useEffect, no axios, no real data. This is why the dashboard always
 *      showed 0 after we replaced those arrays with the loading-state defaults.
 *
 *   2. 403 ON EVERY REQUEST — even if a useEffect was added, all requests
 *      would have failed with 403 because:
 *        a) settings.py had SessionAuthentication before JWTAuthentication
 *        b) Django session cookies were being picked up and CSRF enforced
 *        c) React frontend never sends CSRF tokens → 403 Forbidden
 *      This is fixed in settings.py (JWT moved to first position).
 *
 * WHAT THIS FILE NOW DOES:
 *    useEffect runs on mount, calls GET /cases/ and GET /clients/ in parallel
 *    api.js handles JWT + X-Tenant-Code headers automatically
 *    KPI cards derive real numbers from the live API response
 *    Recent Cases table shows real data (code, title, client_name, status)
 *    Shimmer skeleton shown while data is loading
 *    Friendly error message with Retry button if the API call fails
 *    Welcome message uses the real user's first_name from UserContext
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';
import { useNavigate }                from 'react-router-dom';
import { useUser }                    from './UserContext';
import api                            from '../services/api';
import './Dashboard.css';

// ── Inline SVG icons (no external library) ────────────────────────────────────
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

// ── Status normaliser ─────────────────────────────────────────────────────────
// The backend stores the current workflow step name as `status` (e.g.
// "Initial Consultation", "Document Review"). We bucket these into three
// display categories so filters and badge colours work consistently.
function normaliseStatus(raw = '') {
  const lower = raw.toLowerCase();
  if (lower === 'closed'   || lower.includes('complete') || lower.includes('done'))    return 'Closed';
  if (lower === 'pending'  || lower.includes('pending')  || lower.includes('review'))  return 'Pending';
  if (lower === 'open'     || lower === 'active')                                       return 'Active';
  // Anything else (workflow step names) is treated as Active
  return 'Active';
}

// ── Status badge colour map ───────────────────────────────────────────────────
const STATUS_COLORS = {
  Active:  { bg: '#DCFCE7', text: '#166534' },
  OPEN:    { bg: '#DCFCE7', text: '#166534' },
  Pending: { bg: '#FEF9C3', text: '#854D0E' },
  Closed:  { bg: '#F1F5F9', text: '#475569' },
  CLOSED:  { bg: '#F1F5F9', text: '#475569' },
};

// ── Skeleton shimmer block ───────────────────────────────────────────────────
// Shows a grey animated block while real data is loading.
// aria-hidden="true" hides it from screen readers.
const Skeleton = ({ width = '100%', height = 16, radius = 6 }) => (
  <div
    className="dash-skeleton"
    style={{ width, height, borderRadius: radius }}
    aria-hidden="true"
  />
);

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Component
// ─────────────────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate     = useNavigate();
  const { user }     = useUser();   // Gives us the logged-in user (first_name, etc.)

  // ── State ──────────────────────────────────────────────────────────────────
  const [cases,        setCases]        = useState([]);
  const [clients,      setClients]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  // ── Data fetch ─────────────────────────────────────────────────────────────
  // Runs once when the dashboard mounts.
  // `api` is our axios instance from services/api.js — it automatically
  // attaches Authorization: Bearer <token> and X-Tenant-Code: <code>
  // headers to every request via its request interceptor.
  useEffect(() => {
    let cancelled = false;  // Guards against state updates on unmounted component

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fire both requests at the same time — no need to wait for one before
        // starting the other. Promise.all waits for both to finish.
        const [casesRes, clientsRes] = await Promise.all([
          api.get('/cases/'),
          api.get('/clients/'),
        ]);

        if (!cancelled) {
          // casesRes.data and clientsRes.data are the parsed JSON arrays
          setCases(casesRes.data);
          setClients(clientsRes.data);
        }
      } catch (err) {
        if (!cancelled) {
          // api.js already handles 401 (token refresh) and 403 (redirect to signin).
          // Any error reaching here is a real network/server problem.
          setError(err.message || 'Failed to load dashboard data. Check your connection.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    // Cleanup function: if the user navigates away before the fetch finishes,
    // we set cancelled = true so the setState calls don't run on unmounted component.
    return () => { cancelled = true; };
  }, []); // Empty dependency array = run once on mount only

  // ── KPI calculations ───────────────────────────────────────────────────────
  // All numbers are derived from the live data arrays.
  // If loading is true, we still calculate (they'll be 0) and show skeletons.
  const activeCases  = cases.filter(c => normaliseStatus(c.status) === 'Active').length;
  const pendingCases = cases.filter(c => normaliseStatus(c.status) === 'Pending').length;
  const closedCases  = cases.filter(c => normaliseStatus(c.status) === 'Closed').length;

  // Success rate = closed cases / total cases, expressed as a percentage.
  // Guard against division by zero when there are no cases yet.
  const successRate = cases.length > 0
    ? Math.round((closedCases / cases.length) * 100)
    : 0;

  // KPI cards configuration — value and change are derived from real data above
  const STATS = [
    {
      label:  'Active Cases',
      value:  activeCases,
      change: `${pendingCases} pending`,
      icon:   Icon.Briefcase,
      color:  '#2563EB',
    },
    {
      label:  'Total Clients',
      value:  clients.length,
      change: 'All time',
      icon:   Icon.Users,
      color:  '#059669',
    },
    {
      label:  'Pending Cases',
      value:  pendingCases,
      change: pendingCases > 0 ? 'Need attention' : 'All clear',
      icon:   Icon.CheckCircle,
      color:  '#7C3AED',
    },
    {
      label:  'Success Rate',
      value:  `${successRate}%`,
      change: `${closedCases} closed`,
      icon:   Icon.TrendUp,
      color:  '#D97706',
    },
  ];

  // ── Filter logic for the Recent Cases table ──────────────────────────────
  const FILTER_TABS = ['All', 'Active', 'Pending', 'Closed'];

  // Show up to 20 cases in the dashboard table; the full list lives on /cases
  const displayCases = cases.slice(0, 20);
  const filteredCases = activeFilter === 'All'
    ? displayCases
    : displayCases.filter(c => normaliseStatus(c.status) === activeFilter);

  // ── Welcome name ──────────────────────────────────────────────────────────
  const firstName = user?.first_name || user?.username || 'there';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="dash-page">

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Dashboard</h1>
          <p className="dash-subtitle">Welcome back, {firstName}</p>
        </div>
        <button
          className="dash-btn-new"
          onClick={() => navigate('/create-case')}
          aria-label="Open a new case"
        >
          <span className="dash-btn-icon"><Icon.Plus /></span>
          New Case
        </button>
      </div>

      {/* ── Error banner (only shown when fetch fails) ─────────────────── */}
      {error && (
        <div className="dash-error" role="alert">
          <span><strong>Could not load data:</strong> {error}</span>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {/* ── KPI Stat cards ───────────────────────────────────────────────── */}
      <div className="dash-stats">
        {STATS.map((stat, i) => {
          const Ico = stat.icon;
          return (
            <div
              className="dash-stat-card"
              key={i}
              style={{ '--accent': stat.color }}
            >
              <div className="dash-stat-icon"><Ico /></div>
              <div className="dash-stat-body">

                {/* Show skeleton while loading, real value when done */}
                {loading
                  ? <Skeleton width={60} height={28} radius={6} />
                  : <span className="dash-stat-value">{stat.value}</span>
                }

                <span className="dash-stat-label">{stat.label}</span>

                {loading
                  ? <Skeleton width={80} height={12} radius={4} />
                  : <span className="dash-stat-change">{stat.change}</span>
                }

              </div>
            </div>
          );
        })}
      </div>

      {/* ── Recent Cases section ──────────────────────────────────────────── */}
      <div className="dash-section">

        {/* Section header: title + filter tabs + view-all button */}
        <div className="dash-section-header">
          <h2 className="dash-section-title">Recent Cases</h2>

          {/* Filter tabs: All / Active / Pending / Closed */}
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

          <button className="dash-view-all" onClick={() => navigate('/cases')}>
            View all <Icon.Arrow />
          </button>
        </div>

        {/* Cases table */}
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

              {/* Loading skeleton rows — 4 placeholder rows */}
              {loading && Array.from({ length: 4 }).map((_, i) => (
                <tr key={`skel-${i}`}>
                  {[70, 150, 110, 70, 90, 20].map((w, j) => (
                    <td key={j}><Skeleton width={w} height={14} /></td>
                  ))}
                </tr>
              ))}

              {/* Real data rows */}
              {!loading && filteredCases.map(c => {
                const normStatus = normaliseStatus(c.status);
                const sc = STATUS_COLORS[normStatus] || STATUS_COLORS.Active;
                return (
                  <tr
                    key={c.id}
                    className="dash-table-row"
                    onClick={() => navigate('/cases')}
                    title="Click to open cases list"
                  >
                    <td className="dash-td-id">{c.code}</td>
                    <td className="dash-td-client">{c.title}</td>
                    <td>{c.client_name || '—'}</td>
                    <td>
                      <span
                        className="dash-badge"
                        style={{ background: sc.bg, color: sc.text }}
                      >
                        {normStatus}
                      </span>
                    </td>
                    <td>{c.start_date || '—'}</td>
                    <td className="dash-td-arrow"><Icon.Arrow /></td>
                  </tr>
                );
              })}

              {/* Empty state — no data after filtering */}
              {!loading && filteredCases.length === 0 && !error && (
                <tr>
                  <td colSpan={6} className="dash-empty">
                    {cases.length === 0
                      ? 'No cases found. Open your first case to get started.'
                      : `No ${activeFilter.toLowerCase()} cases.`
                    }
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
          { label: 'Open a Case',  desc: 'Start a new client file',    path: '/create-case',         color: '#2563EB' },
          { label: 'Add a Task',   desc: 'Log tasks and to-dos',       path: '/tasks',               color: '#7C3AED' },
          { label: 'Upload Docs',  desc: 'Attach documents to cases',  path: '/document-management', color: '#059669' },
          { label: 'Time Log',     desc: 'Record billable hours',      path: '/time-management',     color: '#D97706' },
        ].map(q => (
          <button
            key={q.label}
            className="dash-quick-card"
            onClick={() => navigate(q.path)}
            style={{ '--qcolor': q.color }}
          >
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
