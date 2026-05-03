/**
 * src/components/Dashboard.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Main dashboard — pulls REAL data from the backend API.
 *
 * WHAT CHANGED vs old version:
 *   ✅ useEffect now fetches /cases/ and /clients/ on mount using the
 *      central `api` axios instance (which already attaches the JWT token
 *      and X-Tenant-Code header automatically via its interceptors).
 *
 *   ✅ Stat cards derive counts from the live API response:
 *      - Active Cases   → cases where status is not "CLOSED" or "Closed"
 *      - Total Clients  → total clients array length
 *      - Pending Tasks  → cases where status includes "Pending" (proxy for now)
 *      - Case Success   → ratio of closed to total cases (percentage)
 *
 *   ✅ Recent Cases table shows real case data (title, client_name, status,
 *      start_date) — `client_name` is now returned by the backend serializer.
 *
 *   ✅ Admin users (is_staff / is_superuser) see all cases across all firms.
 *      Firm users see only their firm's data — enforced by the backend.
 *
 *   ✅ Loading skeleton and error state included.
 *   ✅ Welcome message uses the logged-in user's real first_name.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';
import { useNavigate }                from 'react-router-dom';
import { useUser }                    from './UserContext';
import api                            from '../services/api';
import './Dashboard.css';

// ── Inline SVG icon set (no external library) ──────────────────────────────
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

// ── Status badge colour map ─────────────────────────────────────────────────
// Maps a case status string to background and text colours
const STATUS_COLORS = {
  Active:  { bg: '#DCFCE7', text: '#166534' },
  OPEN:    { bg: '#DCFCE7', text: '#166534' },
  Pending: { bg: '#FEF9C3', text: '#854D0E' },
  Closed:  { bg: '#F1F5F9', text: '#475569' },
  CLOSED:  { bg: '#F1F5F9', text: '#475569' },
};

// Fallback for statuses not in the map
const defaultStatus = { bg: '#E5E7EB', text: '#374151' };

// ── Helper: derive a simple display status ──────────────────────────────────
// The backend stores the workflow step name in `status`, e.g. "Initial Consultation".
// We normalise it to Active / Closed / Pending for the badge.
function normaliseStatus(raw = '') {
  const lower = raw.toLowerCase();
  if (lower.includes('close') || lower.includes('done') || lower.includes('complete')) return 'Closed';
  if (lower.includes('pending') || lower.includes('review'))                           return 'Pending';
  return 'Active';
}

// ── Skeleton placeholder (shown while loading) ──────────────────────────────
const Skeleton = ({ width = '100%', height = 16, radius = 6 }) => (
  <div
    className="dash-skeleton"
    style={{ width, height, borderRadius: radius }}
    aria-hidden="true"
  />
);

// ── Main component ──────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate          = useNavigate();
  const { user }          = useUser();

  // Data states
  const [cases,   setCases]   = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // Filter tab state for the Recent Cases table
  const [activeFilter, setActiveFilter] = useState('All');

  // ── Fetch data on mount ───────────────────────────────────────────────────
  // `api` (from services/api.js) automatically:
  //   - adds Authorization: Bearer <token>
  //   - adds X-Tenant-Code: <stored tenantCode>
  //   - handles 401 → token refresh → retry
  useEffect(() => {
    let cancelled = false; // Prevents state update if component unmounts

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // Run both requests in parallel for speed
        const [casesRes, clientsRes] = await Promise.all([
          api.get('/cases/'),
          api.get('/clients/'),
        ]);

        if (!cancelled) {
          setCases(casesRes.data);
          setClients(clientsRes.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load dashboard data.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    // Cleanup: if the component unmounts before the fetch completes,
    // we don't try to set state on an unmounted component.
    return () => { cancelled = true; };
  }, []); // Empty array → runs once when the dashboard mounts

  // ── Derive KPI stats from real data ────────────────────────────────────────
  const activeCases  = cases.filter(c => normaliseStatus(c.status) === 'Active').length;
  const closedCases  = cases.filter(c => normaliseStatus(c.status) === 'Closed').length;
  const pendingCases = cases.filter(c => normaliseStatus(c.status) === 'Pending').length;
  const successRate  = cases.length > 0
    ? Math.round((closedCases / cases.length) * 100)
    : 0;

  const STATS = [
    {
      label:  'Active Cases',
      value:  loading ? '—' : activeCases,
      change: loading ? '' : `${pendingCases} pending`,
      icon:   Icon.Briefcase,
      color:  '#2563EB',
    },
    {
      label:  'Total Clients',
      value:  loading ? '—' : clients.length,
      change: loading ? '' : 'All time',
      icon:   Icon.Users,
      color:  '#059669',
    },
    {
      label:  'Pending Cases',
      value:  loading ? '—' : pendingCases,
      change: loading ? '' : 'Need attention',
      icon:   Icon.CheckCircle,
      color:  '#7C3AED',
    },
    {
      label:  'Success Rate',
      value:  loading ? '—' : `${successRate}%`,
      change: loading ? '' : `${closedCases} closed`,
      icon:   Icon.TrendUp,
      color:  '#D97706',
    },
  ];

  // ── Filter Recent Cases for the table ─────────────────────────────────────
  const filters = ['All', 'Active', 'Pending', 'Closed'];
  const recentCases = cases.slice(0, 20); // Cap at 20 rows for the dashboard
  const filteredCases = activeFilter === 'All'
    ? recentCases
    : recentCases.filter(c => normaliseStatus(c.status) === activeFilter);

  // ── Welcome greeting ───────────────────────────────────────────────────────
  const firstName = user?.first_name || user?.username || 'there';

  return (
    <div className="dash-page">

      {/* ── Page header ─────────────────────────────────────────────── */}
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

      {/* ── Error banner ────────────────────────────────────────────── */}
      {error && (
        <div className="dash-error" role="alert">
          <strong>Could not load data:</strong> {error}
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {/* ── KPI stat cards ──────────────────────────────────────────── */}
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
                {loading
                  ? <Skeleton width={60} height={28} />
                  : <span className="dash-stat-value">{stat.value}</span>
                }
                <span className="dash-stat-label">{stat.label}</span>
                {loading
                  ? <Skeleton width={80} height={12} />
                  : <span className="dash-stat-change">{stat.change}</span>
                }
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Recent Cases table ──────────────────────────────────────── */}
      <div className="dash-section">
        <div className="dash-section-header">
          <h2 className="dash-section-title">Recent Cases</h2>

          {/* Filter tabs: All / Active / Pending / Closed */}
          <div className="dash-filters" role="tablist">
            {filters.map(f => (
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
              {/* Loading state: show skeleton rows */}
              {loading && Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {[80, 160, 120, 70, 90, 20].map((w, j) => (
                    <td key={j}><Skeleton width={w} /></td>
                  ))}
                </tr>
              ))}

              {/* Real data rows */}
              {!loading && filteredCases.map(c => {
                const normStatus = normaliseStatus(c.status);
                const sc = STATUS_COLORS[normStatus] || defaultStatus;
                return (
                  <tr
                    key={c.id}
                    className="dash-table-row"
                    onClick={() => navigate('/cases')}
                    title="Click to view case"
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

              {/* Empty state */}
              {!loading && filteredCases.length === 0 && (
                <tr>
                  <td colSpan={6} className="dash-empty">
                    {error
                      ? 'Data unavailable — check your connection.'
                      : `No ${activeFilter === 'All' ? '' : activeFilter.toLowerCase() + ' '}cases found.`
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Quick actions row ───────────────────────────────────────── */}
      <div className="dash-quick">
        {[
          { label: 'Open a Case',  desc: 'Start a new client file',     path: '/create-case',         color: '#2563EB' },
          { label: 'Add a Task',   desc: 'Log tasks and to-dos',        path: '/tasks',               color: '#7C3AED' },
          { label: 'Upload Docs',  desc: 'Attach documents to a case',  path: '/document-management', color: '#059669' },
          { label: 'Time Log',     desc: 'Record billable hours',       path: '/time-management',     color: '#D97706' },
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