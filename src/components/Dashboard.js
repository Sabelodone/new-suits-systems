/**
 * src/components/Dashboard.js
 * ─────────────────────────────────────────────────────────────
 * Main dashboard — pulls real numbers from the backend.
 *
 * Changes from old version:
 *  Stat cards show real case/client counts from the API
 *  Charts still render (they use the live data once loaded)
 *  Loading skeleton on first paint
 *  Error handling — partial failure doesn't break the page
 *  Removed the chatbot toggle (it lives in Chatbot.js independently)
 * ─────────────────────────────────────────────────────────────
 */

/**
 * Second Changes
 */

// Dashboard.js
// 📊 Clean professional dashboard matching the design image:
// - Stats row (4 KPI cards)
// - Recent cases table
// - Quick-action cards
// - Blue accents throughout, white cards, light blue (#EFF6FF) backgrounds
// All logic (charts removed — replaced with lightweight stat cards) ✅

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

// ── Inline SVG icons ────────────────────────────────────
// (No external icon library needed)
const Icon = {
  Briefcase: () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.8"/>
      <line x1="2" y1="13" x2="22" y2="13" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="17" cy="8" r="3" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M21 20c0-3.3-2.7-6-6-6" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Arrow: () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
};

// ── KPI stat cards data ─────────────────────────────────
const STATS = [
  { label: 'Active Cases',     value: '24',  change: '+3 this week', icon: Icon.Briefcase,  color: '#2563EB' },
  { label: 'Total Clients',    value: '156', change: '+12 new',      icon: Icon.Users,       color: '#059669' },
  { label: 'Tasks Complete',   value: '12',  change: '4 pending',    icon: Icon.CheckCircle, color: '#7C3AED' },
  { label: 'Avg. Resolution',  value: '80%', change: 'Up from 74%',  icon: Icon.Clock,       color: '#D97706' },
];

// ── Recent cases mock data ──────────────────────────────
// Replace with real API data using useEffect + axios
const RECENT_CASES = [
  { id: 'C-001', client: 'John Smith',  type: 'Litigation',    status: 'Active',   date: '2024-08-22' },
  { id: 'C-002', client: 'Jane Doe',    type: 'Family Law',    status: 'Pending',  date: '2024-08-20' },
  { id: 'C-003', client: 'Acme Corp',   type: 'Corporate',     status: 'Closed',   date: '2024-08-18' },
  { id: 'C-004', client: 'Bob Marley',  type: 'Criminal',      status: 'Active',   date: '2024-08-15' },
  { id: 'C-005', client: 'Sara Connor', type: 'Employment',    status: 'Active',   date: '2024-08-10' },
];

// ── Status badge colour map ─────────────────────────────
const STATUS_COLORS = {
  Active:  { bg: '#DCFCE7', text: '#166534' },
  Pending: { bg: '#FEF9C3', text: '#854D0E' },
  Closed:  { bg: '#F1F5F9', text: '#475569' },
};

// ────────────────────────────────────────────────────────
// Dashboard component
// ────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');

  const filters  = ['All', 'Active', 'Pending', 'Closed'];
  const filtered = activeFilter === 'All'
    ? RECENT_CASES
    : RECENT_CASES.filter(c => c.status === activeFilter);

  return (
    <div className="dash-page">

      {/* ── Page header ───────────────────────────── */}
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Dashboard</h1>
          <p className="dash-subtitle">Welcome back — here's what's happening today.</p>
        </div>
        {/* New Case button — top right like in design */}
        <button
          className="dash-btn-new"
          onClick={() => navigate('/create-case')}
          aria-label="Open a new case"
        >
          <span className="dash-btn-icon"><Icon.Plus /></span>
          New Case
        </button>
      </div>

      {/* ── KPI stat cards row ────────────────────── */}
      <div className="dash-stats">
        {STATS.map((stat, i) => {
          const Ico = stat.icon;
          return (
            <div className="dash-stat-card" key={i}
              style={{ '--accent': stat.color }}>
              {/* Coloured icon container */}
              <div className="dash-stat-icon">
                <Ico />
              </div>
              <div className="dash-stat-body">
                <span className="dash-stat-value">{stat.value}</span>
                <span className="dash-stat-label">{stat.label}</span>
                <span className="dash-stat-change">{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Recent cases table ────────────────────── */}
      <div className="dash-section">
        <div className="dash-section-header">
          <h2 className="dash-section-title">Recent Cases</h2>

          {/* Filter tabs */}
          <div className="dash-filters" role="tablist">
            {filters.map(f => (
              <button
                key={f}
                role="tab"
                aria-selected={activeFilter === f}
                className={`dash-filter ${activeFilter === f ? 'dash-filter--active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {/* View all link */}
          <button
            className="dash-view-all"
            onClick={() => navigate('/cases')}
          >
            View all <Icon.Arrow />
          </button>
        </div>

        {/* Table */}
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Client</th>
                <th>Type</th>
                <th>Status</th>
                <th>Opened</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const sc = STATUS_COLORS[c.status] || STATUS_COLORS.Closed;
                return (
                  <tr key={c.id} className="dash-table-row"
                    onClick={() => navigate('/cases')}
                    title="Click to view case">
                    <td className="dash-td-id">{c.id}</td>
                    <td className="dash-td-client">{c.client}</td>
                    <td>{c.type}</td>
                    <td>
                      {/* Coloured status badge */}
                      <span
                        className="dash-badge"
                        style={{ background: sc.bg, color: sc.text }}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td>{c.date}</td>
                    <td className="dash-td-arrow">
                      <Icon.Arrow />
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="dash-empty">
                    No {activeFilter.toLowerCase()} cases found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Quick actions ─────────────────────────── */}
      <div className="dash-quick">
        {[
          { label: 'Open a Case',    desc: 'Start a new client file',          path: '/create-case',        color: '#2563EB' },
          { label: 'Add a Task',     desc: 'Log tasks and to-dos',             path: '/tasks',              color: '#7C3AED' },
          { label: 'Upload Docs',    desc: 'Attach documents to cases',        path: '/document-management',color: '#059669' },
          { label: 'Time Log',       desc: 'Record billable hours',            path: '/time-management',    color: '#D97706' },
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