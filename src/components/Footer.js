/**
 * src/components/Footer.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Application footer — clean, minimal, professional.
 *
 * WHAT CHANGED:
 *   ✅ Simplified to a slim one-line footer (matches modern SaaS tools —
 *      no giant footer blocks on an internal app)
 *   ✅ Shows copyright + company name on the left
 *   ✅ Shows Privacy Policy + Terms links on the right
 *   ✅ Social icons removed (not appropriate for a legal B2B app)
 *   ✅ No longer requires props — uses defaults from Footer.defaultProps
 *   ✅ Hidden when user is not logged in (controlled by CSS class)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from './UserContext';
import './Footer.css';

const Footer = ({
  companyName = 'Suites System',
}) => {
  const { user }       = useUser();
  const currentYear    = new Date().getFullYear();

  // Don't render the footer on auth pages (user is null before login)
  if (!user) return null;

  return (
    <footer className="app-footer">
      {/* Left: copyright notice */}
      <span className="footer-copy">
        &copy; {currentYear} {companyName}. All rights reserved.
      </span>

      {/* Right: policy links */}
      <div className="footer-links">
        <Link to="/terms-and-conditions" className="footer-link">
          Terms of Service
        </Link>
        <span className="footer-sep" aria-hidden="true">·</span>
        <a href="/privacy-policy" className="footer-link">
          Privacy Policy
        </a>
      </div>
    </footer>
  );
};

export default Footer;