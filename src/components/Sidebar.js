/**
 * src/components/Sidebar.js
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT WAS BROKEN — DOUBLE COL NESTING:
 *
 *   Old code:  return ( <Col md={2} className="sidebar ..."> ... </Col> )
 *
 *   App.js wraps Sidebar in its OWN <Col md={2}>:
 *     <Col md={2} className="p-0">
 *       <Sidebar />           ← Sidebar then renders another <Col md={2}>
 *     </Col>
 *
 *   Bootstrap's grid calculates column widths relative to the parent.
 *   md={2} inside an md={2} = roughly 16% of 16% of the viewport.
 *   This made the sidebar a tiny sliver and pushed all content off-screen.
 *
 * WHAT WAS FIXED:
 *    Removed <Col> entirely from Sidebar.
 *    Sidebar now renders a plain <aside> element that fills whatever
 *      container App.js gives it (the <Col md={2}> App.js already provides).
 *    Removed FontAwesome dependency — replaced with inline SVG icons.
 *      (FontAwesome requires a separate npm install that may not be done
 *      in every environment, causing silent "icon not found" blanks.)
 *    Active link gets a solid blue background + white text (matches design).
 *    Firm name badge shown when user.tenant_name is present.
 *    User initials avatar and role label at the bottom.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUser } from './UserContext';
import './Sidebar.css';

// ── Navigation items ──────────────────────────────────────────────────────────
// Each item has a route (to), display label, and an inline SVG icon.
// Inline SVGs use stroke="currentColor" so they inherit the link's text colour
// — white when active (blue bg), grey/dark when inactive.
const NAV_ITEMS = [
  {
    to:    '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M8 12l3 3 5-5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    to:    '/time-management',
    label: 'Calendar',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <line x1="3"  y1="9"  x2="21" y2="9"/>
        <line x1="9"  y1="21" x2="9"  y2="9"/>
      </svg>
    ),
  },
  {
    to:    '/settings',
    label: 'Settings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33
          1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06
          a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09
          A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9
          4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06
          a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09
          a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
const Sidebar = () => {
  const { user } = useUser();

  // Build the user's initials for the avatar circle.
  // "Sarah Wilson" → "SW", "abigailcox1601" → "A" (first char of username)
  const initials =
    [user?.first_name, user?.last_name]
      .filter(Boolean)
      .map(n => n.charAt(0).toUpperCase())
      .join('') ||
    user?.username?.charAt(0).toUpperCase() ||
    'U';

  // Role label for the bottom strip
  const roleLabel =
    user?.is_superuser ? 'Super Admin'
    : user?.is_staff   ? 'Admin'
    :                    'Attorney';

  return (
    // <aside> fills the <Col md={2}> that App.js provides.
    // NO <Col> here — App.js already handles the column.
    <aside className="sidebar">

      {/* ── Firm / tenant name badge ── */}
      {/* Only shows for firm users who have a tenant. Admins have no tenant. */}
      {user?.tenant_name && (
        <div className="sidebar-tenant">
          <span className="sidebar-tenant-dot" />
          {user.tenant_name}
        </div>
      )}

      {/* ── Navigation links ── */}
      <nav className="sidebar-nav" aria-label="Main navigation">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            // React Router's NavLink passes { isActive } to the className function.
            // We use it to append the --active modifier class.
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' sidebar-link--active' : ''}`
            }
            aria-label={label}
          >
            <span className="sidebar-link-icon" aria-hidden="true">{icon}</span>
            <span className="sidebar-link-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── Bottom user strip ── */}
      {user && (
        <div className="sidebar-user">
          <div className="sidebar-user-avatar" aria-hidden="true">
            {initials}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">
              {user.first_name
                ? `${user.first_name} ${user.last_name || ''}`.trim()
                : user.username}
            </span>
            <span className="sidebar-user-role">{roleLabel}</span>
          </div>
        </div>
      )}

    </aside>
  );
};

export default Sidebar;
