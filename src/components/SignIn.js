// src/components/SignIn.js
//
// Sign-in page — two-panel layout (blue left, white right form).
//
// ─────────────────────────────────────────────────────────────────────────────
// WHAT WAS FIXED IN THIS VERSION:
//
//  PROBLEM — Admin users couldn't log in:
//    The Firm Code field was shown with no indication it's optional for admins.
//    When an admin left it blank and submitted, authService threw
//    "Firm Code is required" before even hitting the server.
//
//    Fix: Added "Leave blank if you are a system administrator" hint under
//    the Firm Code field. The field is intentionally NOT required (no HTML
//    required attribute) — admins just leave it blank.
//
//  PROBLEM — Generic "500" error shown to users:
//    When the backend crashes at startup (circular import, migration error),
//    the error message was "Request failed with status 500" — unhelpful.
//    authService.js now returns a clear message for 500 errors.
//    SignIn.js passes it straight through to the error banner.
//
//  PROBLEM — "Firm Code does not match" for admin who typed something:
//    If an admin accidentally typed something in the Firm Code field,
//    authService compared it against null (admin has no tenant_code) and
//    threw a mismatch error. Now: if the user is an admin (is_staff/is_superuser),
//    any value in the Firm Code field is simply ignored.
//
//  WHAT STAYED THE SAME:
//    - Two-panel design (blue left, white right)
//    - Username + Password + Firm Code fields
//    - Spinner while loading
//    - Forgot password link
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { useUser } from './UserContext';

// ── Styles (inline — keeps the component self-contained) ─────────────────────
const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f0f4ff',
    padding: '24px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },

  card: {
    display: 'flex',
    width: '100%',
    maxWidth: '900px',
    minHeight: '560px',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(37, 99, 235, 0.15)',
  },

  // ── Left panel ──────────────────────────────────────────────────────────────
  leftPanel: {
    flex: '1',
    background: 'linear-gradient(145deg, #1d4ed8 0%, #2563eb 60%, #3b82f6 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 32px',
    color: '#fff',
    gap: '24px',
  },

  brandName: {
    fontSize: '32px',
    fontWeight: '700',
    letterSpacing: '-0.5px',
    color: '#fff',
    marginBottom: '8px',
  },

  brandTagline: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: '1.6',
    maxWidth: '240px',
  },

  // ── Right panel ─────────────────────────────────────────────────────────────
  rightPanel: {
    flex: '1',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '48px 40px',
    gap: '8px',
  },

  formTitle: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '4px',
  },

  formSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '24px',
  },

  // ── Field groups ─────────────────────────────────────────────────────────────
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '16px',
  },

  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
  },

  input: {
    height: '44px',
    padding: '0 14px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#111827',
    background: '#f9fafb',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    width: '100%',
    boxSizing: 'border-box',
  },

  inputFocus: {
    borderColor: '#2563eb',
    boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.12)',
    background: '#fff',
  },

  // ── Firm Code section ────────────────────────────────────────────────────────
  firmBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '16px',
    padding: '14px',
    background: '#eff6ff',
    borderRadius: '10px',
    border: '1.5px solid #bfdbfe',
  },

  firmLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1e40af',
  },

  firmInput: {
    height: '40px',
    padding: '0 14px',
    border: '1.5px solid #bfdbfe',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1e3a8a',
    background: '#fff',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    fontWeight: '600',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },

  firmInputFocus: {
    borderColor: '#2563eb',
    boxShadow: '0 0 0 3px rgba(37,99,235,0.12)',
  },

  firmHint: {
    fontSize: '11px',
    color: '#3b82f6',
    marginTop: '2px',
    lineHeight: '1.5',
  },

  // ── Admin hint (shown when firm code field is empty) ─────────────────────────
  adminHint: {
    fontSize: '11px',
    color: '#6b7280',
    marginTop: '2px',
    fontStyle: 'italic',
  },

  // ── Submit button ─────────────────────────────────────────────────────────────
  submitBtn: {
    height: '48px',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'background 0.2s',
  },

  submitBtnDisabled: {
    background: '#93c5fd',
    cursor: 'not-allowed',
  },

  // ── Error banner ──────────────────────────────────────────────────────────────
  errorBanner: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#dc2626',
    marginBottom: '12px',
    lineHeight: '1.5',
  },

  // ── Footer ────────────────────────────────────────────────────────────────────
  footer: {
    textAlign: 'center',
    marginTop: '12px',
    fontSize: '13px',
    color: '#6b7280',
  },

  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '500',
  },
};

