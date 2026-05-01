// src/services/casesService.js
//
// Cases Service — API calls for case management.
//
// All functions use the central `api` instance (src/services/api.js),
// which automatically attaches the auth token + tenant header.
// You never need to worry about that here.
//
// Available Django endpoints (from apps/lawfirms/urls.py):
//   GET    /api/cases/                        → list cases for your firm
//   POST   /api/cases/                        → create a new case
//   GET    /api/cases/{id}/                   → get one case
//   PATCH  /api/cases/{id}/                   → update a case
//   DELETE /api/cases/{id}/                   → delete a case
//   POST   /api/cases/{id}/attach_workflow/   → attach a workflow template
//   POST   /api/cases/{id}/advance_step/      → move to next workflow step
//   GET    /api/cases/{id}/workflow_status/   → get step progress

import api from './api';

/** Fetch all cases belonging to the logged-in attorney's law firm */
export const fetchCases = async () => {
  const response = await api.get('/cases/');
  return response.data;
};

/** Fetch a single case by its database ID */
export const fetchCase = async (id) => {
  const response = await api.get(`/cases/${id}/`);
  return response.data;
};

/**
 * Create a new case.
 *
 * Required fields:  { code, title, client }
 * Optional fields:  { workflow_template, end_date }
 *
 * Note: `law_firm` is automatically set by the backend using the
 * logged-in user's attorney profile (see CaseViewSet.perform_create).
 * You do NOT need to send it.
 */
export const createCase = async (caseData) => {
  const response = await api.post('/cases/', caseData);
  return response.data;
};

/** Partially update a case (only send the fields you want to change) */
export const updateCase = async (id, caseData) => {
  const response = await api.patch(`/cases/${id}/`, caseData);
  return response.data;
};

/** Delete a case permanently */
export const deleteCase = async (id) => {
  await api.delete(`/cases/${id}/`);
};

/**
 * Attach a workflow template to a case.
 * This sets the case's first workflow step and updates its status.
 *
 * @param {number} caseId             - The case to update
 * @param {number} workflowTemplateId - The workflow to attach
 */
export const attachWorkflow = async (caseId, workflowTemplateId) => {
  const response = await api.post(`/cases/${caseId}/attach_workflow/`, {
    workflow_template_id: workflowTemplateId,
  });
  return response.data;
};

/**
 * Advance a case to its next workflow step.
 *
 * context is optional — used for conditional branching.
 * Example: { decision: 'APPROVED' } will follow the "Approved" transition.
 * Leaving it empty follows the default/linear transition.
 */
export const advanceStep = async (caseId, context = {}) => {
  const response = await api.post(`/cases/${caseId}/advance_step/`, { context });
  return response.data;
};

/** Get the full workflow status: current step, all steps, available transitions */
export const getWorkflowStatus = async (caseId) => {
  const response = await api.get(`/cases/${caseId}/workflow_status/`);
  return response.data;
};