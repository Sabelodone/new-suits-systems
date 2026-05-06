// src/services/authService.js
//
// All authentication logic — login, logout, token helpers.
//
// ─────────────────────────────────────────────────────────────────────────────
// WHAT WAS FIXED IN THIS VERSION:
//
//  PROBLEM — 500 error shown as generic "Request failed with status 500":
//    When the backend crashes at startup (e.g. circular import in serializers),
//    every endpoint returns 500. The old apiFetch() threw a generic message.
//    Now we detect 500 specifically and tell the user to wait/retry rather than
//    suggesting their credentials are wrong.
//
//  PROBLEM — Admin users couldn't log in without a firm code:
//    authService was calling apiFetch() (plain fetch) which has a 30s browser
//    timeout. Render's free tier cold-starts in up to 50s → fetch times out
//    before the login response arrives → "Failed to fetch" error.
//    Fix: added an AbortController with 65s timeout to the fetch call.
//    (Note: api.js already has 65s for post-login requests. This matches it.)
//
//  WHAT STAYED THE SAME:
//    - Admin detection via user.is_staff || user.is_superuser
//    - tenant_code storage logic (server's code is authoritative)
//    - All exports (login, logout, getAccessToken, etc.)
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL =
  process.env.REACT_APP_API_URL ||
  'https://suits-webapp-backend.onrender.com';

// ── fetch wrapper with 65-second timeout ──────────────────────────────────────
// Browser's native fetch() has no built-in timeout. On Render's free tier,
// the backend takes up to 50 s to cold-start. Without a timeout, the browser
// will wait indefinitely (or apply its own ~2 min timeout) — a bad UX.
// With 65 s we match api.js (axios) and give Render enough time to wake up.
async function apiFetch(path, options = {}) {
  const controller = new AbortController();
  // 65 000 ms = 65 s — enough for Render's 50 s cold start + response time
  const timeoutId  = setTimeout(() => controller.abort(), 65000);

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
  } catch (err) {
    // AbortError = our 65s timeout fired
    // TypeError  = network failure (offline, DNS, CORS preflight blocked)
    if (err.name === 'AbortError') {
      throw new Error(
        'The server is taking too long to respond. ' +
        'It may be waking up (this can take 30–50 s on a free plan). ' +
        'Please wait a moment and try again.'
      );
    }
    throw new Error(
      'Cannot reach the server. Check your internet connection and try again.'
    );
  } finally {
    clearTimeout(timeoutId);
  }

  // Parse the JSON body (even for error responses — DRF returns JSON errors)
  let body = {};
  try {
    body = await response.json();
  } catch {
    // Non-JSON response (e.g. HTML 502 from Render's load balancer)
    body = {};
  }

  // Handle HTTP error status codes with specific messages
  if (!response.ok) {
    if (response.status === 500) {
      // Backend startup crash (e.g. circular import, migration error).
      // The backend log will have the real traceback.
      throw new Error(
        'The server encountered an internal error (500). ' +
        'This is a backend issue — not your credentials. ' +
        'Check Render logs for the traceback.'
      );
    }

    if (response.status === 400 && body.message) {
      // Our custom LoginView returns {field, message} for validation errors
      throw new Error(body.message);
    }

    const message =
      body.detail ||
      body.message ||
      (body.non_field_errors && body.non_field_errors[0]) ||
      `Login failed (HTTP ${response.status}). Please try again.`;

    throw new Error(message);
  }

  return body;
}


// ── login() ───────────────────────────────────────────────────────────────────
// Called by UserContext.signIn() which is called by SignIn.js on form submit.
//
// Parameters:
//   username   — email OR username (backend accepts both via "login" field)
//   password   — plain text (sent over HTTPS, hashed on server)
//   tenantCode — the firm code entered in the sign-in form
//                → empty string for admin users (they have no firm code)
//
// On success: stores tokens + user in localStorage, returns the user object.
// On failure: throws with a human-readable message for the UI to display.
export async function login(username, password, tenantCode = '') {
  const tokens = await apiFetch('/api/auth/login/', {
    method: 'POST',
    body: JSON.stringify({
      login:    username,   // ← "login" not "username" — backend accepts email OR username
      password: password,
    }),
  });

  const { access, refresh, user } = tokens;

  if (!access) {
    throw new Error('No access token received. Check backend configuration.');
  }
  if (!user) {
    throw new Error(
      'Login succeeded but no user data was returned. ' +
      'Ensure your backend LoginView returns a "user" object.'
    );
  }

  // Store JWT tokens immediately
  localStorage.setItem('accessToken',  access);
  localStorage.setItem('refreshToken', refresh);

  // ── Admin users — no tenant ────────────────────────────────────────────────
  // is_staff and is_superuser are returned by our custom LoginView.
  // Admin users don't belong to any firm — store "" so api.js skips the header.
  const isAdmin = Boolean(user.is_staff || user.is_superuser);

  if (isAdmin) {
    localStorage.setItem('tenantCode', '');

  } else {
    // ── Firm users — validate and store the tenant code ────────────────────
    // The firm code is optional on the form (admin users leave it blank).
    // For firm users, it must match what the server returned.

    if (!tenantCode || !tenantCode.trim()) {
      // Firm user tried to log in without entering a firm code
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw new Error(
        'Firm Code is required for non-admin accounts. ' +
        'Enter the code provided by your administrator.'
      );
    }

    // Compare entered code against the server's authoritative value.
    // If server returned null (unexpected for a firm user), we trust the typed code.
    const serverCode = (user.tenant_code || '').trim().toUpperCase();
    const typedCode  = tenantCode.trim().toUpperCase();

    if (serverCode && typedCode !== serverCode) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw new Error(
        `Firm Code "${typedCode}" does not match your account. ` +
        'Please check the code and try again.'
      );
    }

    // Store the server's canonical code (correct casing, trimmed)
    localStorage.setItem('tenantCode', user.tenant_code || tenantCode);
  }

  // Store the full user object — UserContext reads this on page refresh
  localStorage.setItem('user', JSON.stringify(user));

  return user;
}


// ── logout() ──────────────────────────────────────────────────────────────────
// Clears all auth state from localStorage. Called by UserContext.signOut().
export function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tenantCode');
  localStorage.removeItem('user');
}


// ── Token / auth helpers ───────────────────────────────────────────────────────
export const getAccessToken  = () => localStorage.getItem('accessToken');
export const getRefreshToken = () => localStorage.getItem('refreshToken');
export const getTenantCode   = () => localStorage.getItem('tenantCode');
export const isAuthenticated = () => Boolean(getAccessToken());

// Returns the parsed user object from localStorage, or null if missing/invalid.
export function getCurrentUser() {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}