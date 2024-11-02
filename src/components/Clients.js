import React, { useState, useEffect } from 'react';
import { Nav, Button, Modal, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Clients.css'; // Custom CSS for additional styling
import axios from 'axios'; // Import axios for making HTTP requests

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [message, setMessage] = useState('');
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    // Add other fields as necessary
  });

  // Fetch clients from the API
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get('http://34.35.32.197/api/customers'); // Adjust URL as needed
        setClients(response.data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };
    fetchClients();
  }, []);

  // Add new client
  const handleAddClient = async () => {
    try {
      const response = await axios.post('http://34.35.32.197/api/customers', newClient);
      setClients([...clients, response.data]); // Update state with the new client
      setNewClient({ name: '', email: '' }); // Reset the new client state
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  // Handle input change for table editing
  const handleInputChange = (index, key, value) => {
    const updatedClients = [...clients];
    updatedClients[index][key] = value;
    setClients(updatedClients);
  };

  // Handle contact button click
  const handleContactClick = (client) => {
    setCurrentClient(client);
    setShowModal(true);
  };

  // Handle sending message
  const handleSendMessage = async () => {
    console.log(`Message to ${currentClient.first_name} ${currentClient.last_name}: ${message}`);
    // Add logic for sending message (e.g., to a messaging API)
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
              <tr key={client.id}>
                <td>{client.id}</td>
                <td>{client.first_name} {client.last_name}</td> {/* Adjusted */}
                <td>{client.email}</td> {/* Assuming email is the contact */}
                <td>{client.phones ? client.phones.join(', ') : 'N/A'}</td> {/* Adjusted for phone numbers */}
                <td>{client.address || 'N/A'}</td> {/* Assuming address is part of your model */}
                <td>{client.cases || 'N/A'}</td> {/* Adjusted */}
                <td>{client.registration_date || 'N/A'}</td> {/* Adjusted */}
                <td>{client.status || 'N/A'}</td> {/* Adjusted */}
                <td>
                  <Button variant="info" size="sm" onClick={() => handleContactClick(client)}>Contact</Button>
                  {/* Add edit and delete buttons with their respective handlers */}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Contact Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Contact {currentClient?.first_name} {currentClient?.last_name}</Modal.Title>
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

