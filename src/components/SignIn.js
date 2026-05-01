// src/components/SignIn.js
//
// ─────────────────────────────────────────────────────────────────────────────
// SIGN IN PAGE  —  Updated Design + Tenant Code field
// ─────────────────────────────────────────────────────────────────────────────
//
// WHAT CHANGED vs. previous version:
//   ✅ Removed "Sign Up" link — users are onboarded by admins, not self-signup
//   ✅ Added "Firm Code" field — replaced the signup link with tenant code input
//   ✅ New blue/white split-panel design matching the provided UI mockups
//   ✅ Tenant code is validated against the server's /api/auth/me/ response
//   ✅ signIn() now passes tenantCode to UserContext → authService
//
// HOW TENANT CODE WORKS:
//   1. User enters their firm's code (e.g. "T1", "SMITH-LAW") — obtained from admin
//   2. After login, authService compares it against what the server returns
//   3. If it matches → stored in localStorage, attached to every API request as X-Tenant-Code
//   4. If it doesn't match → error shown, user can't proceed (security guardrail)
//   5. If user has no tenant (superadmin) → code is optional
//
// DESIGN:
//   - Left panel: blue (#2563eb) with an SVG illustration + brand name
//   - Right panel: white with Username, Password, and Firm Code fields
//   - Blue "Login" button, "Forgot Password?" link below
//   - Responsive: stacks vertically on mobile

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { useUser } from './UserContext';

// ── Inline styles (keeps the component self-contained, no extra CSS file needed) ──
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

  // ── Left panel — blue brand area ──────────────────────────────────────────
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

  // ── Right panel — white form area ─────────────────────────────────────────
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

  // ── Form fields ────────────────────────────────────────────────────────────
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

  inputFocusStyle: {
    borderColor: '#2563eb',
    boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.12)',
    background: '#fff',
  },

  // ── Firm Code section (replaces Sign Up link) ─────────────────────────────
  firmCodeContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '16px',
    padding: '14px',
    background: '#eff6ff',
    borderRadius: '10px',
    border: '1.5px solid #bfdbfe',
  },

  firmCodeLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1e40af',
  },

  firmCodeInput: {
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

  firmCodeHint: {
    fontSize: '11px',
    color: '#3b82f6',
    marginTop: '2px',
  },

  // ── Submit button ──────────────────────────────────────────────────────────
  submitButton: {
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
    transition: 'background 0.2s, transform 0.1s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },

  submitButtonDisabled: {
    background: '#93c5fd',
    cursor: 'not-allowed',
  },

  // ── Error banner ───────────────────────────────────────────────────────────
  errorBanner: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#dc2626',
    marginBottom: '12px',
  },

  // ── Footer links ───────────────────────────────────────────────────────────
  forgotLink: {
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

// ── Left panel illustration (simple SVG — matches blue/white mockup aesthetic) ──
const LoginIllustration = () => (
  <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '200px', opacity: 0.9 }}>
    {/* Building / courthouse */}
    <rect x="60" y="80" width="120" height="100" rx="4" fill="rgba(255,255,255,0.15)" />
    <rect x="50" y="76" width="140" height="12" rx="3" fill="rgba(255,255,255,0.25)" />
    <rect x="75" y="56" width="90" height="24" rx="3" fill="rgba(255,255,255,0.2)" />
    <rect x="106" y="40" width="28" height="20" rx="2" fill="rgba(255,255,255,0.3)" />
    {/* Columns */}
    <rect x="76" y="88" width="10" height="92" rx="2" fill="rgba(255,255,255,0.2)" />
    <rect x="100" y="88" width="10" height="92" rx="2" fill="rgba(255,255,255,0.2)" />
    <rect x="130" y="88" width="10" height="92" rx="2" fill="rgba(255,255,255,0.2)" />
    <rect x="154" y="88" width="10" height="92" rx="2" fill="rgba(255,255,255,0.2)" />
    {/* Door */}
    <rect x="104" y="140" width="32" height="40" rx="4" fill="rgba(255,255,255,0.25)" />
    {/* Steps */}
    <rect x="40" y="180" width="160" height="6" rx="2" fill="rgba(255,255,255,0.3)" />
    <rect x="30" y="186" width="180" height="6" rx="2" fill="rgba(255,255,255,0.2)" />
    {/* Stars */}
    <circle cx="30" cy="30" r="3" fill="rgba(255,255,255,0.4)" />
    <circle cx="210" cy="50" r="2" fill="rgba(255,255,255,0.4)" />
    <circle cx="200" cy="20" r="4" fill="rgba(255,255,255,0.3)" />
    <circle cx="50" cy="60" r="2" fill="rgba(255,255,255,0.3)" />
  </svg>
);


// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function SignIn() {
  const { signIn }    = useUser();
  const navigate      = useNavigate();

  const [username,   setUsername]   = useState('');
  const [password,   setPassword]   = useState('');
  // ✅ NEW: Firm Code field — replaces the "Sign Up" link
  const [firmCode,   setFirmCode]   = useState('');
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);

  // Track which input is focused (for focus ring styles)
  const [focusedField, setFocusedField] = useState(null);

  const getInputStyle = (fieldName) => ({
    ...styles.input,
    ...(focusedField === fieldName ? styles.inputFocusStyle : {}),
  });

  const getFirmInputStyle = (fieldName) => ({
    ...styles.firmCodeInput,
    ...(focusedField === fieldName ? { borderColor: '#2563eb', boxShadow: '0 0 0 3px rgba(37,99,235,0.12)' } : {}),
  });

  // ── Submit handler ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ✅ Pass firmCode as the third argument to signIn
      // UserContext → authService.login(username, password, firmCode)
      // authService will:
      //   1. Get JWT tokens from Django
      //   2. Call /api/auth/me/ to get the user's actual tenant_code
      //   3. Compare entered firmCode against the server's tenant_code
      //   4. Store the validated tenant_code in localStorage
      await signIn(username, password, firmCode.toUpperCase().trim());

      // ✅ Navigate to dashboard on success
      navigate('/dashboard');

    } catch (err) {
      // Specific error messages for each failure type
      if (err.message?.includes('firm code') || err.message?.includes('Firm code')) {
        // Our own validation error from authService
        setError(err.message);
      } else if (err.response?.status === 401) {
        setError('Incorrect username or password. Please try again.');
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Login failed. Check your connection and try again.');
      }
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
            Legal case management for modern law firms. Secure. Organised. Efficient.
          </p>
        </div>

        {/* ── RIGHT PANEL ─────────────────────────────────────────────────── */}
        <div style={styles.rightPanel}>
          <div style={styles.formTitle}>Welcome back</div>
          <div style={styles.formSubtitle}>Sign in to your firm's workspace</div>

          {/* ── Error banner ──────────────────────────────────────────────── */}
          {error && <div style={styles.errorBanner}>{error}</div>}

          <form onSubmit={handleSubmit} autoComplete="on">

            {/* ── Username ─────────────────────────────────────────────────── */}
            <div style={styles.fieldGroup}>
              <label style={styles.label} htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                style={getInputStyle('username')}
                required
                disabled={loading}
                autoComplete="username"
                autoFocus
              />
            </div>

            {/* ── Password ─────────────────────────────────────────────────── */}
            <div style={styles.fieldGroup}>
              <label style={styles.label} htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                style={getInputStyle('password')}
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            {/* ── Firm Code (replaces Sign Up link) ───────────────────────── */}
            {/*
              ✅ WHAT CHANGED: Previously there was a "Don't have an account? Sign up" link here.
              That has been replaced with this Firm Code field.

              WHY: This is a multi-tenant system. Each law firm has a unique code
              (e.g. "T1", "ACME-LAW"). Users get their firm code from their admin.
              It ensures they log into the right firm's data and can't accidentally
              (or deliberately) access another firm's information.

              The code is validated server-side via /api/auth/me/ — if the entered
              code doesn't match the user's actual firm, login is rejected.
            */}
            <div style={styles.firmCodeContainer}>
              <label style={styles.firmCodeLabel} htmlFor="firmCode">
                🏛 Firm Code
              </label>
              <input
                id="firmCode"
                type="text"
                placeholder="e.g. T1"
                value={firmCode}
                onChange={(e) => setFirmCode(e.target.value.toUpperCase())}
                onFocus={() => setFocusedField('firmCode')}
                onBlur={() => setFocusedField(null)}
                style={getFirmInputStyle('firmCode')}
                disabled={loading}
                maxLength={20}
                autoComplete="organization"
              />
              <span style={styles.firmCodeHint}>
                Your unique firm identifier — contact your administrator if you don't have one.
              </span>
            </div>

            {/* ── Submit button ────────────────────────────────────────────── */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitButton,
                ...(loading ? styles.submitButtonDisabled : {}),
              }}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" style={{ width: '16px', height: '16px' }} />
                  Signing in…
                </>
              ) : (
                'Login'
              )}
            </button>

          </form>

          {/* ── Footer links ─────────────────────────────────────────────── */}
          <div style={styles.forgotLink}>
            <Link to="/forgot-password" style={styles.link}>Forgot password?</Link>
          </div>
          {/*
            ✅ NOTE: "Sign up" link has been intentionally removed.
            New users are created by administrators via the Django admin panel
            or a dedicated onboarding flow. Self-registration is disabled.
          */}
        </div>

      </div>
    </div>
  );
}

export default SignIn;