import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Documents.css';
import { Table } from 'react-bootstrap';

const Documents = () => {
  return (
    <div className="container mt-5">
      <Nav className="mb-4">
        <Nav.Link as={Link} to="/cases" className="text-indigo">Cases</Nav.Link>
        <Nav.Link as={Link} to="/tasks" className="text-indigo">Tasks</Nav.Link>
        <Nav.Link as={Link} to="/time-management" className="text-indigo">Time Management</Nav.Link>
        <Nav.Link as={Link} to="/clients" className="text-indigo">Clients</Nav.Link>
       
      </Nav>
      <h1 className="mb-4 text-center">Documents</h1>
      <Table striped bordered hover className="shadow-sm">
        <thead className="bg-primary text-white">
          <tr>
            <th>Document ID</th>
            <th>Title</th>
            <th>Type</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Contract</td>
            <td>Legal</td>
            <td>2024-08-20</td>
          </tr>
          {/* Add more rows as needed */}
        </tbody>
      </Table>
    </div>
  );
};

export default Documents;
