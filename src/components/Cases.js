/**
 * src/components/Cases.js
 *
 * Cases list page — card grid layout matching the design screenshot exactly.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * LAYOUT (top → bottom):
 *   1. Page header: "Cases" title + "+ New Case" button
 *   2. Filter tabs: All Cases (n) | Active (n) | Pending (n) | Closed (n)
 *   3. Search bar + Filter button row
 *   4. 3-column card grid (responsive: 2 on tablet, 1 on mobile)
 *
 * CARD ANATOMY:
 *   ┌──────────────────────────────────────────────────┐
 *   │ [🗂 icon]  Case Title              ⋮ (menu)      │
 *   │            Case Type (workflow)                  │
 *   │                                                  │
 *   │ 👤  Client: Jane Doe                            │
 *   │ 📅  Due: Oct 25, 2021                           │
 *   │ 📄  12 Documents                                │
 *   │                                                  │
 *   │ [Active]    A  B  C  +1                         │
 *   └──────────────────────────────────────────────────┘
 *
 * ALL EXISTING FUNCTIONALITY KEPT:
 *   - Fetch from GET /api/cases/ via api.js (JWT + X-Tenant-Code auto-attached)
 *   - Delete via DELETE /api/cases/{id}/
 *   - Single click → CaseDetail modal (workflow controls)
 *   - Double click → /document-management page for that case
 *   - Tab filter counts derived from live data (not hardcoded)
 *   - Search filters by title, code, and client name
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate }  from 'react-router-dom';
import { modals }       from '@mantine/modals';
import api              from '../services/api';
import { CaseDetail }   from './CaseDetail';
import './Cases.css';

// ── Status normaliser ──────────────────────────────────────────────────────────
// Maps raw backend status strings to display categories.
// The backend stores workflow step names (e.g. "Initial Consultation") as status.
function normaliseStatus(raw = '') {
  const s = raw.toLowerCase();
  if (s === 'closed'   || s.includes('complete') || s.includes('done'))   return 'Closed';
  if (s === 'pending'  || s.includes('pending')  || s.includes('review')) return 'Pending';
  if (s === 'open'     || s === 'active')                                  return 'Active';
  // Any other workflow step name is treated as Active
  return 'Active';
}

// ── Status badge colour config ─────────────────────────────────────────────────
const STATUS_CONFIG = {
  Active:  { bg: '#DCFCE7', text: '#166534', label: 'Active'    },
  Pending: { bg: '#FEF9C3', text: '#854D0E', label: 'Pending'   },
  Closed:  { bg: '#F1F5F9', text: '#475569', label: 'Closed'    },
};

// Consistent colours for the attorney avatar circles
const AVATAR_COLORS = [
  '#2563EB', '#7C3AED', '#059669', '#D97706',
  '#DC2626', '#0891B2', '#9D174D',
];

function avatarColor(index) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

// ── Icon components (inline SVG) ───────────────────────────────────────────────
const BriefcaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    <line x1="2" y1="13" x2="22" y2="13"/>
  </svg>
);
const PersonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8"  y1="2" x2="8"  y2="6"/>
    <line x1="3"  y1="10" x2="21" y2="10"/>
  </svg>
);
const DocIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="8" y1="13" x2="16" y2="13"/>
    <line x1="8" y1="17" x2="16" y2="17"/>
  </svg>
);
const FilterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5"  y1="12" x2="19" y2="12"/>
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="11" cy="11" r="7"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const DotsIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5"  cy="12" r="1.5"/>
    <circle cx="12" cy="12" r="1.5"/>
    <circle cx="19" cy="12" r="1.5"/>
  </svg>
);

// ── Skeleton card (shown while loading) ────────────────────────────────────────
const SkeletonCard = () => (
  <div className="case-card case-card--skeleton">
    <div className="skeleton-line" style={{ width: '60%', height: 16 }} />
    <div className="skeleton-line" style={{ width: '40%', height: 12 }} />
    <div style={{ height: 12 }} />
    <div className="skeleton-line" style={{ width: '80%', height: 12 }} />
    <div className="skeleton-line" style={{ width: '70%', height: 12 }} />
    <div className="skeleton-line" style={{ width: '50%', height: 12 }} />
    <div style={{ height: 12 }} />
    <div className="skeleton-line" style={{ width: '30%', height: 20, borderRadius: 20 }} />
  </div>
);

// ── Case card ──────────────────────────────────────────────────────────────────
const CaseCard = ({ caseItem, onClick, onDoubleClick, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef                 = useRef(null);

  const normStatus = normaliseStatus(caseItem.status);
  const sc         = STATUS_CONFIG[normStatus] || STATUS_CONFIG.Active;

  // Format date for "Due: " field — prefer end_date, fall back to start_date
  const dueDate = caseItem.end_date || caseItem.start_date || null;
  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return d;
    }
  };

  // Generate placeholder attorney avatars from the case code (decorative)
  // In a real app these would come from the API as assigned attorney initials.
  const avatarLetters = ['A', 'B', 'C'];
  const extraCount    = 1; // always show "+1" overflow as in the design

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div
      className="case-card"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      title="Click to view details · Double-click to open documents"
    >
      {/* ── Top row: icon + title + three-dot menu ── */}
      <div className="case-card__header">
        {/* Blue briefcase icon in a light-blue rounded square */}
        <div className="case-card__icon-wrap">
          <BriefcaseIcon />
        </div>

        {/* Title + case type */}
        <div className="case-card__title-block">
          <h3 className="case-card__title">{caseItem.title}</h3>
          {caseItem.workflow_name && (
            <span className="case-card__type">{caseItem.workflow_name}</span>
          )}
        </div>

        {/* Three-dot menu */}
        <div className="case-card__menu-wrap" ref={menuRef}>
          <button
            className="case-card__dots"
            onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }}
            aria-label="Case actions"
          >
            <DotsIcon />
          </button>
          {menuOpen && (
            <div className="case-card__dropdown">
              <button
                className="case-card__dropdown-item"
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onClick(e); }}
              >
                View Details
              </button>
              <button
                className="case-card__dropdown-item"
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDoubleClick(e); }}
              >
                Open Documents
              </button>
              <button
                className="case-card__dropdown-item case-card__dropdown-item--danger"
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(e); }}
              >
                Delete Case
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Detail rows ── */}
      <div className="case-card__details">
        <div className="case-card__detail-row">
          <span className="case-card__detail-icon"><PersonIcon /></span>
          <span>
            Client: <strong>{caseItem.client_name || '—'}</strong>
          </span>
        </div>

        <div className="case-card__detail-row">
          <span className="case-card__detail-icon"><CalendarIcon /></span>
          <span>Due: {formatDate(dueDate)}</span>
        </div>

        <div className="case-card__detail-row">
          <span className="case-card__detail-icon"><DocIcon /></span>
          <span>
            {typeof caseItem.document_count === 'number'
              ? `${caseItem.document_count} Document${caseItem.document_count !== 1 ? 's' : ''}`
              : '— Documents'}
          </span>
        </div>
      </div>

      {/* ── Footer: status badge + avatar circles ── */}
      <div className="case-card__footer">
        <span
          className="case-card__status"
          style={{ background: sc.bg, color: sc.text }}
        >
          {sc.label}
        </span>

        {/* Attorney avatar circles — decorative placeholder */}
        <div className="case-card__avatars">
          {avatarLetters.map((letter, i) => (
            <span
              key={i}
              className="case-card__avatar"
              style={{ background: avatarColor(i), zIndex: 10 - i }}
              title={`Attorney ${letter}`}
            >
              {letter}
            </span>
          ))}
          <span
            className="case-card__avatar case-card__avatar--overflow"
            title="More attorneys"
          >
            +{extraCount}
          </span>
        </div>
      </div>
    </div>
  );
};

