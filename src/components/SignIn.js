/**
 * src/components/SignIn.js
 * ─────────────────────────────────────────────────────────────
 * Login page — connects to the Django JWT endpoint.
 *
 * Changes from the old version:
 *  ✅ Calls real /api/auth/login/ via UserContext.signIn()
 *  ✅ Accepts username + password + tenant code
 *  ✅ Shows field-level validation errors
 *  ✅ Shows backend error messages (wrong credentials, etc.)
 *  ✅ Redirects to /dashboard on success
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from './UserContext';
import './SignIn.css';

function SignIn() {
  const { signIn }     = useUser();
  const navigate       = useNavigate();

  // ── Form state ────────────────────────────────────────────
  const [username,   setUsername]   = useState('');
  const [password,   setPassword]   = useState('');
  const [tenantCode, setTenantCode] = useState('');
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);

  // ── Submit handler ────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic client-side validation
    if (!username.trim()) return setError('Username is required.');
    if (!password)        return setError('Password is required.');
    if (!tenantCode.trim()) return setError('Tenant code is required (ask your admin).');

    setLoading(true);

    try {
      await signIn(username.trim(), password, tenantCode.trim().toUpperCase());
      navigate('/dashboard'); // ✅ success
    } catch (err) {
      // Django returns 401 with { detail: "No active account found..." }
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="signin-container">
      <h2 className="signin-heading">Sign In</h2>

      <form className="signin-form" onSubmit={handleSubmit}>

        {/* Username */}
        <div className="form-group">
          <label className="form-label">Username</label>
          <input
            className="signin-input"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            className="signin-input"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        {/* Tenant Code — required by the multi-tenant backend */}
        <div className="form-group">
          <label className="form-label">
            Tenant Code
            <span className="text-muted" style={{ fontSize: '0.8rem', marginLeft: 6 }}>
              (provided by your law firm admin)
            </span>
          </label>
          <input
            className="signin-input"
            type="text"
            placeholder="e.g. LF01"
            value={tenantCode}
            onChange={(e) => setTenantCode(e.target.value)}
            autoComplete="off"
            required
          />
        </div>

        {/* Error message */}
        {error && <p className="signin-error">{error}</p>}

        {/* Submit */}
        <button
          className="signin-button"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <div className="forgot-password-link">
        <p><Link to="/forgot-password">Forgot Password?</Link></p>
      </div>

      <div className="signin-link">
        <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
      </div>
    </div>
  );
}

export default SignIn;
