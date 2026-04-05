/**
 * src/components/UserContext.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Global auth state for the entire app.
 *
 * BEFORE: signIn() just called setUser({ email }) — no real API call.
 * AFTER:  signIn() calls the Django JWT endpoint, stores tokens, loads the
 *         user's attorney profile (which gives us their law firm & tenant).
 *
 * What's stored in context:
 *   user        — { email, username, id } from the JWT payload
 *   attorney    — the attorney record from the backend (has .law_firm)
 *   tenant      — { id, name, code } — needed for X-Tenant-Code header
 *   loading     — true while we're re-hydrating from localStorage on page load
 *
 * Children can consume this with: const { user, signIn, signOut } = useUser();
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, getAttorneys } from '../services/api';

// Create the context object
const UserContext = createContext();

// ─── Helper: decode JWT payload without a library ────────────────────────────
// JWTs are base64-encoded JSON. We just need the payload (middle segment).
const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    // atob decodes base64 → JSON string → parse to object
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

// ─── Provider ────────────────────────────────────────────────────────────────
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // decoded token payload
  const [attorney, setAttorney] = useState(null); // backend attorney record
  const [tenant, setTenant] = useState(null);   // tenant for header
  const [loading, setLoading] = useState(true); // re-hydration in progress

  // ── On mount: re-hydrate from localStorage ─────────────────────────────────
  // If the user refreshes the page we don't want them logged out.
  // We read the stored access token, decode it, and restore state.
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    const storedTenant = localStorage.getItem('tenant_code');

    if (token && storedUser) {
      const decoded = decodeToken(token);

      // Check the token isn't expired (exp is a Unix timestamp in seconds)
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setUser(JSON.parse(storedUser));
        if (storedTenant) {
          setTenant({ code: storedTenant });
        }
        // Also load the attorney profile so components have law_firm info
        loadAttorney();
      } else {
        // Token expired — clean up silently
        apiLogout();
      }
    }

    setLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load attorney profile ──────────────────────────────────────────────────
  // The backend returns attorneys scoped to the logged-in user's law firm.
  // We grab the first result — an attorney can only belong to one firm.
  const loadAttorney = async () => {
    try {
      const response = await getAttorneys();
      if (response.data.length > 0) {
        setAttorney(response.data[0]);
      }
    } catch (err) {
      // Not critical — just means attorney info isn't available yet
      console.warn('Could not load attorney profile:', err.message);
    }
  };

  // ── signIn ─────────────────────────────────────────────────────────────────
  // Calls the real Django JWT endpoint. On success, stores tokens + user.
  // The caller (SignIn.js) passes tenantCode so we can set the header.
  const signIn = async (username, password, tenantCode) => {
    // Store tenant code BEFORE the login call so the interceptor can attach it
    if (tenantCode) {
      localStorage.setItem('tenant_code', tenantCode);
      setTenant({ code: tenantCode });
    }

    // Call the backend — this stores tokens in localStorage via api.js
    const data = await apiLogin(username, password);

    // Decode the access token to get user info (user_id, username, email)
    const decoded = decodeToken(data.access);
    const userData = {
      id: decoded?.user_id,
      username: decoded?.username || username,
      email: decoded?.email || '',
    };

    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));

    // Load the attorney profile in the background
    await loadAttorney();

    return userData;
  };

  // ── signOut ────────────────────────────────────────────────────────────────
  const signOut = () => {
    apiLogout(); // removes tokens from localStorage
    setUser(null);
    setAttorney(null);
    setTenant(null);
  };

  // ── Expose context value ───────────────────────────────────────────────────
  const value = {
    user,       // { id, username, email }
    attorney,   // { id, law_firm, title, ... }
    tenant,     // { code }
    loading,    // true during initial re-hydration
    signIn,
    signOut,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used inside a UserProvider');
  }
  return context;
};

export default UserContext;