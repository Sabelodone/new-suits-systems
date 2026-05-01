// src/components/UserContext.js
//
// User Authentication Context
// ─────────────────────────────────────────────────────────────────────────────
//
// WHAT CHANGED vs. previous version:
//   ✅ signIn() now accepts a third argument: tenantCode
//   ✅ Passes tenantCode down to authService.login()
//   ✅ Everything else is unchanged
//
// Any component can call useUser() to access:
//   user    → the logged-in user object (or null)
//   loading → true while we're checking localStorage on app start
//   signIn  → async fn(username, password, tenantCode) → logs in + sets user
//   signOut → clears everything + sets user to null

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  login as apiLogin,
  logout as apiLogout,
  getCurrentUser,
  isAuthenticated,
} from '../services/authService';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = getCurrentUser();
    if (storedUser && isAuthenticated()) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const signIn = async (username, password, tenantCode = '') => {
    const userData = await apiLogin(username, password, tenantCode);
    setUser(userData);
    return userData;
  };

  const signOut = () => {
    apiLogout();
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);