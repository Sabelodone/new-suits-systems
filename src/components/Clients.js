/**
 * src/components/Clients.js
 *
 * Clients list — 4-column card grid matching the design screenshot exactly.
 *
 * DATA FLOW:
 *   1. GET /api/clients/  → all clients in the firm
 *   2. GET /api/cases/    → all cases (to compute per-client active case count)
 *   Both requests run in parallel via Promise.all for speed.
 *
 *   For each client card we compute:
 *     activeCaseCount = cases.filter(c => c.client === client.id && status === 'Active').length
 *
 * CARD LAYOUT (matches design):
 *   ┌─────────────────────────────────────────┐
 *   │  Client Name         [2 Active Cases]   │
 *   │  company (email domain)                 │
 *   │                                         │
 *   │  ✉  email@example.com                  │
 *   │  📞 +1 (555) 123-4567                  │
 *   │                                         │
 *   │  🗂  View Cases                         │
 *   └─────────────────────────────────────────┘
 *
 * FILTER TABS:
 *   All Clients | Active (has ≥1 active case) | Pending (has pending) | Closed
 *
 * PAGINATION: 8 per page (4 cols × 2 rows), matching the design's visible count.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Clients.css';

const PAGE_SIZE = 8;

// ── Status helper (same as Cases.js) ─────────────────────────────────────────
function normaliseStatus(raw = '') {
  const s = raw.toLowerCase();
  if (s === 'closed'  || s.includes('complete') || s.includes('done'))   return 'Closed';
  if (s === 'pending' || s.includes('pending')  || s.includes('review')) return 'Pending';
  return 'Active';
}

// ── Derive a company name from email domain ────────────────────────────────────
// e.g. "john@smithenterprises.com" → "Smithenterprises"
// Not perfect but shows real data when no company field exists.
function companyFromEmail(email = '') {
  if (!email || !email.includes('@')) return null;
  const domain  = email.split('@')[1] || '';
  const name    = domain.split('.')[0] || '';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// ── Pagination helper ──────────────────────────────────────────────────────────
function buildPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current - 1 > 2) pages.push('…');
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p);
  if (current + 1 < total - 1) pages.push('…');
  pages.push(total);
  return pages;
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const EmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="M2 7l10 7 10-7"/>
  </svg>
);
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l.9-.9a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const BriefcaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    <line x1="2" y1="13" x2="22" y2="13"/>
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const FilterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);
const ChevronLeft  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevronRight = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;

// ── Skeleton card ──────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="cl-card cl-card--skeleton">
    <div className="cl-skel" style={{ width: '70%', height: 18 }} />
    <div className="cl-skel" style={{ width: '50%', height: 13, marginTop: 6 }} />
    <div style={{ height: 16 }} />
    <div className="cl-skel" style={{ width: '85%', height: 13 }} />
    <div className="cl-skel" style={{ width: '65%', height: 13 }} />
    <div style={{ height: 16 }} />
    <div className="cl-skel" style={{ width: '40%', height: 13 }} />
  </div>
);

// ── Add Client Modal ───────────────────────────────────────────────────────────
const AddClientModal = ({ onClose, onSaved }) => {
  const [form,    setForm]    = useState({ first_name: '', last_name: '', email: '', phone: '' });
  const [saving,  setSaving]  = useState(false);
  const [errMsg,  setErrMsg]  = useState('');

  const change = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg('');
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setErrMsg('First name and last name are required.');
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post('/clients/', form);
      onSaved(data);
    } catch (err) {
      const d = err.response?.data;
      setErrMsg(d ? Object.values(d).flat().join(' ') : 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cl-modal-overlay" onClick={onClose}>
      <div className="cl-modal" onClick={e => e.stopPropagation()}>
        <div className="cl-modal-header">
          <h2>Add Client</h2>
          <button className="cl-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {errMsg && <div className="cl-modal-error">{errMsg}</div>}
        <form onSubmit={handleSubmit} className="cl-modal-form">
          <div className="cl-modal-row">
            <div className="cl-modal-field">
              <label>First Name *</label>
              <input name="first_name" value={form.first_name} onChange={change} placeholder="e.g. John" required />
            </div>
            <div className="cl-modal-field">
              <label>Last Name *</label>
              <input name="last_name" value={form.last_name} onChange={change} placeholder="e.g. Smith" required />
            </div>
          </div>
          <div className="cl-modal-field">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={change} placeholder="john@example.com" />
          </div>
          <div className="cl-modal-field">
            <label>Phone</label>
            <input name="phone" value={form.phone} onChange={change} placeholder="+1 (555) 000-0000" />
          </div>
          <div className="cl-modal-actions">
            <button type="button" className="cl-btn-cancel" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="cl-btn-save" disabled={saving}>
              {saving ? 'Saving…' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Client Card ────────────────────────────────────────────────────────────────
const ClientCard = ({ client, activeCaseCount, onViewCases, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const company = companyFromEmail(client.email);

  return (
    <div className="cl-card">
      {/* ── Top row: name + case badge ── */}
      <div className="cl-card-top">
        <div className="cl-card-name-block">
          <h3 className="cl-card-name">{client.first_name} {client.last_name}</h3>
          {company && <span className="cl-card-company">{company}</span>}
        </div>
        {activeCaseCount > 0 && (
          <span className="cl-case-badge">
            {activeCaseCount} Active Case{activeCaseCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Contact rows ── */}
      <div className="cl-card-contacts">
        {client.email && (
          <div className="cl-contact-row">
            <span className="cl-contact-icon"><EmailIcon /></span>
            <span className="cl-contact-text">{client.email}</span>
          </div>
        )}
        {client.phone && (
          <div className="cl-contact-row">
            <span className="cl-contact-icon"><PhoneIcon /></span>
            <span className="cl-contact-text">{client.phone}</span>
          </div>
        )}
        {!client.email && !client.phone && (
          <div className="cl-contact-row cl-contact-empty">No contact details on file.</div>
        )}
      </div>

      {/* ── Footer: "View Cases" link + delete ── */}
      <div className="cl-card-footer">
        <button className="cl-view-cases-btn" onClick={onViewCases}>
          <span className="cl-view-cases-icon"><BriefcaseIcon /></span>
          View Cases
        </button>
        <button
          className="cl-delete-btn"
          onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}
          aria-label="More options"
        >
          ⋯
        </button>
        {menuOpen && (
          <div className="cl-dropdown">
            <button className="cl-dropdown-item cl-dropdown-item--danger"
              onClick={() => { setMenuOpen(false); onDelete(); }}>
              Delete Client
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Pagination ─────────────────────────────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, totalItems, onPage }) => {
  if (totalPages <= 1) return null;
  const pages = buildPageNumbers(currentPage, totalPages);
  const from  = (currentPage - 1) * PAGE_SIZE + 1;
  const to    = Math.min(currentPage * PAGE_SIZE, totalItems);
  return (
    <div className="cl-pagination">
      <span className="cl-pagination__count">
        Showing <strong>{from}–{to}</strong> of <strong>{totalItems}</strong> client{totalItems !== 1 ? 's' : ''}
      </span>
      <div className="cl-pagination__nav">
        <button className="cl-page-btn" onClick={() => onPage(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous"><ChevronLeft /></button>
        {pages.map((p, i) =>
          p === '…'
            ? <span key={`e${i}`} className="cl-page-ellipsis">…</span>
            : <button key={p} className={`cl-page-btn cl-page-btn--num${p === currentPage ? ' cl-page-btn--active' : ''}`} onClick={() => onPage(p)}>{p}</button>
        )}
        <button className="cl-page-btn" onClick={() => onPage(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Next"><ChevronRight /></button>
      </div>
    </div>
  );
};

// ── Main Clients component ─────────────────────────────────────────────────────
const Clients = () => {
  const navigate = useNavigate();

  const [clients,     setClients]     = useState([]);
  const [caseMap,     setCaseMap]     = useState({}); // clientId → { active, pending, closed }
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [activeTab,   setActiveTab]   = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  // ── Fetch clients + cases in parallel ─────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [clRes, caseRes] = await Promise.all([
        api.get('/clients/'),
        api.get('/cases/'),
      ]);

      const clientList = Array.isArray(clRes.data)   ? clRes.data   : (clRes.data.results   || []);
      const caseList   = Array.isArray(caseRes.data)  ? caseRes.data  : (caseRes.data.results  || []);

      // Build per-client case counts
      const map = {};
      caseList.forEach(c => {
        const id = c.client;
        if (!id) return;
        if (!map[id]) map[id] = { active: 0, pending: 0, closed: 0 };
        const ns = normaliseStatus(c.status);
        if (ns === 'Active')  map[id].active++;
        if (ns === 'Pending') map[id].pending++;
        if (ns === 'Closed')  map[id].closed++;
      });

      setClients(clientList);
      setCaseMap(map);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to load clients.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [activeTab, searchQuery]);

  // ── Delete client ─────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this client? This cannot be undone.')) return;
    try {
      await api.delete(`/clients/${id}/`);
      setClients(prev => prev.filter(c => c.id !== id));
    } catch { alert('Failed to delete client.'); }
  };

  // ── Filter tab counts ──────────────────────────────────────────────────────
  const counts = {
    All:     clients.length,
    Active:  clients.filter(c => (caseMap[c.id]?.active  || 0) > 0).length,
    Pending: clients.filter(c => (caseMap[c.id]?.pending || 0) > 0).length,
    Closed:  clients.filter(c => {
      const m = caseMap[c.id] || { active: 0, pending: 0 };
      return m.active === 0 && m.pending === 0;
    }).length,
  };

  // ── Apply filter + search ──────────────────────────────────────────────────
  const filtered = clients
    .filter(c => {
      if (activeTab === 'All')     return true;
      if (activeTab === 'Active')  return (caseMap[c.id]?.active  || 0) > 0;
      if (activeTab === 'Pending') return (caseMap[c.id]?.pending || 0) > 0;
      if (activeTab === 'Closed')  {
        const m = caseMap[c.id] || { active: 0, pending: 0 };
        return m.active === 0 && m.pending === 0;
      }
      return true;
    })
    .filter(c => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.first_name?.toLowerCase().includes(q) ||
        c.last_name?.toLowerCase().includes(q)  ||
        c.email?.toLowerCase().includes(q)
      );
    });

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage   = Math.min(currentPage, Math.max(totalPages, 1));
  const start      = (safePage - 1) * PAGE_SIZE;
  const paginated  = filtered.slice(start, start + PAGE_SIZE);

  const TABS      = ['All', 'Active', 'Pending', 'Closed'];
  const TAB_LABEL = { All: 'All Clients', Active: 'Active', Pending: 'Pending', Closed: 'Closed' };

  return (
    <div className="cl-page">

      {/* ── Header ── */}
      <div className="cl-header">
        <h1 className="cl-title">Clients</h1>
        <button className="cl-add-btn" onClick={() => setShowAddModal(true)}>
          <PlusIcon /> Add Client
        </button>
      </div>

      {/* ── Filter tabs ── */}
      <div className="cl-tabs" role="tablist">
        {TABS.map(tab => (
          <button key={tab} role="tab" aria-selected={activeTab === tab}
            className={`cl-tab${activeTab === tab ? ' cl-tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}>
            {TAB_LABEL[tab]}
            {!loading && (
              <span className={`cl-tab-count${activeTab === tab ? ' cl-tab-count--active' : ''}`}>
                {counts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Search row ── */}
      <div className="cl-search-row">
        <div className="cl-search-wrap">
          <span className="cl-search-icon"><SearchIcon /></span>
          <input className="cl-search-input" type="search" placeholder="Search clients..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <button className="cl-filter-btn"><FilterIcon /> Filter</button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="cl-error" role="alert">
          {error}
          <button onClick={loadData}>Retry</button>
        </div>
      )}

      {/* ── Card grid ── */}
      <div className="cl-grid">
        {loading && Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}

        {!loading && paginated.map(client => (
          <ClientCard
            key={client.id}
            client={client}
            activeCaseCount={caseMap[client.id]?.active || 0}
            onViewCases={() => navigate('/cases')}
            onDelete={() => handleDelete(client.id)}
          />
        ))}

        {!loading && paginated.length === 0 && (
          <div className="cl-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.2" style={{ width: 56, height: 56, marginBottom: 12 }}>
              <circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
              <circle cx="17" cy="8" r="3"/><path d="M21 20c0-3.3-2.7-6-6-6"/>
            </svg>
            <p>{clients.length === 0 ? 'No clients yet. Click Add Client to get started.' : 'No clients match your filter.'}</p>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {!loading && (
        <Pagination currentPage={safePage} totalPages={totalPages} totalItems={filtered.length} onPage={setCurrentPage} />
      )}

      {/* ── Add Client Modal ── */}
      {showAddModal && (
        <AddClientModal
          onClose={() => setShowAddModal(false)}
          onSaved={(newClient) => { setClients(prev => [...prev, newClient]); setShowAddModal(false); }}
        />
      )}

    </div>
  );
};

export default Clients;