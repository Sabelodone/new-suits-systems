/**
 * src/App.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Root application shell.
 *
 * WHAT CHANGED:
 *   ✅ Removed the extra <Col md={2}> wrapper around <Sidebar>.
 *      Sidebar previously wrapped itself in a <Col>, AND App also wrapped it
 *      in a <Col> → double-nesting broke the Bootstrap grid layout.
 *      Now App owns the single <Col md={2}> and Sidebar renders a plain <div>.
 *
 *   ✅ Footer moved inside <Router> so it has access to router context
 *      if it ever needs navigation links.
 *
 *   ✅ All other routing and protection logic is unchanged.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider }  from '@mantine/modals';
import '@mantine/core/styles.css';

// Context provider — wraps everything so any component can call useUser()
import { UserProvider, useUser } from './components/UserContext';

// Layout components
import Header  from './components/Header';
import Footer  from './components/Footer';
import Sidebar from './components/Sidebar';
import Chatbot from './components/Chatbot';

// Page components
import Dashboard          from './components/Dashboard';
import Cases              from './components/Cases';
import CreateCase         from './components/CreateCase';
import Tasks              from './components/Tasks';
import AddTask            from './components/AddTask';
import TimeManagement     from './components/TimeManagement';
import Clients            from './components/Clients';
import DocumentManagement from './components/DocumentManagement';
import LegalTemplates     from './components/LegalTemplates';
import Settings           from './components/Settings';
import Welcome            from './components/Welcome';
import SignIn             from './components/SignIn';
import SignUp             from './components/SignUp';
import ForgotPassword     from './components/ForgotPassword';
import ResetPassword      from './components/ResetPassword';
import TermsAndConditions from './components/TermsAndConditions';
import PrivateRoute       from './components/PrivateRoute';

import './App.css';

// ── Inner shell — must be inside UserProvider to use useUser() ────────────────
const AppShell = () => {
  const { user, loading } = useUser();

  // While checking localStorage for a stored session, show a full-screen spinner
  if (loading) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: '100vh', background: '#F8FAFC' }}
      >
        <Spinner animation="border" style={{ color: '#2563EB' }} />
      </div>
    );
  }

  return (
    <Router>
      {/* ── Global top header (brand + search + user) ── */}
      <Header />

      <Container fluid className="app-container p-0">
        <Row className="g-0" style={{ minHeight: 'calc(100vh - 64px)' }}>

          {/* ── Left sidebar (only when authenticated) ── */}
          {user && (
            // ✅ FIX: App owns the Col — Sidebar renders a plain div inside it.
            //    Previously both App and Sidebar added a Col, breaking the grid.
            <Col xs={0} md={2} className="p-0 d-none d-md-block">
              <Sidebar />
            </Col>
          )}

          {/* ── Main content area ── */}
          <Col
            xs={12}
            md={user ? 10 : 12}
            className="content-area p-0"
          >
            <Routes>
              {/* ── Public routes ── */}
              <Route path="/signin"               element={<SignIn />} />
              <Route path="/signup"               element={<SignUp />} />
              <Route path="/forgot-password"      element={<ForgotPassword />} />
              <Route path="/reset-password"       element={<ResetPassword />} />
              <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

              {/* ── Protected routes (require login) ── */}
              <Route path="/welcome"             element={<PrivateRoute><Welcome /></PrivateRoute>} />
              <Route path="/dashboard"           element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/cases"               element={<PrivateRoute><Cases /></PrivateRoute>} />
              <Route path="/create-case"         element={<PrivateRoute><CreateCase /></PrivateRoute>} />
              <Route path="/tasks"               element={<PrivateRoute><Tasks /></PrivateRoute>} />
              <Route path="/add-task"            element={<PrivateRoute><AddTask /></PrivateRoute>} />
              <Route path="/time-management"     element={<PrivateRoute><TimeManagement /></PrivateRoute>} />
              <Route path="/clients"             element={<PrivateRoute><Clients /></PrivateRoute>} />
              <Route path="/document-management" element={<PrivateRoute><DocumentManagement /></PrivateRoute>} />
              <Route path="/legal-templates"     element={<PrivateRoute><LegalTemplates /></PrivateRoute>} />
              <Route path="/settings"            element={<PrivateRoute><Settings /></PrivateRoute>} />

              {/* ── Root: redirect based on auth state ── */}
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

      {/* Floating chatbot button — only when logged in */}
      {user && <Chatbot />}

      <Footer />
    </Router>
  );
};

// ── Root export — wraps everything in all required providers ──────────────────
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