/**
 * src/components/Clients.js
 * ─────────────────────────────────────────────────────────────
 * Client Management — fully connected to the Django backend.
 *
 * Changes from old version:
 *  ✅ Fetches real clients from GET  /api/clients/
 *  ✅ Creates clients via     POST /api/clients/
 *  ✅ Deletes clients via     DELETE /api/clients/{id}/
 *  ✅ Fields match backend model (first_name, last_name, email, phone)
 *  ✅ Add Client modal form (no more inline editable table cells)
 *  ✅ Loading + error states
 *
 * Backend Client serializer fields:
 *   id, law_firm, first_name, last_name, email, phone, tenant
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Table, Badge, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { Button } from '@mantine/core';
import { FaPlus, FaSync, FaEnvelope, FaPhone, FaTrash } from 'react-icons/fa';
import api from '../services/api';
import './Clients.css';

const emptyForm = { first_name: '', last_name: '', email: '', phone: '' };

const Clients = () => {
  // ── State ─────────────────────────────────────────────────
  const [clients,   setClients]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  // Add modal
  const [showModal, setShowModal] = useState(false);
  const [form,      setForm]      = useState(emptyForm);
  const [saving,    setSaving]    = useState(false);
  const [formErr,   setFormErr]   = useState({});

  // Contact modal
  const [contactTarget,  setContactTarget]  = useState(null);
  const [contactMessage, setContactMessage] = useState('');

  // ── Fetch clients ─────────────────────────────────────────
  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/clients/');
      setClients(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load clients.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  // ── Add client ────────────────────────────────────────────
  const validateForm = () => {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = 'First name is required.';
    if (!form.last_name.trim())  errs.last_name  = 'Last name is required.';
    if (!form.email.trim())      errs.email      = 'Email is required.';
    return errs;
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length) { setFormErr(errs); return; }

    setSaving(true);
    try {
      const { data } = await api.post('/clients/', form);
      setClients((prev) => [data, ...prev]);
      setShowModal(false);
      setForm(emptyForm);
      setFormErr({});
    } catch (err) {
      const data = err.response?.data || {};
      // Map DRF field errors
      if (typeof data === 'object' && !data.detail) {
        const mapped = {};
        for (const [k, v] of Object.entries(data)) {
          mapped[k] = Array.isArray(v) ? v[0] : v;
        }
        setFormErr(mapped);
      } else {
        setFormErr({ _general: data.detail || 'Failed to create client.' });
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Delete client ─────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this client? This cannot be undone.')) return;
    try {
      await api.delete(`/clients/${id}/`);
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert('Failed to delete client.');
    }
  };

  // ── Field change ──────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setFormErr((fe) => ({ ...fe, [name]: '', _general: '' }));
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="container clients-container mt-0">

      {/* ── Header ── */}
      <h3 className="text-2xl text-primary-purple font-bold text-center mb-4">
        Client Management
      </h3>

      {/* ── Action bar ── */}
      <div className="d-flex gap-3 mb-4 flex-wrap">
        <Button
          className="flex items-center gap-2 bg-primary-purple hover:bg-primary-purple cursor-pointer"
          onClick={() => { setForm(emptyForm); setFormErr({}); setShowModal(true); }}
        >
          <FaPlus size={13} /> Add Client
        </Button>

        <Button
          variant="default"
          className="flex items-center gap-2 cursor-pointer"
          onClick={fetchClients}
        >
          <FaSync size={13} /> Refresh
        </Button>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="d-flex align-items-center gap-2 text-muted py-4">
          <Spinner size="sm" /> Loading clients…
        </div>
      )}

      {/* ── Error ── */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* ── Empty state ── */}
      {!loading && clients.length === 0 && (
        <p className="text-center text-muted py-5">
          No clients found. Click <strong>Add Client</strong> to get started.
        </p>
      )}

      {/* ── Table ── */}
      {!loading && clients.length > 0 && (
        <div className="table-responsive">
          <Table striped bordered hover className="custom-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c, idx) => (
                <tr key={c.id}>
                  <td className="text-muted">{idx + 1}</td>

                  <td className="fw-semibold">
                    {c.first_name} {c.last_name}
                  </td>

                  <td>
                    <a href={`mailto:${c.email}`} className="text-decoration-none">
                      {c.email}
                    </a>
                  </td>

                  <td>{c.phone || <span className="text-muted">—</span>}</td>

                  <td>
                    <div className="d-flex gap-2">
                      {/* Contact */}
                      <Button
                        size="xs"
                        variant="light"
                        color="violet"
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => { setContactTarget(c); setContactMessage(''); }}
                        title="Send message"
                      >
                        <FaEnvelope size={11} /> Contact
                      </Button>

                      {/* Delete */}
                      <Button
                        size="xs"
                        variant="light"
                        color="red"
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => handleDelete(c.id)}
                        title="Delete client"
                      >
                        <FaTrash size={11} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          ADD CLIENT MODAL
      ═══════════════════════════════════════════════════════ */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>New Client</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formErr._general && <Alert variant="danger">{formErr._general}</Alert>}

          <Form onSubmit={handleAddClient}>
            <div className="row g-3">
              <div className="col-6">
                <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  isInvalid={!!formErr.first_name}
                />
                <Form.Control.Feedback type="invalid">{formErr.first_name}</Form.Control.Feedback>
              </div>

              <div className="col-6">
                <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  isInvalid={!!formErr.last_name}
                />
                <Form.Control.Feedback type="invalid">{formErr.last_name}</Form.Control.Feedback>
              </div>

              <div className="col-12">
                <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  isInvalid={!!formErr.email}
                />
                <Form.Control.Feedback type="invalid">{formErr.email}</Form.Control.Feedback>
              </div>

              <div className="col-12">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="d-flex gap-3 mt-4">
              <Button
                type="submit"
                className="bg-primary-purple hover:bg-primary-purple cursor-pointer flex-1"
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Add Client'}
              </Button>
              <Button
                variant="default"
                className="cursor-pointer"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* ══════════════════════════════════════════════════════
          CONTACT CLIENT MODAL
      ═══════════════════════════════════════════════════════ */}
      <Modal show={!!contactTarget} onHide={() => setContactTarget(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Contact {contactTarget?.first_name} {contactTarget?.last_name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Message</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Type your message…"
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="default" onClick={() => setContactTarget(null)}>Cancel</Button>
          <Button
            className="bg-primary-purple hover:bg-primary-purple cursor-pointer"
            onClick={() => {
              // In a real system this would call a messaging API
              console.log('Message to', contactTarget?.email, ':', contactMessage);
              alert('Message sent (demo).');
              setContactTarget(null);
            }}
          >
            Send
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Clients;
