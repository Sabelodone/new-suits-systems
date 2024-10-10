import React, { useState } from 'react';
import { Nav, Button, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Clients.css'; // Custom CSS for additional styling
import { Table } from 'react-bootstrap';

const Clients = () => {
  // Initial client data
  const [clients, setClients] = useState([
    { 
      id: '1', // Use string for ID
      name: 'John Doe', 
      contact: 'johndoe@example.com', 
      phone: '555-1234', 
      address: '123 Main St', 
      cases: 5, 
      registrationDate: '2023-05-12', 
      status: 'Active' 
    },
    { 
      id: '2', // Use string for ID
      name: 'Jane Smith', 
      contact: 'janesmith@example.com', 
      phone: '555-5678', 
      address: '456 Elm St', 
      cases: 3, 
      registrationDate: '2023-06-22', 
      status: 'Inactive' 
    },
    { 
      id: '3', // Use string for ID
      name: 'David Johnson', 
      contact: 'davidjohnson@example.com', 
      phone: '555-9012', 
      address: '789 Oak St', 
      cases: 2, 
      registrationDate: '2023-07-10', 
      status: 'Active' 
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [message, setMessage] = useState('');

  // Handle input change for table editing
  const handleInputChange = (index, key, value) => {
    const updatedClients = [...clients];
    updatedClients[index][key] = value;

    console.log('Updated clients:', updatedClients); // Debugging state change
    setClients(updatedClients);
  };

  // Open modal for contacting client
  const handleContactClick = (client) => {
    setCurrentClient(client);
    setShowModal(true);
  };

  // Handle sending message
  const handleSendMessage = () => {
    console.log(`Message to ${currentClient.name}: ${message}`);
    setShowModal(false);
    setMessage('');
  };

  return (
    <div className="container mt-5 clients-container">
      <Nav className="mb-4">
        <Nav.Link as={Link} to="/cases" className="text-indigo">Cases</Nav.Link>
        <Nav.Link as={Link} to="/tasks" className="text-indigo">Tasks</Nav.Link>
        <Nav.Link as={Link} to="/time-management" className="text-indigo">Time Management</Nav.Link>
        <Nav.Link as={Link} to="/documents-management" className="text-indigo">Document Manager</Nav.Link>
      </Nav>

      <h1 className="mb-4 text-center">Client Management</h1>
      <div className="table-responsive">
        <Table striped bordered hover className="custom-table">
          <thead>
            <tr>
              <th>Client ID</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Cases</th>
              <th>Registration Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    value={client.id}
                    onChange={(e) => handleInputChange(index, 'id', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={client.name}
                    onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="email"
                    value={client.contact}
                    onChange={(e) => handleInputChange(index, 'contact', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={client.phone}
                    onChange={(e) => handleInputChange(index, 'phone', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={client.address}
                    onChange={(e) => handleInputChange(index, 'address', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={client.cases}
                    onChange={(e) => handleInputChange(index, 'cases', Number(e.target.value))} // Convert to number
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={client.registrationDate}
                    onChange={(e) => handleInputChange(index, 'registrationDate', e.target.value)}
                  />
                </td>
                <td>
                  <select
                    value={client.status}
                    onChange={(e) => handleInputChange(index, 'status', e.target.value)}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </td>
                <td>
                  <Button variant="info" size="sm" className="me-2" onClick={() => handleContactClick(client)}>Contact</Button>
                  <Button variant="warning" size="sm" className="me-2">Edit</Button>
                  <Button variant="danger" size="sm">Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Contact Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Contact {currentClient?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <textarea
            rows="4"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="form-control"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSendMessage}>
            Send Message
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Clients;
