/**
 * src/components/CreateCase.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Form to open a new case via POST /api/cases/
 *
 * WHAT WAS BROKEN (3 separate bugs):
 *
 *   Bug 1 — Wrong URL:
 *     Old code: fetch('http://127.0.0.1:5000/api/cases', ...)
 *     This is a dead local address. In production this always fails with
 *     a network error. Fix: use the `api` axios instance which already
 *     has the correct BASE_URL and auth headers configured.
 *
 *   Bug 2 — Wrong field names:
 *     Old code sent: { title: clientName, description, type: caseType }
 *     The backend Case model requires: { code, title, client }
 *       - `code`   = unique case reference number (e.g. "PI-2024-001")
 *       - `title`  = case title / description
 *       - `client` = integer FK ID of the selected Client record
 *     The backend's CaseSerializer validated these exact field names and
 *     returned 400 {"code": ["required"], "title": ["required"], "client": ["required"]}
 *
 *   Bug 3 — No auth/tenant headers:
 *     Old code used plain fetch() with no Authorization or X-Tenant-Code headers.
 *     Every request was rejected by the backend (401 or 400). Fix: use api.js
 *     which injects both headers automatically via its request interceptor.
 *
 * WHAT THIS COMPONENT NOW DOES:
 *   1. On mount — fetches real clients from GET /api/clients/ for the dropdown
 *   2. On mount — fetches workflow templates from GET /api/workflow-templates/
 *      so the attorney can optionally assign a workflow at case creation
 *   3. On submit — validates locally, then sends:
 *        POST /api/cases/
 *        { code, title, client: <int id>, workflow_template: <int id | null> }
 *   4. On success — navigates to /cases
 *   5. Shows server error messages inline (e.g. "Case code already exists in your firm")
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';
import { useNavigate }                 from 'react-router-dom';
import api                             from '../services/api'; // ← correct axios instance
import './CreateCase.css';

// ── Helper: extract the first error message from a DRF error response ─────────
// DRF errors can be:
//   { "code": ["This field is required."] }           → field-level errors
//   { "detail": "Not found." }                        → top-level detail
//   { "non_field_errors": ["Code already exists."] }  → non-field errors
function extractApiError(err) {
  const data = err.response?.data;
  if (!data) return err.message || 'An unexpected error occurred.';

  if (typeof data === 'string') return data;

  // Field-level errors: return the first one with its field name
  const fieldErrors = Object.entries(data)
    .filter(([key]) => key !== 'detail' && key !== 'non_field_errors')
    .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs[0] : msgs}`)
    .join(' | ');

  if (fieldErrors) return fieldErrors;
  if (data.detail) return data.detail;
  if (data.non_field_errors) return data.non_field_errors[0];

  return 'An unexpected error occurred.';
}

// ── Component ─────────────────────────────────────────────────────────────────
function CreateCase() {
  const navigate = useNavigate();

  // ── Form field state ───────────────────────────────────────────────────────
  const [code,             setCode]             = useState('');
  const [title,            setTitle]            = useState('');
  const [clientId,         setClientId]         = useState('');   // integer FK ID
  const [workflowId,       setWorkflowId]       = useState('');   // optional

  // ── Remote data for dropdowns ──────────────────────────────────────────────
  const [clients,          setClients]          = useState([]);
  const [workflows,        setWorkflows]        = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [dropdownError,    setDropdownError]    = useState('');

  // ── Submission state ───────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [formError,  setFormError]  = useState('');

  // ── Load clients and workflow templates on mount ───────────────────────────
  // We need both before the form is usable.
  useEffect(() => {
    let cancelled = false;

    const loadDropdowns = async () => {
      try {
        // Run both requests in parallel — faster than sequential
        const [clientsRes, workflowsRes] = await Promise.all([
          api.get('/clients/'),
          api.get('/workflow-templates/'),
        ]);

        if (!cancelled) {
          setClients(clientsRes.data);
          setWorkflows(workflowsRes.data);
        }
      } catch (err) {
        if (!cancelled) {
          setDropdownError(
            'Could not load clients or workflows. Please refresh and try again.'
          );
          console.error('CreateCase dropdown load error:', err);
        }
      } finally {
        if (!cancelled) setLoadingDropdowns(false);
      }
    };

    loadDropdowns();
    return () => { cancelled = true; };
  }, []);

  // ── Form submission ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Local validation — give the user specific messages before hitting the API
    if (!code.trim()) {
      setFormError('Case reference code is required (e.g. "PI-2024-001").');
      return;
    }
    if (!title.trim()) {
      setFormError('Case title is required.');
      return;
    }
    if (!clientId) {
      setFormError('Please select a client for this case.');
      return;
    }

    setSubmitting(true);

    try {
      // Build request body.
      // law_firm is NOT sent — the backend injects it from the attorney's profile
      // in CaseViewSet.perform_create(). Sending it would cause a read-only field error.
      const payload = {
        code:  code.trim(),
        title: title.trim(),
        client: parseInt(clientId, 10),            // FK ID as integer
      };

      // workflow_template is optional — only include it if the user selected one
      if (workflowId) {
        payload.workflow_template = parseInt(workflowId, 10);
      }

      await api.post('/cases/', payload);

      // Success — navigate back to the cases list
      navigate('/cases');

    } catch (err) {
      setFormError(extractApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="cc-page">
      <div className="cc-card">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="cc-header">
          <button
            className="cc-back-btn"
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            {/* Left arrow SVG */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
          <div>
            <h1 className="cc-title">Open a Case</h1>
            <p className="cc-subtitle">Create a new client case file</p>
          </div>
        </div>

        {/* ── Dropdown load error ──────────────────────────────────────────── */}
        {dropdownError && (
          <div className="cc-error cc-error--banner" role="alert">
            {dropdownError}
          </div>
        )}

        {/* ── Form ────────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="cc-form" noValidate>

          {/* Case Reference Code */}
          {/* This must be unique within your law firm, e.g. "PI-2024-001" */}
          <div className="cc-field">
            <label className="cc-label" htmlFor="cc-code">
              Case Code <span className="cc-required">*</span>
            </label>
            <input
              id="cc-code"
              type="text"
              className="cc-input"
              placeholder="e.g. PI-2024-001"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={submitting}
              required
              maxLength={100}
            />
            <span className="cc-hint">
              Unique reference number for this case in your firm.
            </span>
          </div>

          {/* Case Title */}
          <div className="cc-field">
            <label className="cc-label" htmlFor="cc-title">
              Case Title <span className="cc-required">*</span>
            </label>
            <input
              id="cc-title"
              type="text"
              className="cc-input"
              placeholder="e.g. Smith vs. Johnson — Personal Injury"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
              required
              maxLength={255}
            />
          </div>

          {/* Client dropdown */}
          {/*
            Populated from GET /api/clients/ — returns only clients in this firm.
            The backend receives the client's integer ID (FK), not the name.
            The attorney selects the name but the payload contains the ID.
          */}
          <div className="cc-field">
            <label className="cc-label" htmlFor="cc-client">
              Client <span className="cc-required">*</span>
            </label>
            <div className="cc-select-wrapper">
              <select
                id="cc-client"
                className="cc-input cc-select"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                disabled={submitting || loadingDropdowns}
                required
              >
                <option value="">
                  {loadingDropdowns ? 'Loading clients…' : 'Select a client'}
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}
                    {c.email ? ` — ${c.email}` : ''}
                  </option>
                ))}
              </select>
              <ChevronIcon />
            </div>
            {!loadingDropdowns && clients.length === 0 && !dropdownError && (
              <span className="cc-hint cc-hint--warn">
                No clients found in your firm. Add a client first.
              </span>
            )}
          </div>

          {/* Workflow template dropdown (optional) */}
          {/*
            Optional: if selected, the backend places the case on the first
            workflow step automatically. Can also be attached later via
            POST /api/cases/{id}/attach_workflow/
          */}
          <div className="cc-field">
            <label className="cc-label" htmlFor="cc-workflow">
              Workflow Template
              <span className="cc-optional"> (optional)</span>
            </label>
            <div className="cc-select-wrapper">
              <select
                id="cc-workflow"
                className="cc-input cc-select"
                value={workflowId}
                onChange={(e) => setWorkflowId(e.target.value)}
                disabled={submitting || loadingDropdowns}
              >
                <option value="">
                  {loadingDropdowns ? 'Loading…' : 'No workflow (attach later)'}
                </option>
                {workflows.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
              <ChevronIcon />
            </div>
          </div>

          {/* Form-level error message */}
          {formError && (
            <div className="cc-error" role="alert">
              {formError}
            </div>
          )}

          {/* Action buttons */}
          <div className="cc-actions">
            <button
              type="button"
              className="cc-btn-cancel"
              onClick={() => navigate('/cases')}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cc-btn-submit"
              disabled={submitting || loadingDropdowns}
            >
              {submitting ? (
                <>
                  <span className="cc-spinner" aria-hidden="true" />
                  Creating…
                </>
              ) : (
                'Open Case'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

// ── Inline chevron icon for selects ───────────────────────────────────────────
const ChevronIcon = () => (
  <svg
    className="cc-select-icon"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M5 7.5L10 12.5L15 7.5"
      stroke="#6B7280"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default CreateCase;