// ── Courthouse SVG illustration (left panel) ──────────────────────────────────
const LoginIllustration = () => (
  <svg
    viewBox="0 0 240 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: '200px', opacity: 0.9 }}
    aria-hidden="true"
  >
    <rect x="60" y="80" width="120" height="100" rx="4" fill="rgba(255,255,255,0.15)" />
    <rect x="50" y="76" width="140" height="12" rx="3" fill="rgba(255,255,255,0.25)" />
    <rect x="75" y="56" width="90" height="24" rx="3" fill="rgba(255,255,255,0.2)" />
    <rect x="106" y="40" width="28" height="20" rx="2" fill="rgba(255,255,255,0.3)" />
    <rect x="76" y="88" width="10" height="92" rx="2" fill="rgba(255,255,255,0.2)" />
    <rect x="100" y="88" width="10" height="92" rx="2" fill="rgba(255,255,255,0.2)" />
    <rect x="130" y="88" width="10" height="92" rx="2" fill="rgba(255,255,255,0.2)" />
    <rect x="154" y="88" width="10" height="92" rx="2" fill="rgba(255,255,255,0.2)" />
    <rect x="104" y="140" width="32" height="40" rx="4" fill="rgba(255,255,255,0.25)" />
    <rect x="40" y="180" width="160" height="6" rx="2" fill="rgba(255,255,255,0.3)" />
    <rect x="30" y="186" width="180" height="6" rx="2" fill="rgba(255,255,255,0.2)" />
    <circle cx="30" cy="30" r="3" fill="rgba(255,255,255,0.4)" />
    <circle cx="210" cy="50" r="2" fill="rgba(255,255,255,0.4)" />
    <circle cx="200" cy="20" r="4" fill="rgba(255,255,255,0.3)" />
    <circle cx="50" cy="60" r="2" fill="rgba(255,255,255,0.3)" />
  </svg>
);

// ── SignIn component ───────────────────────────────────────────────────────────
function SignIn() {
  const { signIn }   = useUser();
  const navigate     = useNavigate();

  const [username,     setUsername]     = useState('');
  const [password,     setPassword]     = useState('');
  const [firmCode,     setFirmCode]     = useState('');
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Helper: merge base + focused styles
  const inp = (name) => ({
    ...styles.input,
    ...(focusedField === name ? styles.inputFocus : {}),
  });

  const firmInp = (name) => ({
    ...styles.firmInput,
    ...(focusedField === name ? styles.firmInputFocus : {}),
  });

  // ── Form submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // signIn → UserContext → authService.login(username, password, firmCode)
      // firmCode is passed as-is; authService handles:
      //   - admin users: firmCode is ignored (server returns is_staff=true)
      //   - firm users: firmCode is validated against server's tenant_code
      await signIn(username.trim(), password, firmCode.toUpperCase().trim());
      navigate('/dashboard');

    } catch (err) {
      // authService throws Error objects with human-readable messages.
      // We display them directly in the error banner.
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* ── LEFT PANEL ──────────────────────────────────────────────────── */}
        <div style={styles.leftPanel}>
          <div style={styles.brandName}>⚖ Suits</div>
          <LoginIllustration />
          <p style={styles.brandTagline}>
            Legal case management for modern law firms.
            Secure. Organised. Efficient.
          </p>
        </div>

        {/* ── RIGHT PANEL ─────────────────────────────────────────────────── */}
        <div style={styles.rightPanel}>
          <div style={styles.formTitle}>Welcome back</div>
          <div style={styles.formSubtitle}>Sign in to your firm's workspace</div>

          {/* Error banner — shows any login error (wrong password, server down, etc.) */}
          {error && (
            <div style={styles.errorBanner} role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="on" noValidate>

            {/* ── Username / Email ──────────────────────────────────────── */}
            <div style={styles.fieldGroup}>
              <label style={styles.label} htmlFor="username">
                Username or Email
              </label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                style={inp('username')}
                disabled={loading}
                autoComplete="username"
                autoFocus
                required
              />
            </div>

            {/* ── Password ─────────────────────────────────────────────── */}
            <div style={styles.fieldGroup}>
              <label style={styles.label} htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                style={inp('password')}
                disabled={loading}
                autoComplete="current-password"
                required
              />
            </div>

            {/* ── Firm Code ────────────────────────────────────────────── */}
            {/*
              Multi-tenant field — each law firm has a unique code (e.g. "T1").
              Users get their code from their administrator.

              ADMIN USERS: leave this blank. System administrators don't
              belong to a specific firm — they see all firms' data.
              authService detects is_staff/is_superuser from the server
              response and ignores this field entirely for admin accounts.

              FIRM USERS: this field is required. Your code must match the
              one assigned to your account by your system administrator.
            */}
            <div style={styles.firmBox}>
              <label style={styles.firmLabel} htmlFor="firmCode">
                🏛 Firm Code
              </label>
              <input
                id="firmCode"
                type="text"
                placeholder="e.g. T1  (leave blank if you're an admin)"
                value={firmCode}
                onChange={(e) => setFirmCode(e.target.value.toUpperCase())}
                onFocus={() => setFocusedField('firmCode')}
                onBlur={() => setFocusedField(null)}
                style={firmInp('firmCode')}
                disabled={loading}
                maxLength={20}
                autoComplete="organization"
                // NOT required — admin users leave this blank intentionally
              />
              <span style={styles.firmHint}>
                Your firm's unique identifier — provided by your administrator.
              </span>
              {/* Contextual hint when field is empty */}
              {!firmCode && (
                <span style={styles.adminHint}>
                  System administrators: leave blank to log in without a firm code.
                </span>
              )}
            </div>

            {/* ── Submit button ────────────────────────────────────────── */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitBtn,
                ...(loading ? styles.submitBtnDisabled : {}),
              }}
            >
              {loading ? (
                <>
                  <Spinner
                    animation="border"
                    size="sm"
                    style={{ width: '16px', height: '16px' }}
                  />
                  Signing in…
                </>
              ) : (
                'Login'
              )}
            </button>

          </form>

          {/* ── Forgot password link ─────────────────────────────────────── */}
          <div style={styles.footer}>
            <Link to="/forgot-password" style={styles.link}>
              Forgot password?
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default SignIn;