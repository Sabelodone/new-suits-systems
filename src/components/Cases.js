/**
 * src/components/Cases.js
 * ─────────────────────────────────────────────────────────────
 * Case Management — fully connected to the Django backend.
 *
 * What changed from the old version:
 *  ✅ Fetches real cases from  GET /api/cases/
 *  ✅ Deletes cases via        DELETE /api/cases/{id}/
 *  ✅ Workflow status badge shows current step
 *  ✅ Single-click → detail modal | Double-click → documents
 *  ✅ Folder view + Table view (Assessed toggle)
 *  ✅ Loading skeleton + error states
 *  ✅ Workflow attach/advance actions
 *
 * Backend Case model fields (from suits/apps/lawfirms/serializers.py):
 *   id, code, title, status, current_step (id), current_step_name,
 *   workflow_template (id), workflow_name, law_firm, client,
 *   start_date, end_date
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate }        from 'react-router-dom';
import { Table, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaClipboardList, FaFolder, FaFolderOpen, FaPlus, FaSync } from 'react-icons/fa';
import { Button }             from '@mantine/core';
import { modals }             from '@mantine/modals';
import api                    from '../services/api';
import { CaseDetail }         from './CaseDetail';
import './Cases.css';

// ─── Status → colour mapping ─────────────────────────────────
const statusVariant = (status = '') => {
  const s = status.toLowerCase();
  if (s === 'open')     return 'success';
  if (s === 'closed')   return 'danger';
  if (s === 'pending')  return 'warning';
  return 'secondary';
};

const Cases = () => {
  const navigate = useNavigate();

  // ── State ─────────────────────────────────────────────────
  const [cases,     setCases]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [showTable, setShowTable] = useState(false); // folder vs table view
  const [openFolder, setOpenFolder] = useState(null); // which folder is hovered

  // ── Fetch cases from backend ──────────────────────────────
  const fetchCases = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/cases/');
      // Backend returns a list (or paginated { results: [...] })
      setCases(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Failed to load cases. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCases(); }, [fetchCases]);

  // ── Delete case ───────────────────────────────────────────
  const handleDelete = async (id, e) => {
    e.stopPropagation(); // don't trigger row click
    if (!window.confirm('Delete this case? This cannot be undone.')) return;
    try {
      await api.delete(`/cases/${id}/`);
      setCases((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert('Failed to delete case.');
    }
  };

  // ── Single click → detail modal ───────────────────────────
  let clickTimer;

  const handleClick = (caseItem) => {
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => {
      modals.open({
        title: `Case: ${caseItem.code}`,
        centered: true,
        size: 'lg',
        children: <CaseDetail caseItem={caseItem} onRefresh={fetchCases} />,
      });
    }, 230);
  };

  // ── Double click → documents ──────────────────────────────
  const handleDoubleClick = (caseItem) => {
    clearTimeout(clickTimer);
    navigate('/document-management', { state: { caseId: caseItem.id, caseCode: caseItem.code } });
  };

  // ── Render: loading ───────────────────────────────────────
  if (loading) {
    return (
      <div className="cases-container d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3 text-muted">Loading cases…</span>
      </div>
    );
  }

  // ── Render: error ─────────────────────────────────────────
  if (error) {
    return (
      <div className="cases-container">
        <Alert variant="danger">
          {error}
          <Button size="xs" className="ms-3" onClick={fetchCases}>Retry</Button>
        </Alert>
      </div>
    );
  }

  // ── Render: main ─────────────────────────────────────────
  return (
    <div className="container cases-container bg-[#e3dce7] rounded-lg flex flex-col gap-6 items-center w-full !mt-0">

      {/* ── Page header ── */}
      <h3 className="text-2xl text-primary-purple font-bold">Case Management</h3>

      {/* ── Action buttons ── */}
      <div className="flex items-center gap-4 flex-wrap justify-center">

        <Button
          className="flex items-center bg-primary-purple hover:bg-primary-purple cursor-pointer h-[46px] px-4 gap-2"
          onClick={() => navigate('/create-case')}
        >
          <FaPlus size={14} /> New Case
        </Button>

        <Button
          className="flex items-center bg-transparent border !border-[#6a1b9a] text-[#6a1b9a] hover:bg-transparent cursor-pointer h-[46px] px-4 gap-2"
          onClick={() => setShowTable((t) => !t)}
        >
          <FaClipboardList size={14} />
          {showTable ? 'Folder View' : 'Table View'}
        </Button>

        <Button
          className="flex items-center bg-transparent border !border-[#6a1b9a] text-[#6a1b9a] hover:bg-transparent cursor-pointer h-[46px] px-4 gap-2"
          onClick={fetchCases}
          title="Refresh"
        >
          <FaSync size={14} /> Refresh
        </Button>
      </div>

      {/* ── Empty state ── */}
      {cases.length === 0 && (
        <div className="text-center text-muted py-5">
          <FaFolder size={48} className="mb-3 opacity-40" />
          <p>No cases found. Click <strong>New Case</strong> to get started.</p>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          FOLDER VIEW (default)
      ═══════════════════════════════════════════════════════ */}
      {!showTable && cases.length > 0 && (
        <Row className="w-full g-3">
          {cases.map((caseItem) => (
            <Col key={caseItem.id} xs={6} md={4} lg={3}>
              <div
                className="folder-card text-center p-3 rounded cursor-pointer"
                style={{
                  background: '#fff',
                  border: '1px solid #e0d4f8',
                  transition: 'all .2s',
                  boxShadow: openFolder === caseItem.id
                    ? '0 6px 18px rgba(106,27,154,0.18)'
                    : '0 2px 8px rgba(0,0,0,0.06)',
                }}
                onClick={() => handleClick(caseItem)}
                onDoubleClick={() => handleDoubleClick(caseItem)}
                onMouseEnter={() => setOpenFolder(caseItem.id)}
                onMouseLeave={() => setOpenFolder(null)}
              >
                {/* Folder icon */}
                <div style={{ fontSize: 42 }}>
                  {openFolder === caseItem.id ? '📂' : '📁'}
                </div>

                {/* Case code + title */}
                <p className="fw-bold mt-2 mb-0" style={{ fontSize: '.9rem', color: '#6a1b9a' }}>
                  {caseItem.code}
                </p>
                <p className="text-muted mb-1" style={{ fontSize: '.78rem' }}>
                  {caseItem.title?.substring(0, 30)}{caseItem.title?.length > 30 ? '…' : ''}
                </p>

                {/* Status badge */}
                <Badge bg={statusVariant(caseItem.status)} className="mb-1">
                  {caseItem.status || 'OPEN'}
                </Badge>

                {/* Workflow step */}
                {caseItem.current_step_name && (
                  <p className="text-muted mt-1 mb-0" style={{ fontSize: '.72rem' }}>
                    Step: {caseItem.current_step_name}
                  </p>
                )}

                {/* Date */}
                <p className="text-muted mb-0" style={{ fontSize: '.72rem' }}>
                  {caseItem.start_date}
                </p>
              </div>
            </Col>
          ))}
        </Row>
      )}

      {/* ══════════════════════════════════════════════════════
          TABLE VIEW (Assessed / toggled)
      ═══════════════════════════════════════════════════════ */}
      {showTable && cases.length > 0 && (
        <div className="table-responsive w-full">
          <Table striped bordered hover className="custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Status</th>
                <th>Workflow Step</th>
                <th>Client</th>
                <th>Start Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr
                  key={c.id}
                  className="cursor-pointer"
                  onClick={() => handleClick(c)}
                  onDoubleClick={() => handleDoubleClick(c)}
                >
                  <td className="fw-semibold text-purple">{c.code}</td>
                  <td>{c.title}</td>
                  <td>
                    <Badge bg={statusVariant(c.status)}>
                      {c.status || 'OPEN'}
                    </Badge>
                  </td>
                  <td>{c.current_step_name || <span className="text-muted">—</span>}</td>
                  <td>{c.client || <span className="text-muted">—</span>}</td>
                  <td>{c.start_date}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="xs"
                      color="red"
                      variant="light"
                      onClick={(e) => handleDelete(c.id, e)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default Cases;
