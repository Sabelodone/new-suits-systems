/**
 * src/components/Cases.js
 *
 * CHANGES IN THIS VERSION:
 *
 *  1. PAGINATION — 9 cards per page
 *     - PAGE_SIZE = 9 (3 rows × 3 cols in the design)
 *     - currentPage state, resets to 1 whenever the filter tab or search changes
 *     - Pagination bar at the bottom:
 *         "28 cases"  ←  [1]  [2]  [3]  →
 *     - Prev/Next arrow buttons disabled at the boundaries
 *     - Page number buttons: shows up to 5 page numbers, with "…" ellipsis
 *       when there are many pages
 *
 *  2. document_count — already in the card render; now the backend serializer
 *     actually returns it, so "12 Documents" shows real data instead of "—".
 *
 *  All other functionality (search, filter tabs with counts, detail modal,
 *  double-click to documents, delete via three-dot menu) is unchanged.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate }  from 'react-router-dom';
import { modals }       from '@mantine/modals';
import api              from '../services/api';
import { CaseDetail }   from './CaseDetail';
import './Cases.css';

// ── Page size ─────────────────────────────────────────────────────────────────
// 9 cards = 3 complete rows in the 3-column grid, matching the design.
const PAGE_SIZE = 9;

// ── Status normaliser ──────────────────────────────────────────────────────────
function normaliseStatus(raw = '') {
  const s = raw.toLowerCase();
  if (s === 'closed'  || s.includes('complete') || s.includes('done'))   return 'Closed';
  if (s === 'pending' || s.includes('pending')  || s.includes('review')) return 'Pending';
  if (s === 'open'    || s === 'active')                                  return 'Active';
  return 'Active';
}

const STATUS_CONFIG = {
  Active:  { bg: '#DCFCE7', text: '#166534', label: 'Active'  },
  Pending: { bg: '#FEF9C3', text: '#854D0E', label: 'Pending' },
  Closed:  { bg: '#F1F5F9', text: '#475569', label: 'Closed'  },
};

const AVATAR_COLORS = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0891B2'];
const avatarColor   = (i) => AVATAR_COLORS[i % AVATAR_COLORS.length];

// ── Inline SVG icons ───────────────────────────────────────────────────────────
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
const ChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const ChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

// ── Skeleton card ──────────────────────────────────────────────────────────────
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

// ── Pagination helper: build page number array with "…" ────────────────────────
// e.g. totalPages=10, current=6  →  [1, '…', 5, 6, 7, '…', 10]
function buildPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    // Few enough pages — show them all
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = [];
  const WINDOW = 1; // pages on each side of current

  pages.push(1);
  if (currentPage - WINDOW > 2) pages.push('…');

  for (let p = Math.max(2, currentPage - WINDOW); p <= Math.min(totalPages - 1, currentPage + WINDOW); p++) {
    pages.push(p);
  }

  if (currentPage + WINDOW < totalPages - 1) pages.push('…');
  pages.push(totalPages);

  return pages;
}

// ── Case card component ────────────────────────────────────────────────────────
const CaseCard = ({ caseItem, onClick, onDoubleClick, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef                 = useRef(null);

  const normStatus = normaliseStatus(caseItem.status);
  const sc         = STATUS_CONFIG[normStatus] || STATUS_CONFIG.Active;

  const dueDate   = caseItem.end_date || caseItem.start_date || null;
  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return d; }
  };

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
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
      {/* ── Top: icon + title + menu ── */}
      <div className="case-card__header">
        <div className="case-card__icon-wrap"><BriefcaseIcon /></div>

        <div className="case-card__title-block">
          <h3 className="case-card__title">{caseItem.title}</h3>
          {caseItem.workflow_name && (
            <span className="case-card__type">{caseItem.workflow_name}</span>
          )}
        </div>

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
              <button className="case-card__dropdown-item"
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onClick(e); }}>
                View Details
              </button>
              <button className="case-card__dropdown-item"
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDoubleClick(e); }}>
                Open Documents
              </button>
              <button className="case-card__dropdown-item case-card__dropdown-item--danger"
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(e); }}>
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
          <span>Client: <strong>{caseItem.client_name || '—'}</strong></span>
        </div>
        <div className="case-card__detail-row">
          <span className="case-card__detail-icon"><CalendarIcon /></span>
          <span>Due: {formatDate(dueDate)}</span>
        </div>
        <div className="case-card__detail-row">
          <span className="case-card__detail-icon"><DocIcon /></span>
          {/* document_count comes from the backend serializer */}
          <span>
            {typeof caseItem.document_count === 'number'
              ? `${caseItem.document_count} Document${caseItem.document_count !== 1 ? 's' : ''}`
              : '— Documents'}
          </span>
        </div>
      </div>

      {/* ── Footer: badge + avatars ── */}
      <div className="case-card__footer">
        <span className="case-card__status" style={{ background: sc.bg, color: sc.text }}>
          {sc.label}
        </span>
        <div className="case-card__avatars">
          {['A', 'B', 'C'].map((l, i) => (
            <span key={i} className="case-card__avatar"
              style={{ background: avatarColor(i), zIndex: 10 - i }}>
              {l}
            </span>
          ))}
          <span className="case-card__avatar case-card__avatar--overflow">+1</span>
        </div>
      </div>
    </div>
  );
};

