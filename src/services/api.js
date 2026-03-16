import axios from 'axios'

const BASE_URL = 'http://127.0.0.1:8000/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ─── Workflow APIs ────────────────────────────
export const workflowAPI = {
  getAll: (params) =>
    api.get('/workflows/', { params }),

  getOne: (id) =>
    api.get(`/workflows/${id}/`),

  create: (data) =>
    api.post('/workflows/', data),

  update: (id, data) =>
    api.put(`/workflows/${id}/`, data),

  delete: (id) =>
    api.delete(`/workflows/${id}/`),
}

// ─── Step APIs ───────────────────────────────
export const stepAPI = {
  getAll: (workflowId) =>
    api.get(`/workflows/${workflowId}/steps/`),

  create: (workflowId, data) =>
    api.post(`/workflows/${workflowId}/steps/`, data),

  update: (workflowId, stepId, data) =>
    api.put(`/workflows/${workflowId}/steps/${stepId}/`, data),

  delete: (workflowId, stepId) =>
    api.delete(`/workflows/${workflowId}/steps/${stepId}/`),
}

// ─── Rule APIs ───────────────────────────────
export const ruleAPI = {
  getAll: (workflowId, stepId) =>
    api.get(`/workflows/${workflowId}/steps/${stepId}/rules/`),

  create: (workflowId, stepId, data) =>
    api.post(`/workflows/${workflowId}/steps/${stepId}/rules/`, data),

  update: (workflowId, stepId, ruleId, data) =>
    api.put(`/workflows/${workflowId}/steps/${stepId}/rules/${ruleId}/`, data),

  delete: (workflowId, stepId, ruleId) =>
    api.delete(`/workflows/${workflowId}/steps/${stepId}/rules/${ruleId}/`),
}

// ─── Execution APIs ──────────────────────────
export const executionAPI = {
  start: (workflowId, data) =>
    api.post(`/workflows/${workflowId}/execute/`, { data }),

  get: (executionId) =>
    api.get(`/executions/${executionId}/`),

  cancel: (executionId) =>
    api.post(`/executions/${executionId}/cancel/`),

  retry: (executionId) =>
    api.post(`/executions/${executionId}/retry/`),
}

export default api