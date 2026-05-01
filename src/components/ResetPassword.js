// ResetPassword.js
// 🔒 Clean white card — matches "Reset password" panel from design image
// New password + Confirm new password + Reset button + Sign up link

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResetPassword.css';

function ResetPassword() {
  const navigate = useNavigate();

  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message,         setMessage]         = useState('');
  const [error,           setError]           = useState('');
  const [loading,         setLoading]         = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validation
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    // Simulate API call — replace with real endpoint
    setTimeout(() => {
      setMessage('Your password has been reset successfully.');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="rp-page">
      <div className="rp-card">

        {/* ── Title ── */}
        <h1 className="rp-title">Reset password</h1>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="rp-form" noValidate>

          {/* New password */}
          <div className="rp-field">
            <label className="rp-label" htmlFor="rp-new">New password</label>
            <input
              id="rp-new"
              type="password"
              className="rp-input"
              placeholder="••••••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          {/* Confirm new password */}
          <div className="rp-field">
            <label className="rp-label" htmlFor="rp-confirm">Confirm new password</label>
            <input
              id="rp-confirm"
              type="password"
              className="rp-input"
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          {/* Feedback */}
          {error   && <p className="rp-msg rp-msg--error"   role="alert">{error}</p>}
          {message && <p className="rp-msg rp-msg--success" role="status">{message}</p>}

          {/* Reset button */}
          <button
            type="submit"
            className="rp-btn-primary"
            disabled={loading}
          >
            {loading ? 'Resetting…' : 'Reset password'}
          </button>

        </form>

        {/* ── Sign up link — matches design image ── */}
        <div className="rp-footer">
          <span className="rp-footer-text">Don't have an account?</span>
          <button
            type="button"
            className="rp-link"
            onClick={() => navigate('/signup')}
          >
            Sign up
          </button>
        </div>

      </div>
    </div>
  );
}

export default ResetPassword;