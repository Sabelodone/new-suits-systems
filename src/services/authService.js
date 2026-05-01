// src/services/authService.js
//
// Handles all authentication calls against the Django/DRF backend.
//
// KEY BEHAVIOURS:
//  - BASE_URL points to the live Render deployment (no localhost).
//  - login() sends username + password, receives JWT access + refresh tokens.
//  - Backend already returns user object inside /api/auth/login/ response.
//  - For ADMIN / SUPERUSER accounts the tenant-code field is ignored —
//    they can log in without providing one, just like Django admin.
//  - For regular users the typed tenant code is validated against the
//    server-side value; mismatch = clear tokens + meaningful error.

// ── 1. Base URL ──────────────────────────────────────────────────────────────
const BASE_URL = "https://suits-webapp-backend.onrender.com";

// ── 2. Helpers ───────────────────────────────────────────────────────────────
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
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return body;
}

// ── 3. Main login function ───────────────────────────────────────────────────
export async function login(username, password, tenantCode = "") {
  // 🔥 DO NOT CHANGE: backend expects "login", NOT username/password object change
  const tokens = await apiFetch("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify({
      login: username,
      password: password,
    }),
  });

  const { access, refresh, user } = tokens;

  if (!access) {
    throw new Error("No access token received. Check backend configuration.");
  }

  if (!user) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    throw new Error("User data not returned from login.");
  }

  // Store tokens immediately
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);

  // ── Tenant validation (unchanged logic) ────────────────────────────────────
  const isAdmin = user.is_staff || user.is_superuser;

  if (!isAdmin) {
    if (!tenantCode.trim()) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      throw new Error(
        "Firm Code is required. Please enter the code provided by your administrator."
      );
    }

    const serverCode = (user.tenant_code || "").trim().toLowerCase();
    const typedCode = tenantCode.trim().toLowerCase();

    if (serverCode && typedCode !== serverCode) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      throw new Error(
        "Firm Code does not match your account. Please check the code and try again."
      );
    }

    localStorage.setItem("tenantCode", user.tenant_code || "");
  } else {
    localStorage.setItem("tenantCode", "");
  }

  // Store user
  localStorage.setItem("user", JSON.stringify(user));

  return user;
}

// ── 4. Logout ────────────────────────────────────────────────────────────────
export function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("tenantCode");
  localStorage.removeItem("user");
}

// ── 5. Token accessors ───────────────────────────────────────────────────────
export const getAccessToken = () => localStorage.getItem("accessToken");
export const getRefreshToken = () => localStorage.getItem("refreshToken");
export const getTenantCode = () => localStorage.getItem("tenantCode");
export const isAuthenticated = () => Boolean(getAccessToken());

// ── 6. Current user ──────────────────────────────────────────────────────────
export function getCurrentUser() {
  const raw = localStorage.getItem("user");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}