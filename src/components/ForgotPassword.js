// ForgotPassword.js
// 🔑 Clean centered card — matches "Forgotten password" panel from design image
// Design: white card, blue title, underline input, blue pill button, back link

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [message, setMessage]   = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    // Simulate API call — replace with your actual API
    setTimeout(() => {
      setMessage('If that email exists, a reset link has been sent.');
      setLoading(false);
    }, 1000);
  };

  return (
    // Full page — light grey background behind the white card
    <div className="fp-page">
      <div className="fp-card">

        {/* ── Title ── */}
        <h1 className="fp-title">Forgotten password</h1>

        {/* ── Subtitle description ── */}
        <p className="fp-subtitle">
          Please enter the email address you'd like your password
          information to be sent to.
        </p>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="fp-form" noValidate>

          {/* Email field */}
          <div className="fp-field">
            <label className="fp-label" htmlFor="fp-email">Email</label>
            <input
              id="fp-email"
              type="email"
              className="fp-input"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {/* Feedback messages */}
          {error   && <p className="fp-msg fp-msg--error"   role="alert">{error}</p>}
          {message && <p className="fp-msg fp-msg--success" role="status">{message}</p>}

          {/* Submit button */}
          <button
            type="submit"
            className="fp-btn-primary"
            disabled={loading}
          >
            {loading ? 'Sending…' : 'Request reset link'}
          </button>

        </form>

        {/* ── Back to login link ── */}
        <button
          type="button"
          className="fp-back-link"
          onClick={() => navigate('/signin')}
        >
          {/* Left arrow icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
            xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M10 12L6 8L10 4" stroke="currentColor"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to login
        </button>

      </div>
    </div>
  );
}

export default ForgotPassword;