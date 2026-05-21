/**
 * src/components/Tasks.js
 * Tasks list view — matches the design screenshot exactly.
 *
 * LAYOUT:
 *   Top : "Tasks" title + "+ New Task" + filter tabs
 *   Body: Two-column
 *     Left  (~75%) : Task List card — scrollable task rows
 *     Right (~25%) : Filters card + Summary card
 *
 * STATUS CIRCLES (clickable — calls POST /api/tasks/{id}/toggle/):
 *   ● green check  = Completed
 *   ◑ yellow dot   = In Progress
 *   ○ blue empty   = Pending
 *
 * API:
 *   GET    /api/tasks/            — list tasks for the firm
 *   POST   /api/tasks/            — create new task
 *   DELETE /api/tasks/{id}/       — delete task
 *   POST   /api/tasks/{id}/toggle/— cycle status
 */

import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import './Tasks.css';

const STATUSES   = ['All', 'Pending', 'In Progress', 'Completed'];
const PRIORITIES = ['All Priorities', 'High', 'Medium', 'Low'];
const CATEGORIES = ['All Categories', 'Legal', 'Client', 'Court', 'Administrative', 'Other'];

const PRIORITY_STYLE = {
  High:   { bg: '#FEE2E2', text: '#DC2626' },
  Medium: { bg: '#FEF9C3', text: '#92400E' },
  Low:    { bg: '#DCFCE7', text: '#166534' },
};
const CATEGORY_STYLE = { bg: '#F3F4F6', text: '#374151' };

// ── Icons ─────────────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3" strokeLinecap="round"/>
  </svg>
);
const FilterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);

