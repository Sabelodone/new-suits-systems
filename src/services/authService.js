// src/services/authService.js
//
// ─────────────────────────────────────────────────────────────────────────────
// Authentication service — all login/logout logic lives here.
//
// WHAT CHANGED & WHY:
//
//   Previously, the backend's LoginView only returned { id, username, email }.
//   The backend NOW returns is_staff, is_superuser, tenant_code, tenant_name.
//
//   ✅ Admin detection: uses user.is_staff || user.is_superuser from the
//      server response (was unreliable before because these weren't sent).
//
//   ✅ Tenant code storage: now stores user.tenant_code (the server's real
//      value) instead of the typed input — the server's value is authoritative.
//      If the server returns null (e.g. for admins), we store "" which the
//      API interceptor treats as "no tenant header" → skips the X-Tenant-Code.
//
//   ✅ Tenant validation: for firm users, the typed code is still compared
//      against the server's code to give a clear error message if they mistype.
//      Admin users skip this check entirely.
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = "https://suits-webapp-backend.onrender.com";

// ── Shared fetch wrapper ───────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let body;
  try {
    body = await response.json();
  } catch {
    body = {};
  }

  if (!response.ok) {
    const message =
      body.detail ||
      (body.non_field_errors && body.non_field_errors[0]) ||
      body.message ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return body;
}

// ── Main login function ────────────────────────────────────────────────────
export async function login(username, password, tenantCode = "") {
  // The backend expects "login" (not "username") in the request body
  const tokens = await apiFetch("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify({
      login:    username,
      password: password,
    }),
  });

  const { access, refresh, user } = tokens;

  if (!access) {
    throw new Error("No access token received. Check backend configuration.");
  }
  if (!user) {
    throw new Error("User data not returned from login.");
  }

  // Store tokens immediately — needed for subsequent API calls
  localStorage.setItem("accessToken",  access);
  localStorage.setItem("refreshToken", refresh);

  // ── Determine if this is an admin account ─────────────────────────────────
  // The backend now reliably sends these booleans — we don't guess.
  const isAdmin = user.is_staff || user.is_superuser;

  if (isAdmin) {
    // Admin users don't have a tenant — they see all data across all firms.
    // Store empty string so the API interceptor skips the X-Tenant-Code header.
    localStorage.setItem("tenantCode", "");
  } else {
    // ── Firm user validation ─────────────────────────────────────────────────
    //
    // Firm users must provide a tenant code at login (enforced on the form).
    if (!tenantCode.trim()) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      throw new Error(
        "Firm Code is required. Please enter the code provided by your administrator."
      );
    }

    // Compare the typed code against the server's authoritative value.
    // If the server returns null/empty (shouldn't happen for firm users),
    // we trust the typed code and skip validation.
    const serverCode = (user.tenant_code || "").trim().toLowerCase();
    const typedCode  = tenantCode.trim().toLowerCase();

    if (serverCode && typedCode !== serverCode) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      throw new Error(
        "Firm Code does not match your account. Please check and try again."
      );
    }

    // ✅ Store the server's tenant code (not the raw typed input) so that
    //    casing is always consistent with what the backend expects.
    localStorage.setItem("tenantCode", user.tenant_code || tenantCode);
  }

  // Store the full user object for use by UserContext and components
  localStorage.setItem("user", JSON.stringify(user));

  return user;
}

// ── Logout ─────────────────────────────────────────────────────────────────
export function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("tenantCode");
  localStorage.removeItem("user");
}

// ── Token helpers ──────────────────────────────────────────────────────────
export const getAccessToken  = () => localStorage.getItem("accessToken");
export const getRefreshToken = () => localStorage.getItem("refreshToken");
export const getTenantCode   = () => localStorage.getItem("tenantCode");
export const isAuthenticated = () => Boolean(getAccessToken());

// ── Current user helper ────────────────────────────────────────────────────
export function getCurrentUser() {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}