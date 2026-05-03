/**
 * src/components/Header.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Top application header — matches the design screenshot:
 *
 *   [ ● Suites System ]   [ ← back? ]   [ 🔍 Search... ]   [ ? ] [ 🔔 ] [ Avatar  W.Sarah ]
 *
 * WHAT CHANGED vs old version:
 *   ✅ Brand: "● Suites System" blue dot + name (matching screenshot)
 *   ✅ Search bar: centred, clean, full-width input with search icon
 *   ✅ Right section: Help icon, Bell (notifications), Avatar + user name
 *   ✅ Avatar shows initials derived from user.first_name + user.last_name
 *   ✅ Clicking avatar opens a small dropdown with Profile and Sign Out
 *   ✅ Mobile: hamburger drawer with full nav links (unchanged behaviour)
 *   ✅ Removed Bootstrap Navbar dependency — plain HTML/CSS for cleaner styling
 *   ✅ Removed duplicate CSS import
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate }                from 'react-router-dom';
import { useUser }                             from './UserContext';
import './Header.css';

// ── Inline icon components (no library dependency) ─────────────────────────
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="11" cy="11" r="7"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
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

// ── Nav items for the mobile drawer (mirrors Sidebar) ─────────────────────
const NAV_ITEMS = [
  { to: '/dashboard',           label: 'Dashboard'  },
  { to: '/cases',               label: 'Cases'      },
  { to: '/clients',             label: 'Clients'    },
  { to: '/tasks',               label: 'Tasks'      },
  { to: '/time-management',     label: 'Calendar'   },
  { to: '/document-management', label: 'Documents'  },
  { to: '/legal-templates',     label: 'Templates'  },
  { to: '/settings',            label: 'Settings'   },
];

// ── Main component ─────────────────────────────────────────────────────────
const Header = () => {
  const { user, signOut }       = useUser();
  const navigate                = useNavigate();
  const [search, setSearch]     = useState('');
  const [drawerOpen, setDrawer] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef                 = useRef(null);

  // Build display initials: "Sarah Wilson" → "SW"
  const initials =
    [user?.first_name, user?.last_name]
      .filter(Boolean)
      .map(n => n.charAt(0).toUpperCase())
      .join('') ||
    user?.username?.charAt(0).toUpperCase() ||
    'U';

  // Display name next to avatar: "W.Sarah" style from screenshot
  // → First initial + "." + first_name, or username fallback
  const displayName = user
    ? user.last_name
      ? `${user.last_name.charAt(0)}.${user.first_name || user.username}`
      : user.username
    : '';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = () => {
    setDropOpen(false);
    signOut();
    navigate('/signin');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: wire to global search endpoint
    console.log('Search:', search);
  };

  return (
    <>
      <header className="app-header">

        {/* ── Left: brand + optional mobile menu ── */}
        <div className="header-left">
          {/* Mobile hamburger — only visible below md breakpoint */}
          <button
            className="header-menu-btn d-md-none"
            onClick={() => setDrawer(true)}
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>

          {/* Brand mark — blue dot + name */}
          <div
            className="header-brand"
            role="button"
            onClick={() => navigate(user ? '/dashboard' : '/')}
            aria-label="Go to dashboard"
          >
            <span className="header-brand-dot" />
            <span className="header-brand-name">Suites System</span>
          </div>
        </div>

        {/* ── Centre: search bar (only when logged in) ── */}
        {user && (
          <form
            className="header-search"
            onSubmit={handleSearch}
            role="search"
          >
            <span className="header-search-icon"><SearchIcon /></span>
            <input
              type="text"
              className="header-search-input"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search"
            />
          </form>
        )}

        {/* ── Right: action icons + avatar ── */}
        <div className="header-right">
          {user ? (
            <>
              {/* Help button */}
              <button className="header-icon-btn" aria-label="Help">
                <HelpIcon />
              </button>

              {/* Notifications bell */}
              <button className="header-icon-btn" aria-label="Notifications">
                <BellIcon />
                {/* Notification dot — remove when no unread notifications */}
                <span className="header-notif-dot" />
              </button>

              {/* Avatar dropdown */}
              <div className="header-avatar-wrap" ref={dropRef}>
                <button
                  className="header-avatar-btn"
                  onClick={() => setDropOpen(o => !o)}
                  aria-expanded={dropOpen}
                  aria-haspopup="true"
                  aria-label="User menu"
                >
                  <span className="header-avatar">{initials}</span>
                  <span className="header-displayname">{displayName}</span>
                </button>

                {/* Dropdown menu */}
                {dropOpen && (
                  <div className="header-dropdown" role="menu">
                    <div className="header-dropdown-info">
                      <strong>{user.first_name} {user.last_name}</strong>
                      <span>{user.email}</span>
                      {user.tenant_name && (
                        <span className="header-dropdown-firm">
                          {user.tenant_name}
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
            /* Not logged in — show Sign In link */
            <button
              className="header-signin-btn"
              onClick={() => navigate('/signin')}
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* ── Mobile nav drawer ── */}
      {drawerOpen && (
        <div className="header-drawer-overlay" onClick={() => setDrawer(false)}>
          <nav
            className="header-drawer"
            onClick={(e) => e.stopPropagation()} /* prevent overlay click closing on inner tap */
          >
            <div className="header-drawer-top">
              <span className="header-brand-name">Suites System</span>
              <button
                className="header-icon-btn"
                onClick={() => setDrawer(false)}
                aria-label="Close menu"
              >
                <CloseIcon />
              </button>
            </div>

            {NAV_ITEMS.map(({ to, label }) => (
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

            {user && (
              <button
                className="header-drawer-signout"
                onClick={handleSignOut}
              >
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