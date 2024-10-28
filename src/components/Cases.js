import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Cases.css'; // Custom CSS for additional styling
import { Table, Row, Col } from 'react-bootstrap';
import { FaClipboardList } from 'react-icons/fa'; // Keep the clipboard list icon
import { Button } from '@mantine/core';

const Cases = () => {
  const [cases] = useState([ // Removed setCases to avoid unused variable warning
    { id: 123, client: 'John Doe', status: 'Open', date: '2024-08-22' },
    { id: 124, client: 'Jane Smith', status: 'Closed', date: '2024-09-10' },
  ]);

  const [showTable, setShowTable] = useState(false); // State to control table visibility

  // Assessed button handler to toggle table and file icons
  const handleAssessedClick = () => {
    setShowTable(!showTable); // Toggle between showing and hiding the table
  };

  return (
    <div className="container cases-container bg-[#e3dce7] rounded-lg flex flex-col gap-6 items-center w-full">

      {/* Page Header */}
      <h3 className='text-2xl text-primary-purple font-bold '>Case Management</h3>


      {/* Assessed Button */}
      <div className="text-center mb-4  ">
        <Button variant="primary" className='flex items-center bg-primary-purple hover:bg-primary-purple cursor-pointer' onClick={handleAssessedClick}>
          <FaClipboardList className="me-2" size={16} />
          <span className='text-xs '> Assessed</span>
        </Button>
      </div>

      {/* File Icons and Client Details (Visible when table is hidden) */}
      {!showTable && (
        <div className="client-files mt-4 w-full">
          <Row>
            {cases.map((caseItem) => (
              <Col key={caseItem.id} md={6} lg={4} className="mb-3 text-center">
                <div className="folder-icon" style={{ padding: '10px', borderRadius: '5px' }}>
                  <span> 📂 </span> {/* Folder emoji */}
                  <div className="folder-details">
                    <strong>Client ID:</strong> {caseItem.id}
                    <br />
                    <strong>Date:</strong> {caseItem.date}
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
                <th>Client</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((caseItem) => (
                <tr key={caseItem.id}>
                  <td>{caseItem.id}</td>
                  <td>{caseItem.client}</td>
                  <td>{caseItem.status}</td>
                  <td>{caseItem.date}</td>
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
