/**
 * src/components/Footer.js
 *
 * Slim single-line footer — only shown when user is logged in.
 * Copyright left, policy links right.
 * Returns null on auth pages so it doesn't appear below the login form.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from './UserContext';
import './Footer.css';

const Footer = ({ companyName = 'Suites System' }) => {
  const { user }    = useUser();
  const currentYear = new Date().getFullYear();

  // Don't render the footer on public/auth pages (sign-in, sign-up, etc.)
  if (!user) return null;

  return (
    <footer className="app-footer">
      <span className="footer-copy">
        &copy; {currentYear} {companyName}. All rights reserved.
      </span>
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
