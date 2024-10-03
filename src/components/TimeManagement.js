import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './TimeManagement.css';
import { Table, Badge } from 'react-bootstrap';

const TimeManagement = () => {
  // Sample time entries
  const timeEntries = [
    { id: 1, task: 'Case Review', hours: 2, date: '2024-08-22' },
    { id: 2, task: 'Client Meeting', hours: 1.5, date: '2024-08-25' },
    { id: 3, task: 'Document Preparation', hours: 3, date: '2024-08-30' },
    // Add more entries as needed
  ];

  // Function to render hours worked badge
  const renderHoursBadge = (hours) => {
    let variant = 'secondary';
    if (hours >= 3) {
      variant = 'success'; // High effort
    } else if (hours >= 1.5) {
      variant = 'info'; // Moderate effort
    } else if (hours < 1.5) {
      variant = 'warning'; // Low effort
    }
    return <Badge bg={variant}>{hours} hrs</Badge>;
  };

  return (
    <div className="container mt-5 time-management-container">
      <Nav className="mb-4">
        <Nav.Link as={Link} to="/cases" className="text-indigo">Cases</Nav.Link>
        <Nav.Link as={Link} to="/tasks" className="text-indigo">Tasks</Nav.Link>
        <Nav.Link as={Link} to="/clients" className="text-indigo">Clients</Nav.Link>
        <Nav.Link as={Link} to="/documents" className="text-indigo">Documents</Nav.Link>
      </Nav>
      <h1 className="mb-4 text-center">Time Management</h1>
      <div className="table-responsive">
        <Table striped bordered hover className="shadow-sm custom-table">
          <thead className="bg-primary text-white">
            <tr>
              <th>Entry ID</th>
              <th>Task</th>
              <th>Hours Worked</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {timeEntries.map(entry => (
              <tr key={entry.id}>
                <td>{entry.id}</td>
                <td>{entry.task}</td>
                <td>{renderHoursBadge(entry.hours)}</td>
                <td>{entry.date}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default TimeManagement;
