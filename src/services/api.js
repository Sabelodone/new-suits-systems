/**
 * src/services/api.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for ALL HTTP calls to the Django backend.
 */

import axios from 'axios';

// ─── Base URL ────────────────────────────────────────────────────────────────
const BASE_URL = process.env.REACT_APP_API_URL || 'https://suits-webapp-backend.onrender.com';

// ─── Axios instance ──────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor ─────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  const tenantCode = localStorage.getItem('tenant_code');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (tenantCode) {
    config.headers['X-Tenant-Code'] = tenantCode;
  }

  return config;
});

// ─── Response interceptor ────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('tenant_code');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Login — returns { access, refresh, user }
 * FIXES:
 *  - Uses "login" instead of "username"
 *  - Stores tenant BEFORE request so interceptor attaches it
 */
export const login = async (username, password, tenantCode) => {
  // Store tenant FIRST so interceptor picks it up
  if (tenantCode) {
    localStorage.setItem('tenant_code', tenantCode);
  }

  const response = await api.post('/api/auth/login/', {
    login: username,   // FIXED (was username)
    password: password
  });

  const { access, refresh, user } = response.data;

  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);

  // Optional but useful
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  return response.data;
};

/** Refresh the access token using the stored refresh token. */
export const refreshToken = async () => {
  const refresh = localStorage.getItem('refresh_token');
  const response = await api.post('/api/auth/refresh/', { refresh });
  localStorage.setItem('access_token', response.data.access);
  return response.data;
};

/** Remove all stored tokens and tenant info. */
export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('tenant_code');
  localStorage.removeItem('user');
};

// ═══════════════════════════════════════════════════════════════════════════════
// TENANTS
// ═══════════════════════════════════════════════════════════════════════════════

export const getTenants = () => api.get('/api/tenants/');
export const getTenant = (id) => api.get(`/api/tenants/${id}/`);
export const createTenant = (data) => api.post('/api/tenants/', data);

// ═══════════════════════════════════════════════════════════════════════════════
// LAW FIRMS
// ═══════════════════════════════════════════════════════════════════════════════

export const getLawFirms = () => api.get('/api/lawfirms/');
export const getLawFirm = (id) => api.get(`/api/lawfirms/${id}/`);
export const createLawFirm = (data) => api.post('/api/lawfirms/', data);
export const updateLawFirm = (id, data) => api.patch(`/api/lawfirms/${id}/`, data);

// ═══════════════════════════════════════════════════════════════════════════════
// ATTORNEYS
// ═══════════════════════════════════════════════════════════════════════════════

export const getAttorneys = () => api.get('/api/attorneys/');
export const createAttorney = (data) => api.post('/api/attorneys/', data);

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENTS
// ═══════════════════════════════════════════════════════════════════════════════

export const getClients = () => api.get('/api/clients/');
export const getClient = (id) => api.get(`/api/clients/${id}/`);
export const createClient = (data) => api.post('/api/clients/', data);
export const updateClient = (id, data) => api.patch(`/api/clients/${id}/`, data);
export const deleteClient = (id) => api.delete(`/api/clients/${id}/`);

// ═══════════════════════════════════════════════════════════════════════════════
// CASES
// ═══════════════════════════════════════════════════════════════════════════════

export const getCases = () => api.get('/api/cases/');
export const getCase = (id) => api.get(`/api/cases/${id}/`);
export const createCase = (data) => api.post('/api/cases/', data);
export const updateCase = (id, data) => api.patch(`/api/cases/${id}/`, data);
export const deleteCase = (id) => api.delete(`/api/cases/${id}/`);

// Workflow actions on a case
export const attachWorkflow = (caseId, workflowTemplateId) =>
  api.post(`/api/cases/${caseId}/attach_workflow/`, {
    workflow_template_id: workflowTemplateId,
  });

export const advanceStep = (caseId, context = {}) =>
  api.post(`/api/cases/${caseId}/advance_step/`, { context });

export const getWorkflowStatus = (caseId) =>
  api.get(`/api/cases/${caseId}/workflow_status/`);

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENTS
// ═══════════════════════════════════════════════════════════════════════════════

export const getDocuments = () => api.get('/api/documents/');
export const createDocument = (data) => api.post('/api/documents/', data);
export const deleteDocument = (id) => api.delete(`/api/documents/${id}/`);

// ═══════════════════════════════════════════════════════════════════════════════
// WORKFLOWS
// ═══════════════════════════════════════════════════════════════════════════════

export const getWorkflowTemplates = () => api.get('/api/workflow-templates/');
export const getWorkflowTemplate = (id) => api.get(`/api/workflow-templates/${id}/`);
export const createWorkflowTemplate = (data) => api.post('/api/workflow-templates/', data);

export const getWorkflowSteps = () => api.get('/api/steps/');
export const createWorkflowStep = (data) => api.post('/api/steps/', data);

export const getTransitions = () => api.get('/api/transitions/');
export const createTransition = (data) => api.post('/api/transitions/', data);

export default api;