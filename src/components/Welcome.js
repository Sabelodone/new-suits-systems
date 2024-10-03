// Welcome.js
import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Helmet } from 'react-helmet'; // For meta title
import './Welcome.css'; // Import custom styles for Welcome component

function Welcome() {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleExploreDashboard = () => {
    navigate('/dashboard'); // Programmatically navigate to the dashboard
  };

  return (
    <>
      {/* Meta Title for SEO */}
      <Helmet>
        <title>Welcome | Management System</title>
      </Helmet>

      {/* Main Content Area */}
      <Container fluid className="welcome-container d-flex align-items-center justify-content-center">
        <main className="welcome-content text-center">
          <h1 className="welcome-title">Welcome to the Management System</h1>
          <p className="welcome-text">
            Manage your cases, tasks, clients, and documents with ease. Select an option from the sidebar to begin.
          </p>
          <Button 
            variant="primary" 
            className="explore-btn" 
            aria-label="Explore Dashboard"
            onClick={handleExploreDashboard}
          >
            Explore Dashboard
          </Button>
        </main>
      </Container>
    </>
  );
}

export default Welcome;