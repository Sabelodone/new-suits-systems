import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import Header from './components/Header';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Cases from './components/Cases';
import Tasks from './components/Tasks';
import TimeManagement from './components/TimeManagement';
import Clients from './components/Clients';
import DocumentManagement from './components/DocumentManagement';
import LegalTemplates from './components/LegalTemplates';
import Welcome from './components/Welcome';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import PrivateRoute from './components/PrivateRoute';
import { UserProvider, useUser } from './components/UserContext';
import TermsAndConditions from './components/TermsAndConditions';
import InvoiceAndBilling from './components/InvoiceAndBilling'; // Importing the InvoiceAndBilling component
import './App.css'; // Assuming you have a global stylesheet

function App() {
  return (
    <UserProvider>
      <Router>
        <Header />
        <MainContent />
        <Chatbot /> {/* Chatbot Component */}
        <Footer />
      </Router>
    </UserProvider>
  );
}

const MainContent = () => {
  const { user, loading } = useUser();
  
  // Define or fetch your client data here
  const clientData = [
    { id: 1, name: 'John Doe', email: 'johndoe@example.com' },
    { id: 2, name: 'Jane Smith', email: 'janesmith@example.com' },
    { id: 3, name: 'David Johnson', email: 'davidjohnson@example.com' },
  ]; // Example client data

  if (loading) {
    return (
      <div className="loading-spinner">
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <Container fluid className="app-container">
      <Row>
        {user && <Sidebar />} {/* Sidebar only visible if user is authenticated */}

        <Col md={user ? 10 : 12} className="content-area p-4">
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Protected Routes */}
            <Route path="/welcome" element={<PrivateRoute><Welcome /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/cases" element={<PrivateRoute><Cases /></PrivateRoute>} />
            <Route path="/tasks" element={<PrivateRoute><Tasks /></PrivateRoute>} />
            <Route path="/time-management" element={<PrivateRoute><TimeManagement /></PrivateRoute>} />
            <Route path="/clients" element={<PrivateRoute><Clients /></PrivateRoute>} />
            <Route path="/document-management" element={<PrivateRoute><DocumentManagement /></PrivateRoute>} />
            <Route path="/legal-templates" element={<PrivateRoute><LegalTemplates /></PrivateRoute>} />
            <Route path="/invoice-and-billing" element={<PrivateRoute><InvoiceAndBilling clients={clientData} /></PrivateRoute>} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

            {/* Redirect root path */}
            <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/signin" replace />} />
          </Routes>
        </Col>
      </Row>
    </Container>
  );
};

export default App;