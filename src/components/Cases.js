import React, { useState, useEffect } from 'react';
import './Cases.css'; // Custom CSS for additional styling
import { Table, Row, Col } from 'react-bootstrap';
import { FaClipboardList } from 'react-icons/fa'; // Keep the clipboard list icon
import { Button } from '@mantine/core';
import { useNavigate } from 'react-router-dom'; // UseNavigate, to navigate back once the case is added
import axios from 'axios';
import { modals } from '@mantine/modals';
import { CaseDetail } from './CaseDetail';

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
    axios.get('http://127.0.0.1:5000/api/cases') // Route for fetching all the cases
      .then(response => {
        console.log('Cases fetched successfully', response.data);
        setCases(response.data);
      })
      .catch(error => {
        console.error('Error fetching cases:', error);
      });
  }, []);

  // Redirect to the CreateCase page
  const goToCreateCase = () => {
    console.log('Navigating to create a new case...');
    navigate('/create-case'); // Navigating back to create case route
  };

  // Single-click and double-click logic
  let clickTimeout;
  let lastClickTime = 0; // To store the last click timestamp

  const handleClick = (caseItem) => {
    const currentTime = Date.now();
    const timeDifference = currentTime - lastClickTime;

    if (timeDifference < 300) {
      clearTimeout(clickTimeout); // Clear the single-click timeout if double-click is detected

      return; // Ignore the single-click action
    }

    clearTimeout(clickTimeout); // Clear any previous timeouts

    // Set a timeout to trigger the single-click action
    clickTimeout = setTimeout(() => {
      modals.open({
        children: <CaseDetail caseItem={caseItem} />,
        withCloseButton: false,
        centered: true,
      });
    }, 250); // Delay to differentiate single-click from double-click

    lastClickTime = currentTime; // Update last click time
  };

  const handleDoubleClick = (caseItem) => {
    clearTimeout(clickTimeout); // Clear the single-click timeout
    console.log(`Double click detected on case ${caseItem.id}`);
    navigate(`/document-management`); // Navigate to the document icons page on double-click
  };

  return (
    <div className="container cases-container bg-[#e3dce7] rounded-lg flex flex-col gap-6 items-center w-full !mt-0">
      {/* Page Header */}
      <h3 className='text-2xl text-primary-purple font-bold'>Case Management</h3>

      <div className='flex !items-center gap-8'>
        {/*Create case button*/}
        <div className="d-flex justify-content-between">
          <Button className='flex items-center bg-primary-purple hover:bg-primary-purple cursor-pointer h-[46px] px-3' onClick={goToCreateCase}>New Case</Button>
        </div>

        {/* Assessed Button */}
        <div className="text-center">
          <Button variant="primary" className='flex items-center bg-primary-purple hover:bg-primary-purple cursor-pointer h-[46px] px-3' onClick={handleAssessedClick}>
            <FaClipboardList className="me-2" size={16} />
            <span className='text-xs'> Assessed</span>
          </Button>
        </div>
      </div>

      {/* File Icons and Client Details (Visible when table is hidden) */}
      {!showTable && (
        <div className="client-files w-full">
          <Row>
            {cases.map((caseItem, index) => (
              <Col key={index} md={6} lg={4} className="mb-3 text-center">
                <div className="folder-icon" style={{ padding: '10px', borderRadius: '5px', cursor: 'pointer' }}
                  onClick={() => handleClick(caseItem)}
                  onDoubleClick={() => handleDoubleClick(caseItem)}>
                  <span> 📂 </span> {/* Folder emoji */}
                  <div className="folder-details">
                    <strong>Client ID:</strong> {caseItem.id}
                    <br />
                    <strong>Date:</strong> {new Date(caseItem.created_at).toLocaleDateString()}
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
                <th>Created At</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((caseItem, index) => (
                <tr key={index} className='cursor-pointer'
                  onClick={() => handleClick(caseItem)}
                  onDoubleClick={() => handleDoubleClick(caseItem)}>
                  <td>{caseItem.id}</td>
                  <td>{caseItem.title}</td>
                  <td>{caseItem.description}</td>
                  <td>{caseItem.status_id}</td>
                  <td>{caseItem.category_id}</td>
                  <td>{caseItem.lawfirm_id}</td>
                  <td>{new Date(caseItem.created_at).toLocaleDateString()}</td>
                  <td>{new Date(caseItem.last_upadted).toLocaleDateString()}</td>
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