// ── Main Cases component ────────────────────────────────────────────────────────
const Cases = () => {
  const navigate = useNavigate();

  const [cases,        setCases]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [activeTab,    setActiveTab]    = useState('All');  // filter tab
  const [searchQuery,  setSearchQuery]  = useState('');

  // Click-vs-doubleclick discrimination timer
  const clickTimer = useRef(null);

  // ── Fetch cases ──────────────────────────────────────────────────────────────
  const fetchCases = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/cases/');
      setCases(Array.isArray(data) ? data : (data.results || []));
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.message ||
        'Failed to load cases. Please retry.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCases(); }, [fetchCases]);

  // ── Delete a case ────────────────────────────────────────────────────────────
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this case? This action cannot be undone.')) return;
    try {
      await api.delete(`/cases/${id}/`);
      setCases((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert('Failed to delete case. Please try again.');
    }
  };

  // ── Single click → case detail modal ────────────────────────────────────────
  const handleClick = (caseItem) => {
    clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => {
      modals.open({
        title:    `Case: ${caseItem.code}`,
        centered: true,
        size:     'lg',
        children: <CaseDetail caseItem={caseItem} onRefresh={fetchCases} />,
      });
    }, 220);
  };

  // ── Double click → documents page for this case ──────────────────────────────
  const handleDoubleClick = (caseItem) => {
    clearTimeout(clickTimer.current);
    navigate('/document-management', {
      state: { caseId: caseItem.id, caseCode: caseItem.code },
    });
  };

  // ── Compute tab counts from live data ────────────────────────────────────────
  const counts = {
    All:     cases.length,
    Active:  cases.filter(c => normaliseStatus(c.status) === 'Active').length,
    Pending: cases.filter(c => normaliseStatus(c.status) === 'Pending').length,
    Closed:  cases.filter(c => normaliseStatus(c.status) === 'Closed').length,
  };

  // ── Filter cases by active tab + search query ────────────────────────────────
  const filtered = cases
    .filter(c => activeTab === 'All' || normaliseStatus(c.status) === activeTab)
    .filter(c => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.title?.toLowerCase().includes(q) ||
        c.code?.toLowerCase().includes(q)  ||
        c.client_name?.toLowerCase().includes(q)
      );
    });

  const TABS = ['All', 'Active', 'Pending', 'Closed'];
  const TAB_LABELS = { All: 'All Cases', Active: 'Active', Pending: 'Pending', Closed: 'Closed' };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="cases-page">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="cases-page__header">
        <h1 className="cases-page__title">Cases</h1>
        <button
          className="cases-page__new-btn"
          onClick={() => navigate('/create-case')}
        >
          <span className="cases-page__new-btn-icon"><PlusIcon /></span>
          New Case
        </button>
      </div>

      {/* ── Filter tabs ──────────────────────────────────────────────────── */}
      <div className="cases-tabs" role="tablist">
        {TABS.map(tab => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={`cases-tab${activeTab === tab ? ' cases-tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {TAB_LABELS[tab]}
            {!loading && (
              <span className={`cases-tab__count${activeTab === tab ? ' cases-tab__count--active' : ''}`}>
                {counts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Search + Filter row ──────────────────────────────────────────── */}
      <div className="cases-search-row">
        <div className="cases-search-wrap">
          <span className="cases-search-icon"><SearchIcon /></span>
          <input
            className="cases-search-input"
            type="search"
            placeholder="Search cases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search cases"
          />
        </div>
        <button className="cases-filter-btn">
          <FilterIcon />
          Filter
        </button>
      </div>

      {/* ── Error banner ─────────────────────────────────────────────────── */}
      {error && (
        <div className="cases-error" role="alert">
          {error}
          <button onClick={fetchCases}>Retry</button>
        </div>
      )}

      {/* ── Card grid ────────────────────────────────────────────────────── */}
      <div className="cases-grid">

        {/* Loading skeletons */}
        {loading && Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}

        {/* Real case cards */}
        {!loading && filtered.map(caseItem => (
          <CaseCard
            key={caseItem.id}
            caseItem={caseItem}
            onClick={() => handleClick(caseItem)}
            onDoubleClick={() => handleDoubleClick(caseItem)}
            onDelete={(e) => handleDelete(caseItem.id, e)}
          />
        ))}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="cases-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.2"
              style={{ width: 64, height: 64, marginBottom: 16 }}>
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <line x1="2" y1="13" x2="22" y2="13"/>
            </svg>
            <p>
              {cases.length === 0
                ? 'No cases yet. Click New Case to get started.'
                : `No ${activeTab.toLowerCase()} cases found.`}
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Cases;