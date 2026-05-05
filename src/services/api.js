// src/services/api.js
//
// Central Axios instance — every component imports this for backend calls.
//
// ─────────────────────────────────────────────────────────────────────────────
// WHAT WAS FIXED IN THIS VERSION:
//
//  PROBLEM — "Network Error" on every dashboard API call:
//
//    Root cause: Render's free tier cold-starts in up to 50 seconds.
//    Previous timeout was 30 000 ms (30 s) — it fired BEFORE Render could
//    respond, and axios translates a timeout into a "Network Error" (not a
//    real HTTP error code), so the error handler showed "Network Error"
//    instead of a 5xx or timeout message.
//
//    Fix: timeout raised to 65 000 ms (65 s) — enough headroom for Render's
//    50 s cold start plus actual response time.
//
//  NOTE — why the proxy in package.json doesn't matter here:
//    CRA's "proxy" setting only affects RELATIVE URL calls (e.g. fetch('/api/…')).
//    Our axios instance uses an ABSOLUTE base URL pointing directly at Render,
//    so the proxy is completely bypassed for all API calls. It has no effect
//    on production builds.
//
//  REQUEST interceptor:
//    - Adds Authorization: Bearer <token>
//    - Adds X-Tenant-Code only when non-empty
//      (admins store "" — middleware detects them via JWT, no header needed)
//
//  RESPONSE interceptor:
//    - 401 → silent token refresh → retry original request
//    - 403 → clear session + redirect to /signin
//    - Network Error (timeout/CORS) → propagate so Dashboard shows error banner
// ─────────────────────────────────────────────────────────────────────────────

import axios from 'axios';

// Pull base URL from environment (set in .env.production) or fall back to
// the Render deployment URL. Never use localhost here — this runs in the
// user's browser, not on the server.
const BASE_URL =
  process.env.REACT_APP_API_URL ||
  'https://suits-webapp-backend.onrender.com';

// ── Axios instance ─────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: `${BASE_URL}/api`, // All calls go to https://…onrender.com/api/…
  headers: {
    'Content-Type': 'application/json',
  },

  // FIX: raised from 30 000 to 65 000 ms.
  // Render free tier can take up to 50 s to cold-start.
  // 65 s gives 50 s cold-start + 15 s actual response time before we give up.
  timeout: 65000,
});

// ── REQUEST INTERCEPTOR ────────────────────────────────────────────────────────
// Runs before every outgoing request — attaches auth and tenant headers.
api.interceptors.request.use(
  (config) => {
    const token      = localStorage.getItem('accessToken');
    const tenantCode = localStorage.getItem('tenantCode');

    // JWT bearer token — required by IsAuthenticated on all protected endpoints
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // X-Tenant-Code — only attach when it's a real non-empty string.
    // Admin users have no tenant: they store "" in localStorage after login.
    // The TenantMiddleware identifies admins via JWT peek and lets them through
    // without this header, so we must NOT send an empty string — the middleware
    // treats an empty code as "missing" and returns 400 for non-admin users.
    if (tenantCode && tenantCode.trim() !== '') {
      config.headers['X-Tenant-Code'] = tenantCode.trim();
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ── RESPONSE INTERCEPTOR ───────────────────────────────────────────────────────
// Runs after every response — handles common auth failure patterns.
api.interceptors.response.use(
  (response) => response, // 2xx → pass through untouched

  async (error) => {
    const originalRequest = error.config;
    const status          = error.response?.status;

    // ── 401 Unauthorized: access token expired ─────────────────────────────
    // Attempt a silent refresh using the stored refresh token, then retry
    // the original request. The _retry flag prevents infinite retry loops.
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          // No refresh token — user must log in again
          throw new Error('No refresh token');
        }

        // Use plain axios (not our `api` instance) to avoid running interceptors
        // again on the refresh call, which would cause an infinite loop.
        const { data } = await axios.post(
          `${BASE_URL}/api/auth/refresh/`,
          { refresh: refreshToken },
          { headers: { 'Content-Type': 'application/json' }, timeout: 15000 },
        );

        localStorage.setItem('accessToken', data.access);
        originalRequest.headers['Authorization'] = `Bearer ${data.access}`;

        // Retry the original request with the new token
        return api(originalRequest);

      } catch {
        _clearSessionAndRedirect();
        return Promise.reject(error);
      }
    }

    // ── 403 Forbidden: authenticated but access denied ─────────────────────
    // Can happen if the backend session is stale or the account was revoked.
    // Clear everything and redirect to sign-in for a fresh login.
    if (status === 403) {
      console.warn('[api.js] 403 received — clearing session.');
      _clearSessionAndRedirect();
      return Promise.reject(error);
    }

    // All other errors (404, 500, network timeout, CORS) → propagate as-is.
    // Dashboard.js shows a friendly error banner and a Retry button.
    return Promise.reject(error);
  },
);

// ── Helper ─────────────────────────────────────────────────────────────────────
function _clearSessionAndRedirect() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tenantCode');
  localStorage.removeItem('user');
  if (window.location.pathname !== '/signin') {
    window.location.href = '/signin';
  }
}

export default api;