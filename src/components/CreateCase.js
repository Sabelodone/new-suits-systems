/**
 * src/components/CreateCase.js
 * ─────────────────────────────────────────────────────────────
 * Form to create a new case via POST /api/cases/
 *
 * Changes from old version:
 *  Uses the central api service (auth + tenant headers auto-added)
 *  Loads real clients from GET /api/clients/
 *  Sends the correct fields (code, title, client, end_date)
 *  Shows validation + server errors inline
 *  Redirects back to /cases on success
 * ─────────────────────────────────────────────────────────────
 */

/**
 * Second Changes
 */

// CreateCase.js
// 📁 "Open a Case/File" form — matches the centered white form from the design image
// Fields: Client name, Description, Type | Submit button

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateCase.css';

// Case type options (matches typical law firm categories)
const CASE_TYPES = [
  'Litigation',
  'Family Law',
  'Criminal Defense',
  'Corporate Law',
  'Property / Conveyancing',
  'Employment Law',
  'Immigration',
  'Intellectual Property',
  'Other',
];

function CreateCase() {
  const navigate = useNavigate();

  // Form state — mirrors what the API expects
  const [clientName,   setClientName]   = useState('');
  const [description,  setDescription]  = useState('');
  const [caseType,     setCaseType]     = useState('');
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);

  // ── Handle form submission ──────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!clientName.trim())  { setError('Please enter a client name.');    return; }
    if (!description.trim()) { setError('Please add a description.');       return; }
    if (!caseType)           { setError('Please select a case type.');      return; }

    setLoading(true);
    try {
      // POST to your backend API
      const response = await fetch('http://127.0.0.1:5000/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:       clientName,   // "title" is what your backend expects
          description,
          type:        caseType,
        }),
      });

      if (!response.ok) throw new Error('Failed to create case.');

      // Success — go back to cases list
      navigate('/cases');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Light grey page background
    <div className="cc-page">
      <div className="cc-card">

        {/* ── Header ── */}
        <div className="cc-header">
          <h1 className="cc-title">Open a Case/File</h1>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="cc-form" noValidate>

          {/* Client name */}
          <div className="cc-field">
            <label className="cc-label" htmlFor="cc-client">Client name</label>
            <input
              id="cc-client"
              type="text"
              className="cc-input"
              placeholder="Enter client's full name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
            />
          </div>

          {/* Description — textarea because it's multi-line */}
          <div className="cc-field">
            <label className="cc-label" htmlFor="cc-description">Description</label>
            <textarea
              id="cc-description"
              className="cc-input cc-textarea"
              placeholder="Brief description of the case…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Type — dropdown selector */}
          <div className="cc-field">
            <label className="cc-label" htmlFor="cc-type">Type</label>
            <div className="cc-select-wrapper">
              <select
                id="cc-type"
                className="cc-input cc-select"
                value={caseType}
                onChange={(e) => setCaseType(e.target.value)}
                required
              >
                <option value="" disabled>Select case type</option>
                {CASE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {/* Dropdown chevron icon */}
              <svg className="cc-select-icon" viewBox="0 0 20 20" fill="none"
                xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="#6B7280"
                  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Error message */}
          {error && <p className="cc-error" role="alert">{error}</p>}

          {/* Action buttons row */}
          <div className="cc-actions">
            {/* Cancel — goes back without saving */}
            <button
              type="button"
              className="cc-btn-cancel"
              onClick={() => navigate('/cases')}
              disabled={loading}
            >
              Cancel
            </button>

            {/* Submit */}
            <button
              type="submit"
              className="cc-btn-submit"
              disabled={loading}
            >
              {loading ? 'Creating…' : 'Submit'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default CreateCase;