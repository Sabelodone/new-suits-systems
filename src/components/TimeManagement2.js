import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './TimeManagement.css';
import { Table, Badge, Form, InputGroup, Accordion, Card, Button } from 'react-bootstrap';
import { FaCalendarAlt, FaUser, FaChevronDown, FaChevronUp } from 'react-icons/fa'; // Import icons

const TimeManagement = () => {
  // Sample time entries with participants
  const timeEntries = [
    { id: 1, task: 'Case Review', hours: 2, date: '2024-08-22', participant: 'John Doe' },
    { id: 2, task: 'Client Meeting', hours: 1.5, date: '2024-08-25', participant: 'Jane Smith' },
    { id: 3, task: 'Document Preparation', hours: 3, date: '2024-08-30', participant: 'John Doe' },
    // Add more entries as needed
  ];

  // State for filters
  const [filterDate, setFilterDate] = useState('');
  const [filterParticipant, setFilterParticipant] = useState('');
  const [isOpen, setIsOpen] = useState(false); // For controlling accordion open/close

  // Toggle the accordion
  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

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

  // Filter time entries based on date and participant
  const filteredEntries = timeEntries.filter(entry => {
    return (
      (filterDate === '' || entry.date === filterDate) &&
      (filterParticipant === '' || entry.participant.toLowerCase().includes(filterParticipant.toLowerCase()))
    );
  });

  return (
    <div className="container mt-5 time-management-container">
      <Nav className="mb-4">
        <Nav.Link as={Link} to="/cases" className="text-indigo">Cases</Nav.Link>
        <Nav.Link as={Link} to="/tasks" className="text-indigo">Tasks</Nav.Link>
        <Nav.Link as={Link} to="/clients" className="text-indigo">Clients</Nav.Link>
        <Nav.Link as={Link} to="/documents" className="text-indigo">Documents</Nav.Link>
      </Nav>

      <h1 className="mb-4 text-center">Time Management</h1>

      {/* Accordion Filter Section */}
      <Accordion>
        <Card>
          <Card.Header>
            <Button
              onClick={toggleAccordion}
              aria-controls="filter-accordion"
              aria-expanded={isOpen}
              variant="light"
              className="d-flex align-items-center"
            >
              Filters {isOpen ? <FaChevronUp className="ms-auto" /> : <FaChevronDown className="ms-auto" />}
            </Button>
          </Card.Header>
          <Accordion.Collapse in={isOpen}>
            <Card.Body id="filter-accordion">
              <Form>
                <div className="row">
                  <div className="col-md-6">
                    <Form.Group controlId="filterDate">
                      <Form.Label>Filter by Date</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FaCalendarAlt /> {/* Icon inside the InputGroup */}
                        </InputGroup.Text>
                        <Form.Control
                          type="date"
                          value={filterDate}
                          onChange={(e) => setFilterDate(e.target.value)}
                        />
                      </InputGroup>
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group controlId="filterParticipant">
                      <Form.Label>Filter by Participant</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FaUser /> {/* Icon inside the InputGroup */}
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Enter participant name"
                          value={filterParticipant}
                          onChange={(e) => setFilterParticipant(e.target.value)}
                        />
                      </InputGroup>
                    </Form.Group>
                  </div>
                </div>
              </Form>
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>

      <div className="table-responsive mt-4">
        <Table striped bordered hover className="shadow-sm custom-table">
          <thead className="bg-primary text-white">
            <tr>
              <th>Entry ID</th>
              <th>Task</th>
              <th>Hours Worked</th>
              <th>Date</th>
              <th>Participant</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length > 0 ? (
              filteredEntries.map(entry => (
                <tr key={entry.id}>
                  <td>{entry.id}</td>
                  <td>{entry.task}</td>
                  <td>{renderHoursBadge(entry.hours)}</td>
                  <td>{entry.date}</td>
                  <td>{entry.participant}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">No entries found</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default TimeManagement;

