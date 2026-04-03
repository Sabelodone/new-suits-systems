/**
 * src/components/CreateCase.js
 * ─────────────────────────────────────────────────────────────
 * Form to create a new case via POST /api/cases/
 *
 * Changes from old version:
 *  ✅ Uses the central api service (auth + tenant headers auto-added)
 *  ✅ Loads real clients from GET /api/clients/
 *  ✅ Sends the correct fields (code, title, client, end_date)
 *  ✅ Shows validation + server errors inline
 *  ✅ Redirects back to /cases on success
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';
import { useNavigate }  from 'react-router-dom';
import { Form, Alert }  from 'react-bootstrap';
import { Button }       from '@mantine/core';
import api              from '../services/api';
import './Cases.css';

const CreateCase = () => {
  const navigate = useNavigate();

  // ── Form fields ───────────────────────────────────────────
  const [form, setForm] = useState({
    code:     '',
    title:    '',
    client:   '',    // client id
    end_date: '',
  });

  // ── Support data & UI state ───────────────────────────────
  const [clients,  setClients]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [fieldErr, setFieldErr] = useState({});

  // ── Load clients so the user can pick one ─────────────────
  useEffect(() => {
    api.get('/clients/')
      .then(({ data }) => setClients(Array.isArray(data) ? data : data.results || []))
      .catch(() => {}); // non-fatal — user can still type
  }, []);

  // ── Field change handler ──────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    // Clear field-level error as user types
    setFieldErr((fe) => ({ ...fe, [name]: '' }));
  };

  // ── Validate before submitting ────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.code.trim())   errs.code  = 'Case code is required.';
    if (!form.title.trim())  errs.title = 'Title is required.';
    if (!form.client)        errs.client = 'Please select a client.';
    return errs;
  };

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErr(errs);
      return;
    }

    setLoading(true);
    try {
      await api.post('/cases/', form);
      navigate('/cases');
    } catch (err) {
      // Backend may return field-level errors, e.g. { code: ["already exists"] }
      const data = err.response?.data || {};
      if (typeof data === 'object' && !data.detail) {
        // Field errors from DRF
        const mapped = {};
        for (const [k, v] of Object.entries(data)) {
          mapped[k] = Array.isArray(v) ? v[0] : v;
        }
        setFieldErr(mapped);
      } else {
        setError(data.detail || 'Failed to create case. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="container cases-container !mt-0">
      <h3 className="text-2xl text-primary-purple font-bold text-center mb-4">
        New Case
      </h3>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: 560 }}>

        {/* Case Code */}
        <Form.Group className="mb-3">
          <Form.Label>Case Code <span className="text-danger">*</span></Form.Label>
          <Form.Control
            name="code"
            placeholder="e.g. 2024-PI-001"
            value={form.code}
            onChange={handleChange}
            isInvalid={!!fieldErr.code}
          />
          <Form.Control.Feedback type="invalid">{fieldErr.code}</Form.Control.Feedback>
          <Form.Text className="text-muted">
            A unique identifier for this case within your firm.
          </Form.Text>
        </Form.Group>

        {/* Title */}
        <Form.Group className="mb-3">
          <Form.Label>Title <span className="text-danger">*</span></Form.Label>
          <Form.Control
            name="title"
            placeholder="Brief description of the case"
            value={form.title}
            onChange={handleChange}
            isInvalid={!!fieldErr.title}
          />
          <Form.Control.Feedback type="invalid">{fieldErr.title}</Form.Control.Feedback>
        </Form.Group>

        {/* Client */}
        <Form.Group className="mb-3">
          <Form.Label>Client <span className="text-danger">*</span></Form.Label>
          <Form.Select
            name="client"
            value={form.client}
            onChange={handleChange}
            isInvalid={!!fieldErr.client}
          >
            <option value="">— Select a client —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.first_name} {c.last_name}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">{fieldErr.client}</Form.Control.Feedback>
        </Form.Group>

        {/* End Date (optional) */}
        <Form.Group className="mb-4">
          <Form.Label>Expected End Date</Form.Label>
          <Form.Control
            type="date"
            name="end_date"
            value={form.end_date}
            onChange={handleChange}
          />
        </Form.Group>

        {/* Buttons */}
        <div className="d-flex gap-3">
          <Button
            type="submit"
            className="bg-primary-purple hover:bg-primary-purple cursor-pointer flex-1"
            disabled={loading}
          >
            {loading ? 'Creating…' : 'Create Case'}
          </Button>

          <Button
            variant="default"
            className="cursor-pointer"
            onClick={() => navigate('/cases')}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CreateCase;
