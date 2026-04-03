/**
 * src/components/CaseDetail.js
 * ─────────────────────────────────────────────────────────────
 * Case detail modal — shows full case info + workflow controls.
 *
 * Changes from old version:
 *  ✅ Shows all backend Case fields properly
 *  ✅ Workflow status: current step + available transitions
 *  ✅ "Advance Step" button with optional context (approve/reject)
 *  ✅ "Attach Workflow" if no workflow is assigned yet
 *  ✅ Parent can pass onRefresh() to reload cases list after changes
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';
import { Badge, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { Button } from '@mantine/core';
import { modals } from '@mantine/modals';
import api from '../services/api';

// ─── Status colour helper (reused from Cases.js) ─────────────
const statusVariant = (status = '') => {
  const s = status.toLowerCase();
  if (s === 'open')    return 'success';
  if (s === 'closed')  return 'danger';
  if (s === 'pending') return 'warning';
  return 'secondary';
};

export const CaseDetail = ({ caseItem, onRefresh }) => {
  // ── Workflow state ────────────────────────────────────────
  const [wfStatus,    setWfStatus]    = useState(null);   // workflow_status response
  const [templates,   setTemplates]   = useState([]);     // available workflow templates
  const [advancing,   setAdvancing]   = useState(false);
  const [attaching,   setAttaching]   = useState(false);
  const [selectedTpl, setSelectedTpl] = useState('');
  const [wfLoading,   setWfLoading]   = useState(true);
  const [wfError,     setWfError]     = useState('');

  // ── Fetch workflow status on mount ────────────────────────
  useEffect(() => {
    if (!caseItem?.id) return;
    fetchWorkflowStatus();
  }, [caseItem?.id]);

  const fetchWorkflowStatus = async () => {
    setWfLoading(true);
    setWfError('');
    try {
      const { data } = await api.get(`/cases/${caseItem.id}/workflow_status/`);
      setWfStatus(data);
    } catch {
      setWfError('Could not load workflow status.');
    } finally {
      setWfLoading(false);
    }
  };

  // ── Load templates when no workflow is attached ───────────
  useEffect(() => {
    if (!caseItem?.workflow_template) {
      api.get('/workflow-templates/')
        .then(({ data }) => setTemplates(Array.isArray(data) ? data : data.results || []))
        .catch(() => {});
    }
  }, [caseItem?.workflow_template]);

  // ── Attach a workflow template ────────────────────────────
  const handleAttachWorkflow = async () => {
    if (!selectedTpl) return alert('Please select a workflow template first.');
    setAttaching(true);
    try {
      await api.post(`/cases/${caseItem.id}/attach_workflow/`, {
        workflow_template_id: Number(selectedTpl),
      });
      await fetchWorkflowStatus();
      onRefresh?.();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to attach workflow.');
    } finally {
      setAttaching(false);
    }
  };

  // ── Advance to next step ─────────────────────────────────
  const handleAdvance = async (transition = null) => {
    setAdvancing(true);
    try {
      // If a conditional transition was selected, pass its context
      const context = transition?.condition_field
        ? { [transition.condition_field]: transition.condition_value }
        : {};

      const { data } = await api.post(`/cases/${caseItem.id}/advance_step/`, { context });

      setWfStatus((prev) => ({
        ...prev,
        current_step: data.current_step,
        status: data.status,
        available_transitions: data.available_transitions,
      }));

      onRefresh?.();
    } catch (err) {
      alert(err.response?.data?.error || 'Could not advance workflow step.');
    } finally {
      setAdvancing(false);
    }
  };

  // ── Case info rows ────────────────────────────────────────
  const info = [
    { label: 'Code',       value: caseItem?.code },
    { label: 'Title',      value: caseItem?.title },
    { label: 'Status',     value: (
        <Badge bg={statusVariant(caseItem?.status)}>
          {caseItem?.status || 'OPEN'}
        </Badge>
      )
    },
    { label: 'Workflow',   value: caseItem?.workflow_name || '—' },
    { label: 'Current Step', value: caseItem?.current_step_name || '—' },
    { label: 'Start Date', value: caseItem?.start_date },
    { label: 'End Date',   value: caseItem?.end_date || '—' },
  ];

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">

      {/* ── Case info table ── */}
      <section>
        <h5 className="text-primary-purple fw-bold mb-3">Case Information</h5>
        <div className="flex flex-col gap-2">
          {info.map(({ label, value }) => (
            <div key={label} className="grid grid-cols-[40%_1fr] items-center border-bottom py-2">
              <span className="fw-semibold text-muted" style={{ fontSize: '.9rem' }}>{label}</span>
              <span style={{ color: '#6a1b9a' }}>{value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Workflow section ── */}
      <section>
        <h5 className="text-primary-purple fw-bold mb-3">Workflow</h5>

        {wfLoading && (
          <div className="d-flex align-items-center gap-2 text-muted">
            <Spinner size="sm" /> Loading workflow…
          </div>
        )}

        {wfError && <Alert variant="warning" className="py-2">{wfError}</Alert>}

        {/* No workflow attached → show attach UI */}
        {!wfLoading && !wfError && !wfStatus?.workflow && (
          <div className="d-flex flex-column gap-3">
            <p className="text-muted mb-1">No workflow attached to this case yet.</p>

            <select
              className="form-select"
              value={selectedTpl}
              onChange={(e) => setSelectedTpl(e.target.value)}
            >
              <option value="">— Select a workflow template —</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>

            <Button
              className="bg-primary-purple hover:bg-primary-purple cursor-pointer"
              onClick={handleAttachWorkflow}
              disabled={attaching || !selectedTpl}
            >
              {attaching ? 'Attaching…' : 'Attach Workflow'}
            </Button>
          </div>
        )}

        {/* Workflow attached → show progress + transitions */}
        {!wfLoading && wfStatus?.workflow && (
          <div className="flex flex-col gap-3">
            {/* Step progress */}
            <div>
              <p className="mb-2 text-muted" style={{ fontSize: '.85rem' }}>
                Workflow: <strong>{wfStatus.workflow}</strong>
              </p>

              {/* Step list */}
              <ListGroup variant="flush" className="border rounded">
                {(wfStatus.steps || []).map((step) => (
                  <ListGroup.Item
                    key={step.id}
                    className={`d-flex align-items-center gap-2 py-2 px-3 ${
                      step.is_current ? 'list-group-item-primary' : ''
                    }`}
                    style={{ fontSize: '.85rem' }}
                  >
                    <span
                      className="rounded-circle d-inline-flex align-items-center justify-content-center"
                      style={{
                        width: 22, height: 22,
                        fontSize: '.7rem', fontWeight: 'bold',
                        background: step.is_current ? '#6a1b9a' : '#dee2e6',
                        color: step.is_current ? '#fff' : '#495057',
                        flexShrink: 0,
                      }}
                    >
                      {step.order}
                    </span>
                    {step.name}
                    {step.is_current && (
                      <Badge bg="primary" className="ms-auto">Current</Badge>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>

            {/* Transition / Advance buttons */}
            <div className="d-flex flex-wrap gap-2">
              {/* Conditional transitions (e.g. Approve / Reject) */}
              {(wfStatus.available_transitions || []).length > 0 ? (
                (wfStatus.available_transitions).map((t, i) => (
                  <Button
                    key={i}
                    className="cursor-pointer"
                    color={t.condition_value === 'REJECTED' ? 'red' : 'violet'}
                    variant="light"
                    onClick={() => handleAdvance(t)}
                    disabled={advancing}
                  >
                    {t.label || `→ ${t.to_step_name}`}
                  </Button>
                ))
              ) : (
                /* Default linear advance */
                <Button
                  className="bg-primary-purple hover:bg-primary-purple cursor-pointer"
                  onClick={() => handleAdvance()}
                  disabled={advancing}
                >
                  {advancing ? 'Advancing…' : 'Advance to Next Step'}
                </Button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── View documents ── */}
      <div className="d-flex justify-content-end">
        <Button
          variant="default"
          className="cursor-pointer"
          onClick={() => {
            modals.closeAll();
            window.location.href = '/document-management';
          }}
        >
          View Documents
        </Button>
      </div>
    </div>
  );
};

export default CaseDetail;