// ── Pagination bar component ───────────────────────────────────────────────────
// Shows: "[total] cases  ←  1  2  3  …  →"
const Pagination = ({ currentPage, totalPages, totalItems, onPage }) => {
  if (totalPages <= 1) return null;

  const pages = buildPageNumbers(currentPage, totalPages);

  // Which cases are being shown right now?
  const from = (currentPage - 1) * PAGE_SIZE + 1;
  const to   = Math.min(currentPage * PAGE_SIZE, totalItems);

  return (
    <div className="cases-pagination">

      {/* Left: case count e.g. "Showing 1–9 of 28 cases" */}
      <span className="cases-pagination__count">
        Showing <strong>{from}–{to}</strong> of <strong>{totalItems}</strong> case{totalItems !== 1 ? 's' : ''}
      </span>

      {/* Right: prev / page numbers / next */}
      <div className="cases-pagination__nav">

        {/* ← Prev */}
        <button
          className="cases-pagination__btn"
          onClick={() => onPage(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft />
        </button>

        {/* Page number buttons */}
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="cases-pagination__ellipsis">…</span>
          ) : (
            <button
              key={p}
              className={`cases-pagination__btn cases-pagination__btn--num${p === currentPage ? ' cases-pagination__btn--active' : ''}`}
              onClick={() => onPage(p)}
              aria-label={`Page ${p}`}
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        {/* → Next */}
        <button
          className="cases-pagination__btn"
          onClick={() => onPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <ChevronRight />
        </button>

      </div>
    </div>
  );
};

// ── Main Cases component ───────────────────────────────────────────────────────
const Cases = () => {
  const navigate = useNavigate();

  const [cases,       setCases]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [activeTab,   setActiveTab]   = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // ← pagination state

  const clickTimer = useRef(null);

  // ── Fetch cases ──────────────────────────────────────────────────────────────
  const fetchCases = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/cases/');
      setCases(Array.isArray(data) ? data : (data.results || []));
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to load cases. Please retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCases(); }, [fetchCases]);

  // ── Reset to page 1 when filter tab or search query changes ──────────────────
  // Without this, switching from "All" (page 3) to "Active" (which may have
  // fewer items) could land the user on a page that doesn't exist.
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this case? This cannot be undone.')) return;
    try {
      await api.delete(`/cases/${id}/`);
      setCases(prev => prev.filter(c => c.id !== id));
    } catch {
      alert('Failed to delete case. Please try again.');
    }
  };

  // ── Single click → detail modal ──────────────────────────────────────────────
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

  // ── Double click → documents page ────────────────────────────────────────────
  const handleDoubleClick = (caseItem) => {
    clearTimeout(clickTimer.current);
    navigate('/document-management', { state: { caseId: caseItem.id, caseCode: caseItem.code } });
  };

  // ── Compute filter tab counts from all cases (not just current page) ──────────
  const counts = {
    All:     cases.length,
    Active:  cases.filter(c => normaliseStatus(c.status) === 'Active').length,
    Pending: cases.filter(c => normaliseStatus(c.status) === 'Pending').length,
    Closed:  cases.filter(c => normaliseStatus(c.status) === 'Closed').length,
  };

  // ── Apply tab filter + search filter ────────────────────────────────────────
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

  // ── Pagination calculations ───────────────────────────────────────────────────
  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE);
  // Clamp currentPage so it's never out of bounds after filtering
  const safePage    = Math.min(currentPage, Math.max(totalPages, 1));
  const pageStart   = (safePage - 1) * PAGE_SIZE;
  const paginated   = filtered.slice(pageStart, pageStart + PAGE_SIZE); // the 9 cards for this page

  const TABS      = ['All', 'Active', 'Pending', 'Closed'];
  const TAB_LABEL = { All: 'All Cases', Active: 'Active', Pending: 'Pending', Closed: 'Closed' };

  return (
    <div className="cases-page">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="cases-page__header">
        <h1 className="cases-page__title">Cases</h1>
        <button className="cases-page__new-btn" onClick={() => navigate('/create-case')}>
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
            {TAB_LABEL[tab]}
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
            onChange={e => setSearchQuery(e.target.value)}
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

      {/* ── Card grid (9 cards per page) ─────────────────────────────────── */}
      <div className="cases-grid">
        {/* Loading skeletons — 9 placeholders matching the page size */}
        {loading && Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}

        {/* Real case cards — only the current page's slice */}
        {!loading && paginated.map(caseItem => (
          <CaseCard
            key={caseItem.id}
            caseItem={caseItem}
            onClick={() => handleClick(caseItem)}
            onDoubleClick={() => handleDoubleClick(caseItem)}
            onDelete={e => handleDelete(caseItem.id, e)}
          />
        ))}

        {/* Empty state */}
        {!loading && paginated.length === 0 && (
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

      {/* ── Pagination bar ───────────────────────────────────────────────── */}
      {/* Hidden while loading and when there's only 1 page or fewer */}
      {!loading && (
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={filtered.length}
          onPage={setCurrentPage}
        />
      )}

    </div>
  );
};

export default Cases;