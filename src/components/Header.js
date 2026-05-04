/**
 * src/components/Header.js
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT THIS COMPONENT DOES:
 *
 *   Top application bar — rendered on every page (auth and protected).
 *   Layout (left → centre → right) matches the design screenshot:
 *
 *     [ ● Suits System ]   [ 🔍 Search... ]   [ ? ] [ 🔔● ] [ Avatar  W.Sarah ▾ ]
 *
 *   FEATURES:
 *    Brand: blue dot + "Suits System" — clicking navigates to dashboard/home
 *    Search bar: pill-shaped, centred, grows to fill available space
 *    Help icon, notification bell with unread dot, avatar button
 *    Avatar shows initials (first + last name initials, falls back to username[0])
 *    Dropdown: shows full name + email + firm badge, Profile link, Sign Out
 *    Dropdown closes on outside click (useRef + useEffect)
 *    Mobile: hamburger button opens a slide-in drawer with all nav links
 *    All icons are inline SVGs — no FontAwesome or icon library needed
 *    No Bootstrap Navbar — plain HTML gives us full CSS control
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate }                from 'react-router-dom';
import { useUser }                             from './UserContext';
import './Header.css';

// ── Inline SVG icon components ────────────────────────────────────────────────
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const HelpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="9"/>
    <path d="M9 9a3 3 0 1 1 4 2.83A1 1 0 0 0 12 13v1"/>
    <circle cx="12" cy="17" r="0.5" fill="currentColor"/>
  </svg>
);
const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6"  x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6"  x2="6"  y2="18"/>
    <line x1="6"  y1="6"  x2="18" y2="18"/>
  </svg>
);
const ChevronIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M5 7.5L10 12.5L15 7.5"/>
  </svg>
);

// ── Mobile drawer nav items (mirrors Sidebar) ─────────────────────────────────
const DRAWER_NAV = [
  { to: '/dashboard',           label: 'Dashboard'  },
  { to: '/cases',               label: 'Cases'      },
  { to: '/clients',             label: 'Clients'    },
  { to: '/tasks',               label: 'Tasks'      },
  { to: '/time-management',     label: 'Calendar'   },
  { to: '/document-management', label: 'Documents'  },
  { to: '/legal-templates',     label: 'Templates'  },
  { to: '/settings',            label: 'Settings'   },
];

// ── Header Component ──────────────────────────────────────────────────────────
const Header = () => {
  const { user, signOut }       = useUser();
  const navigate                = useNavigate();
  const [search,   setSearch]   = useState('');
  const [drawer,   setDrawer]   = useState(false);   // Mobile drawer open state
  const [dropOpen, setDropOpen] = useState(false);   // Avatar dropdown open state
  const dropRef                 = useRef(null);      // Ref for outside-click detection

  // ── Build display strings from user object ────────────────────────────────
  // Initials: "Sarah Wilson" → "SW", "abigailcox1601" → "A"
  const initials =
    [user?.first_name, user?.last_name]
      .filter(Boolean)
      .map(n => n.charAt(0).toUpperCase())
      .join('') ||
    user?.username?.charAt(0).toUpperCase() ||
    'U';

  // Display name next to avatar: "W.Sarah" style from the design screenshot.
  // Format: last_name initial + "." + first_name (or just username)
  const displayName = user
    ? user.last_name && user.first_name
      ? `${user.last_name.charAt(0)}.${user.first_name}`
      : user.username
    : '';

  // ── Close dropdown when user clicks anywhere outside it ──────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Event handlers ────────────────────────────────────────────────────────
  const handleSignOut = () => {
    setDropOpen(false);
    setDrawer(false);
    signOut();
    navigate('/signin');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: wire to a global search results page or modal
    console.log('Searching for:', search);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ════════════════════════════════════════════════════════════
          Main header bar
          ════════════════════════════════════════════════════════════ */}
      <header className="app-header">

        {/* ── LEFT: hamburger (mobile only) + brand ── */}
        <div className="header-left">
          {/* Hamburger — only visible below md breakpoint via CSS */}
          {user && (
            <button
              className="header-menu-btn"
              onClick={() => setDrawer(true)}
              aria-label="Open navigation menu"
              aria-expanded={drawer}
            >
              <MenuIcon />
            </button>
          )}

          {/* Brand mark */}
          <div
            className="header-brand"
            role="button"
            tabIndex={0}
            onClick={() => navigate(user ? '/dashboard' : '/')}
            onKeyDown={(e) => e.key === 'Enter' && navigate(user ? '/dashboard' : '/')}
            aria-label="Suites System — go to dashboard"
          >
            <span className="header-brand-dot" aria-hidden="true" />
            <span className="header-brand-name">Suites System</span>
          </div>
        </div>

        {/* ── CENTRE: search bar (hidden on auth pages) ── */}
        {user && (
          <form className="header-search" onSubmit={handleSearch} role="search">
            <span className="header-search-icon" aria-hidden="true">
              <SearchIcon />
            </span>
            <input
              type="search"
              className="header-search-input"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search cases, clients, documents"
            />
          </form>
        )}

        {/* ── RIGHT: icons + avatar ── */}
        <div className="header-right">
          {user ? (
            <>
              {/* Help icon */}
              <button className="header-icon-btn" aria-label="Help and support">
                <HelpIcon />
              </button>

              {/* Notification bell with unread indicator dot */}
              <button className="header-icon-btn" aria-label="Notifications">
                <BellIcon />
                <span className="header-notif-dot" aria-label="Unread notifications" />
              </button>

              {/* Avatar + display name — clicking opens dropdown */}
              <div className="header-avatar-wrap" ref={dropRef}>
                <button
                  className="header-avatar-btn"
                  onClick={() => setDropOpen(o => !o)}
                  aria-expanded={dropOpen}
                  aria-haspopup="menu"
                  aria-label={`User menu for ${displayName}`}
                >
                  <span className="header-avatar" aria-hidden="true">{initials}</span>
                  <span className="header-displayname">{displayName}</span>
                  <span className="header-chevron" aria-hidden="true"><ChevronIcon /></span>
                </button>

                {/* ── Dropdown menu ── */}
                {dropOpen && (
                  <div className="header-dropdown" role="menu">

                    {/* User info section */}
                    <div className="header-dropdown-info">
                      <strong>
                        {user.first_name
                          ? `${user.first_name} ${user.last_name || ''}`.trim()
                          : user.username}
                      </strong>
                      <span>{user.email}</span>
                      {/* Firm badge — only for firm users */}
                      {user.tenant_name && (
                        <span className="header-dropdown-firm">{user.tenant_name}</span>
                      )}
                      {/* Admin badge — only for staff/superusers */}
                      {(user.is_staff || user.is_superuser) && (
                        <span className="header-dropdown-admin">
                          {user.is_superuser ? 'Super Admin' : 'Admin'}
                        </span>
                      )}
                    </div>

                    <hr className="header-dropdown-divider" />

                    <button
                      className="header-dropdown-item"
                      role="menuitem"
                      onClick={() => { setDropOpen(false); navigate('/settings'); }}
                    >
                      Profile &amp; Settings
                    </button>
                    <button
                      className="header-dropdown-item header-dropdown-item--danger"
                      role="menuitem"
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Sign In button shown on public pages */
            <button
              className="header-signin-btn"
              onClick={() => navigate('/signin')}
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════
          Mobile drawer (slides in from left on mobile)
          ════════════════════════════════════════════════════════════ */}
      {drawer && (
        // Semi-transparent overlay — clicking it closes the drawer
        <div
          className="header-drawer-overlay"
          onClick={() => setDrawer(false)}
          aria-hidden="true"
        >
          <nav
            className="header-drawer"
            onClick={(e) => e.stopPropagation()} // Prevent overlay click from firing on nav clicks
            aria-label="Mobile navigation"
          >
            {/* Drawer top: brand + close button */}
            <div className="header-drawer-top">
              <span className="header-brand-name">Suites System</span>
              <button
                className="header-icon-btn"
                onClick={() => setDrawer(false)}
                aria-label="Close navigation menu"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Nav links */}
            {DRAWER_NAV.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `header-drawer-link${isActive ? ' header-drawer-link--active' : ''}`
                }
                onClick={() => setDrawer(false)}
              >
                {label}
              </NavLink>
            ))}

            {/* Sign Out at bottom of drawer */}
            {user && (
              <button className="header-drawer-signout" onClick={handleSignOut}>
                Sign Out
              </button>
            )}
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;