// ── Status circle button ───────────────────────────────────────────────────────
// Clicking cycles: Pending → In Progress → Completed → Pending
const StatusCircle = ({ status, onClick, loading }) => {
  if (status === 'Completed') return (
    <button className="tk-status-btn" onClick={onClick} disabled={loading}
      title="Mark as Pending" aria-label="Completed — click to set Pending">
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#22C55E" stroke="#16A34A" strokeWidth="1.5"/>
        <path d="M7 12l3.5 3.5 6.5-7" stroke="white" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
  if (status === 'In Progress') return (
    <button className="tk-status-btn" onClick={onClick} disabled={loading}
      title="Mark as Completed" aria-label="In Progress — click to set Completed">
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="none" stroke="#F59E0B" strokeWidth="2"/>
        <path d="M12 7v5" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="12" cy="15.5" r="1.2" fill="#F59E0B"/>
      </svg>
    </button>
  );
  return (
    <button className="tk-status-btn" onClick={onClick} disabled={loading}
      title="Mark as In Progress" aria-label="Pending — click to set In Progress">
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="none" stroke="#93C5FD" strokeWidth="2"/>
      </svg>
    </button>
  );
};

// ── Add Task Modal ─────────────────────────────────────────────────────────────
const AddTaskModal = ({ cases, onClose, onSaved }) => {
  const [form, setForm] = useState({
    title: '', description: '', due_date: '',
    priority: 'Medium', category: 'Other', case: '', status: 'Pending',
  });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setErr('Title is required.'); return; }
    setErr(''); setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.case)     delete payload.case;
      if (!payload.due_date) delete payload.due_date;
      const { data } = await api.post('/tasks/', payload);
      onSaved(data);
    } catch (err) {
      const d = err.response?.data;
      setErr(d ? Object.values(d).flat().join(' ') : 'Failed to save task. Try again.');
    } finally { setSaving(false); }
  };

  return (
    <div className="tk-overlay" onClick={onClose}>
      <div className="tk-modal" onClick={e => e.stopPropagation()}>
        <div className="tk-modal-hd">
          <h3>New Task</h3>
          <button className="tk-modal-x" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {err && <div className="tk-modal-err">{err}</div>}
        <form onSubmit={submit} className="tk-modal-form" noValidate>
          <div className="tk-mf">
            <label>Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="e.g. Review Johnson Contract" required autoFocus />
          </div>
          <div className="tk-mf">
            <label>Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Task details…" rows={2} />
          </div>
          <div className="tk-modal-row">
            <div className="tk-mf">
              <label>Due Date</label>
              <input type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} />
            </div>
            <div className="tk-mf">
              <label>Priority</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)}>
                <option>High</option><option>Medium</option><option>Low</option>
              </select>
            </div>
          </div>
          <div className="tk-modal-row">
            <div className="tk-mf">
              <label>Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                <option>Legal</option><option>Client</option><option>Court</option>
                <option>Administrative</option><option>Other</option>
              </select>
            </div>
            <div className="tk-mf">
              <label>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}>
                <option>Pending</option><option>In Progress</option><option>Completed</option>
              </select>
            </div>
          </div>
          <div className="tk-mf">
            <label>Link to Case (optional)</label>
            <select value={form.case} onChange={e => set('case', e.target.value)}>
              <option value="">— No case —</option>
              {cases.map(c => (
                <option key={c.id} value={c.id}>{c.code} — {c.title}</option>
              ))}
            </select>
          </div>
          <div className="tk-modal-actions">
            <button type="button" className="tk-btn-cancel" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="tk-btn-save" disabled={saving}>
              {saving ? 'Saving…' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Task row ───────────────────────────────────────────────────────────────────
const TaskRow = ({ task, onToggle, onDelete, toggling }) => {
  const ps = PRIORITY_STYLE[task.priority] || CATEGORY_STYLE;

  const formatDate = (d) => {
    if (!d) return null;
    try {
      return new Date(d + 'T00:00:00').toLocaleDateString('en-US',
        { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch { return d; }
  };

  return (
    <div className={`tk-row${task.status === 'Completed' ? ' tk-row--done' : ''}`}>
      {/* Clickable status circle */}
      <div className="tk-row-icon">
        <StatusCircle status={task.status} onClick={onToggle} loading={toggling} />
      </div>

      <div className="tk-row-body">
        {/* Title row + badges */}
        <div className="tk-row-top">
          <span className={`tk-row-title${task.status === 'Completed' ? ' tk-row-title--done' : ''}`}>
            {task.title}
          </span>
          <div className="tk-row-badges">
            {task.priority && (
              <span className="tk-badge" style={{ background: ps.bg, color: ps.text }}>
                {task.priority}
              </span>
            )}
            {task.category && task.category !== 'Other' && (
              <span className="tk-badge" style={{ background: CATEGORY_STYLE.bg, color: CATEGORY_STYLE.text }}>
                {task.category}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="tk-row-desc">{task.description}</p>
        )}

        {/* Due date + linked case */}
        <div className="tk-row-meta">
          {task.due_date && (
            <span className="tk-row-due">
              <span className="tk-row-due-icon"><ClockIcon /></span>
              Due: {formatDate(task.due_date)}
            </span>
          )}
          {task.case_title && (
            <span className="tk-row-case">📁 {task.case_title}</span>
          )}
        </div>
      </div>

      {/* Delete — appears on row hover */}
      <button className="tk-row-del" onClick={onDelete} aria-label="Delete task" title="Delete">✕</button>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
const Tasks = () => {
  const [tasks,      setTasks]      = useState([]);
  const [cases,      setCases]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [showModal,  setShowModal]  = useState(false);
  const [activeTab,  setActiveTab]  = useState('All');
  const [filterCat,  setFilterCat]  = useState('All Categories');
  const [filterPri,  setFilterPri]  = useState('All Priorities');
  const [toggling,   setToggling]   = useState({});

  // ── Load tasks + cases ──────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [tRes, cRes] = await Promise.all([
        api.get('/tasks/'),
        api.get('/cases/'),
      ]);
      setTasks(Array.isArray(tRes.data) ? tRes.data : (tRes.data.results || []));
      setCases(Array.isArray(cRes.data) ? cRes.data : (cRes.data.results || []));
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to load tasks.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Toggle status ───────────────────────────────────────────────────────────
  const handleToggle = async (task) => {
    setToggling(t => ({ ...t, [task.id]: true }));
    try {
      const { data } = await api.post(`/tasks/${task.id}/toggle/`);
      setTasks(prev => prev.map(t => t.id === data.id ? { ...t, status: data.status } : t));
    } catch { alert('Could not update task status. Please try again.'); }
    finally { setToggling(t => { const n = { ...t }; delete n[task.id]; return n; }); }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    try {
      await api.delete(`/tasks/${id}/`);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch { alert('Failed to delete task.'); }
  };

  // ── Computed counts ─────────────────────────────────────────────────────────
  const totalTasks     = tasks.length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
  const pendingCount   = tasks.filter(t => t.status === 'Pending').length;

  const tabCount = (tab) =>
    tab === 'All' ? totalTasks : tasks.filter(t => t.status === tab).length;

  // ── Apply all filters ───────────────────────────────────────────────────────
  const filtered = tasks.filter(t => {
    if (activeTab  !== 'All' && t.status   !== activeTab)  return false;
    if (filterCat  !== 'All Categories' && t.category !== filterCat) return false;
    if (filterPri  !== 'All Priorities' && t.priority !== filterPri) return false;
    return true;
  });

  return (
    <div className="tk-page">

      {/* ── Page header ── */}
      <div className="tk-header">
        <h1 className="tk-title">Tasks</h1>
        <button className="tk-new-btn" onClick={() => setShowModal(true)}>
          <span className="tk-new-icon"><PlusIcon /></span>
          New Task
        </button>
      </div>

      {/* ── Filter tabs ── */}
      <div className="tk-tabs" role="tablist">
        {STATUSES.map(tab => (
          <button key={tab} role="tab" aria-selected={activeTab === tab}
            className={`tk-tab${activeTab === tab ? ' tk-tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}>
            {tab === 'All' ? 'All Tasks' : tab}
            <span className={`tk-tab-count${activeTab === tab ? ' tk-tab-count--active' : ''}`}>
              {tabCount(tab)}
            </span>
          </button>
        ))}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="tk-error" role="alert">
          {error}<button onClick={loadData}>Retry</button>
        </div>
      )}

      {/* ── Two-column body ── */}
      <div className="tk-body">

        {/* LEFT: Task List */}
        <div className="tk-list-panel">
          <h2 className="tk-list-title">Task List</h2>

          {/* Skeleton rows while loading */}
          {loading && Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="tk-row tk-row--skeleton">
              <div className="tk-skel tk-skel--circle" />
              <div className="tk-row-body">
                <div className="tk-skel" style={{ width: '60%', height: 16 }} />
                <div className="tk-skel" style={{ width: '85%', height: 12, marginTop: 8 }} />
                <div className="tk-skel" style={{ width: '40%', height: 11, marginTop: 8 }} />
              </div>
            </div>
          ))}

          {/* Real task rows */}
          {!loading && filtered.map(task => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={() => handleToggle(task)}
              onDelete={() => handleDelete(task.id)}
              toggling={!!toggling[task.id]}
            />
          ))}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div className="tk-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.2"
                style={{ width: 52, height: 52, marginBottom: 12 }}>
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M8 12l3 3 5-5" strokeLinecap="round"/>
              </svg>
              <p>
                {tasks.length === 0
                  ? 'No tasks yet. Click New Task to add one.'
                  : 'No tasks match the current filters.'}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT: Filters + Summary */}
        <div className="tk-sidebar">

          {/* Filters card */}
          <div className="tk-panel">
            <div className="tk-panel-hd">
              <span className="tk-panel-icon"><FilterIcon /></span>
              <h3 className="tk-panel-title">Filters</h3>
            </div>
            <div className="tk-filter-group">
              <label className="tk-filter-label">Category</label>
              <select className="tk-filter-select"
                value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="tk-filter-group">
              <label className="tk-filter-label">Priority</label>
              <select className="tk-filter-select"
                value={filterPri} onChange={e => setFilterPri(e.target.value)}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            {(filterCat !== 'All Categories' || filterPri !== 'All Priorities') && (
              <button className="tk-clear-filters"
                onClick={() => { setFilterCat('All Categories'); setFilterPri('All Priorities'); }}>
                Clear filters
              </button>
            )}
          </div>

          {/* Summary card */}
          <div className="tk-panel">
            <h3 className="tk-panel-title">Summary</h3>
            <div className="tk-summary-row">
              <span className="tk-summary-label">Total Tasks</span>
              <strong className="tk-summary-val">{loading ? '—' : totalTasks}</strong>
            </div>
            <div className="tk-summary-row">
              <span className="tk-summary-label">Completed</span>
              <strong className="tk-summary-val tk-summary-val--green">{loading ? '—' : completedCount}</strong>
            </div>
            <div className="tk-summary-row">
              <span className="tk-summary-label">In Progress</span>
              <strong className="tk-summary-val tk-summary-val--blue">{loading ? '—' : inProgressCount}</strong>
            </div>
            <div className="tk-summary-row">
              <span className="tk-summary-label">Pending</span>
              <strong className="tk-summary-val tk-summary-val--yellow">{loading ? '—' : pendingCount}</strong>
            </div>
          </div>

        </div>
      </div>

      {/* Add Task Modal */}
      {showModal && (
        <AddTaskModal
          cases={cases}
          onClose={() => setShowModal(false)}
          onSaved={(t) => { setTasks(prev => [t, ...prev]); setShowModal(false); }}
        />
      )}

    </div>
  );
};

export default Tasks;