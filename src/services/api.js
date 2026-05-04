// src/services/api.js
//
// Central Axios instance used by every component that needs the backend API.
//
// ─────────────────────────────────────────────────────────────────────────────
// WHAT THIS FILE DOES:
//
//   Every API call in the app goes through this single axios instance.
//   The two interceptors below run automatically on every request and response:
//
//   REQUEST interceptor  → attaches Authorization + X-Tenant-Code headers
//   RESPONSE interceptor → handles token expiry (401) with silent refresh,
//                          and handles auth failures (403) with a clean logout.
//
// WHAT WAS FIXED:
//
//    Added 403 handling. Previously only 401 was caught. A 403 (Forbidden)
//      means the server understood the request but refused it — in our system
//      this happens when the stored session is stale or the JWT is for a user
//      that no longer has access. The fix: clear all tokens and redirect to
//      /signin so the user gets a fresh login.
//
//    The X-Tenant-Code header is only added when tenantCode is a non-empty
//      string. Admins store "" as their tenant code (they have no tenant), so
//      the header is correctly omitted for admin users — the backend middleware
//      detects admins via JWT peek and lets them through without a tenant code.
//
//    Base URL uses /api (not /api/v1 — that was from the old client.js which
//      pointed to a non-existent versioned endpoint causing 404s).
// ─────────────────────────────────────────────────────────────────────────────

import axios from 'axios';

const BASE_URL =
  process.env.REACT_APP_API_URL ||
  'https://suits-webapp-backend.onrender.com';

// ── Axios instance ────────────────────────────────────────────────────────────
// All components import and call this `api` object (e.g. api.get('/cases/')).
// The base URL is set here so components never hardcode the backend address.
const api = axios.create({
  baseURL: `${BASE_URL}/api`,       // /api — NOT /api/v1 (old client.js was wrong)
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout — Render's free tier cold-starts slowly
});

// ── REQUEST INTERCEPTOR ───────────────────────────────────────────────────────
// Runs before every request is sent. Attaches auth and tenant headers.
api.interceptors.request.use(
  (config) => {
    const token      = localStorage.getItem('accessToken');
    const tenantCode = localStorage.getItem('tenantCode');

    // Attach JWT bearer token — required for all authenticated endpoints
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Attach tenant code — only when it's a real value (not empty string).
    // Admin users store "" as their tenant code (they have no tenant).
    // The backend middleware detects admins via the JWT and lets them through
    // without this header, so we must NOT send it empty for admins.
    if (tenantCode && tenantCode.trim()) {
      config.headers['X-Tenant-Code'] = tenantCode.trim();
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── RESPONSE INTERCEPTOR ──────────────────────────────────────────────────────
// Runs after every response. Handles token expiry transparently.
api.interceptors.response.use(
  // Successful response — pass through untouched
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const status          = error.response?.status;

    // ── 401 Unauthorized: Token expired — try to refresh silently ─────────────
    // _retry flag prevents infinite loops if the refresh endpoint itself returns 401
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          throw new Error('No refresh token stored — user must log in again.');
        }

        // Call the refresh endpoint WITHOUT the api instance (to avoid interceptors
        // running again on the refresh call itself, which would cause a loop)
        const refreshResponse = await axios.post(
          `${BASE_URL}/api/auth/refresh/`,
          { refresh: refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const { access: newAccessToken } = refreshResponse.data;

        // Store the new access token and retry the original request
        localStorage.setItem('accessToken', newAccessToken);
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        return api(originalRequest);

      } catch (refreshError) {
        // Refresh failed — session is fully expired. Clear everything and redirect.
        console.warn('Session expired. Redirecting to sign-in.');
        _clearSessionAndRedirect();
        return Promise.reject(refreshError);
      }
    }

    // ── 403 Forbidden: Auth succeeded but access was denied ───────────────────
    // In our system this typically means:
    //   - A stale Django session cookie caused SessionAuthentication to run and
    //     enforce CSRF (fixed in settings.py by putting JWT first, but handle
    //     defensively here too)
    //   - The user's account was revoked on the backend while they were logged in
    //
    // FIX: Clear the stored session and redirect to sign-in for a fresh login.
    if (status === 403) {
      console.warn('403 Forbidden received — clearing session and redirecting.');
      _clearSessionAndRedirect();
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// ── Helper: clear all auth state and redirect ─────────────────────────────────
function _clearSessionAndRedirect() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tenantCode');
  localStorage.removeItem('user');
  // Hard redirect so the React state is fully reset (no stale user context)
  if (window.location.pathname !== '/signin') {
    window.location.href = '/signin';
  }
}

export default api;
