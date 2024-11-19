// Cases.js

import React, { useState, useEffect } from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Cases.css'; // Custom CSS for additional styling
import { Button, Table, Row, Col } from 'react-bootstrap';
import { FaClipboardList } from 'react-icons/fa'; // Keep the clipboard list icon
import { useNavigate } from 'react-router-dom'; // UseNavigate, to navigate back once the case is added
import axios from 'axios';
//import { Button } from '@mantine/core';
//import { useNavigate } from 'react-router-dom'; // UseNavigate, to navigate back once the case is added
//import axios from 'axios';

const Cases = () => {
  const [cases, setCases] = useState([]);
  const navigate = useNavigate();

  const [showTable, setShowTable] = useState(false); // State to control table visibility

  // Assessed button handler to toggle table and file icons
  const handleAssessedClick = () => {
    setShowTable(!showTable); // Toggle between showing and hiding the table
  };

  // Fetch cases from the backend
  useEffect(() => {
	  console.log('Fetching cases from the backend...');
	  axios.get('http://34.35.69.207/api/cases') // Route for fetching all the cases
	  .then(response => {
		  console.log('Cases fetched successfully', response.data);
		  setCases (response.data);
	  })
	  .catch(error => {
		  console.error('Error fetching cases:', error);
	  });
  }, []);

  // Redirect to the CreateCase page
  const goToCreateCase = () => {
	  console.log('Navigating to create a new case...');
	  navigate('/create-case'); // Navgeting back to create case route
  };

  return (
    <div className="container mt-5 cases-container">
      {/* Navigation */}
      <Nav className="mb-4 justify-content-center">
        <Nav.Link as={Link} to="/tasks" className="text-indigo">Tasks</Nav.Link>
        <Nav.Link as={Link} to="/time-management" className="text-indigo">Time Management</Nav.Link>
        <Nav.Link as={Link} to="/clients" className="text-indigo">Clients</Nav.Link>
        <Nav.Link as={Link} to="/documents-management" className="text-indigo">Document Manager</Nav.Link>
      </Nav>

      {/* Page Header */}
      <h1 className="mb-4 text-center">Case Management</h1>

      {/*Create case button*/}
      <div className="d-flex justify-content-between mb-3">
	  <Button variant="primary" onClick={goToCreateCase}>New Case</Button>
      </div>

      {/* Assessed Button */}
      <div className="text-center mb-4">
        <Button variant="primary" onClick={handleAssessedClick}>
          <FaClipboardList className="me-2" /> Assessed
        </Button>
      </div>

      {/* File Icons and Client Details (Visible when table is hidden) */}
      {!showTable && (
        <div className="client-files mt-4">
          <Row>
            {cases.map((caseItem, index) => (
              <Col key={index} md={6} lg={4} className="mb-3 text-center">
                <div className="folder-icon" style={{ padding: '10px', borderRadius: '5px' }}>
                  <span style={{ fontSize: '30px' }}> 📂 </span> {/* Folder emoji */}
                  <div className="folder-details">
                    <strong>Client ID:</strong> {caseItem.id}
                    <br />
                    <strong>Date:</strong> {new Date (caseItem.created_at).toLocaleDateString()}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Case Table (Appears when the "Assessed" button is clicked) */}
      {showTable && (
        <div className="table-responsive mt-4">
          <Table striped bordered hover className="custom-table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Title</th>
	      	<th>Description</th>
                <th>Status</th>
	      	<th>Category ID</th>
	      	<th>Law Firm ID</th>
	      	<th>Date Created</th>
	      	<th>Last Modified</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((caseItem, index) => (
                <tr key={index}>
                  <td>{caseItem.id}</td>
                  <td>{caseItem.title}</td>
		  <td>{caseItem.description}</td>
                  <td>{caseItem.status_id}</td>
		  <td>{caseItem.category_id}</td>
		  <td>{caseItem.lawfirm_id}</td>
		  <td>{new Date(caseItem.created_at).toLocaleDateString()}</td>
		  <td>{new Date(caseItem.updated_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default Cases;
