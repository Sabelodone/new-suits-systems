/**
 * src/components/Sidebar.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Left navigation sidebar.
 *
 * WHAT CHANGED:
 *   ✅ Removed the Bootstrap <Col md={2}> wrapper — App.js owns the Col now.
 *      Sidebar renders a plain <nav> / <div> that fills its parent Col.
 *
 *   ✅ Redesigned to match the new look:
 *      - White background, subtle right border
 *      - Active link: solid blue (#2563EB) background with white text
 *      - Inactive links: dark grey text, icon + label, hover state
 *      - Firm name badge shown when user has a tenantCode
 *      - Bottom section shows username + role hint
 *
 *   ✅ All nav destinations match the design screenshot:
 *      Dashboard → Cases → Clients → Tasks → Calendar (time-management)
 *      → Documents → Templates → Settings
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUser } from './UserContext';
import './Sidebar.css';

// ── Navigation items definition ────────────────────────────────────────────
// Each item maps to a route and carries an inline SVG icon.
// Using inline SVGs avoids needing FontAwesome — lightweight and consistent.
const NAV_ITEMS = [
  {
    to:    '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    to:    '/cases',
    label: 'Cases',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        <line x1="2" y1="13" x2="22" y2="13"/>
      </svg>
    ),
  },
  {
    to:    '/clients',
    label: 'Clients',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor">
        <circle cx="9" cy="8" r="3"/>
        <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
        <circle cx="17" cy="8" r="3"/>
        <path d="M21 20c0-3.3-2.7-6-6-6"/>
      </svg>
    ),
  },
  {
    to:    '/tasks',
    label: 'Tasks',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M8 12l3 3 5-5"/>
      </svg>
    ),
  },
  {
    to:    '/time-management',
    label: 'Calendar',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8"  y1="2" x2="8"  y2="6"/>
        <line x1="3"  y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    to:    '/document-management',
    label: 'Documents',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="8" y1="13" x2="16" y2="13"/>
        <line x1="8" y1="17" x2="16" y2="17"/>
      </svg>
    ),
  },
  {
    to:    '/legal-templates',
    label: 'Templates',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <line x1="3" y1="9"  x2="21" y2="9"/>
        <line x1="9" y1="21" x2="9"  y2="9"/>
      </svg>
    ),
  },
  {
    to:    '/settings',
    label: 'Settings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
];

// ── Component ──────────────────────────────────────────────────────────────
const Sidebar = () => {
  const { user } = useUser();

  // Build user initials for the avatar at the bottom
  // e.g. "Sarah Wilson" → "SW"
  const initials = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .map(n => n.charAt(0).toUpperCase())
    .join('') || (user?.username?.charAt(0).toUpperCase() ?? 'U');

  return (
    <aside className="sidebar">

      {/* ── Firm / tenant badge ── */}
      {user?.tenant_name && (
        <div className="sidebar-tenant">
          <span className="sidebar-tenant-dot" />
          {user.tenant_name}
        </div>
      )}

      {/* ── Navigation links ── */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            // NavLink provides `isActive` — we use it to add the active class
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' sidebar-link--active' : ''}`
            }
            aria-label={label}
          >
            {/* Icon container */}
            <span className="sidebar-link-icon">{icon}</span>
            {/* Text label */}
            <span className="sidebar-link-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── Bottom user info strip ── */}
      {user && (
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">
              {user.first_name || user.username}
            </span>
            <span className="sidebar-user-role">
              {user.is_superuser ? 'Super Admin' : user.is_staff ? 'Admin' : 'Attorney'}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;