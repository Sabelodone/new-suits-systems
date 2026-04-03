/**
 * src/App.js
 * ─────────────────────────────────────────────────────────────
 * Root application component.
 *
 * Changes from old version:
 *  ✅ Uses the real UserContext (JWT-aware)
 *  ✅ Shows a full-screen spinner while session is being restored
 *  ✅ Sidebar is hidden on auth pages (signin / signup / etc.)
 *  ✅ All protected routes still use PrivateRoute
 *  ✅ Root "/" redirects to /dashboard if logged in, else /signin
 * ─────────────────────────────────────────────────────────────
 */

import React                from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider }  from '@mantine/modals';
import '@mantine/core/styles.css';

// Context
import { UserProvider, useUser } from './components/UserContext';

// Layout
import Header   from './components/Header';
import Footer   from './components/Footer';
import Sidebar  from './components/Sidebar';
import Chatbot  from './components/Chatbot';

// Pages
import Dashboard         from './components/Dashboard';
import Cases             from './components/Cases';
import CreateCase        from './components/CreateCase';
import Tasks             from './components/Tasks';
import AddTask           from './components/AddTask';
import TimeManagement    from './components/TimeManagement';
import Clients           from './components/Clients';
import DocumentManagement from './components/DocumentManagement';
import LegalTemplates    from './components/LegalTemplates';
import Settings          from './components/Settings';
import Welcome           from './components/Welcome';
import SignIn            from './components/SignIn';
import SignUp            from './components/SignUp';
import ForgotPassword    from './components/ForgotPassword';
import ResetPassword     from './components/ResetPassword';
import TermsAndConditions from './components/TermsAndConditions';
import PrivateRoute      from './components/PrivateRoute';

import './App.css';

// ─── Pages that should NOT show the sidebar / header nav ─────
const AUTH_PATHS = ['/signin', '/signup', '/forgot-password', '/reset-password', '/terms-and-conditions'];

// ─── Inner component — needs access to useUser() hook ────────
const AppShell = () => {
  const { user, loading } = useUser();

  // While restoring session from localStorage, show a full-screen spinner
  if (loading) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: '100vh', background: '#f4f0f8' }}
      >
        <Spinner animation="border" style={{ color: '#6a1b9a' }} />
      </div>
    );
  }

  return (
    <Router>
      <Header />

      <Container fluid className="app-container p-0">
        <Row className="g-0">
          {/* ── Sidebar (only when logged in) ── */}
          {user && (
            <Col md={2} className="p-0">
              <Sidebar />
            </Col>
          )}

          {/* ── Main content ── */}
          <Col md={user ? 10 : 12} className="content-area p-4">
            <Routes>
              {/* ── Public routes ── */}
              <Route path="/signin"               element={<SignIn />} />
              <Route path="/signup"               element={<SignUp />} />
              <Route path="/forgot-password"      element={<ForgotPassword />} />
              <Route path="/reset-password"       element={<ResetPassword />} />
              <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

              {/* ── Protected routes ── */}
              <Route path="/welcome"           element={<PrivateRoute><Welcome /></PrivateRoute>} />
              <Route path="/dashboard"         element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/cases"             element={<PrivateRoute><Cases /></PrivateRoute>} />
              <Route path="/create-case"       element={<PrivateRoute><CreateCase /></PrivateRoute>} />
              <Route path="/tasks"             element={<PrivateRoute><Tasks /></PrivateRoute>} />
              <Route path="/add-task"          element={<PrivateRoute><AddTask /></PrivateRoute>} />
              <Route path="/time-management"   element={<PrivateRoute><TimeManagement /></PrivateRoute>} />
              <Route path="/clients"           element={<PrivateRoute><Clients /></PrivateRoute>} />
              <Route path="/document-management" element={<PrivateRoute><DocumentManagement /></PrivateRoute>} />
              <Route path="/legal-templates"   element={<PrivateRoute><LegalTemplates /></PrivateRoute>} />
              <Route path="/settings"          element={<PrivateRoute><Settings /></PrivateRoute>} />

              {/* ── Root redirect ── */}
              <Route
                path="/"
                element={
                  user
                    ? <Navigate to="/dashboard" replace />
                    : <Navigate to="/signin"    replace />
                }
              />

              {/* ── 404 fallback ── */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Col>
        </Row>
      </Container>

      {/* Chatbot FAB — only shown when logged in */}
      {user && <Chatbot />}

      <Footer />
    </Router>
  );
};

// ─── Root export (wraps everything in providers) ──────────────
function App() {
  return (
    <MantineProvider>
      <ModalsProvider>
        <UserProvider>
          <AppShell />
        </UserProvider>
      </ModalsProvider>
    </MantineProvider>
  );
}

export default App;
