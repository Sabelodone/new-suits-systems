import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Tasks.css';
import { Table, Badge, Button } from 'react-bootstrap';

const Tasks = () => {
  // Sample task data
  const tasks = [
    { id: 1, description: 'Review Documents', status: 'In Progress', dueDate: '2024-08-30' },
    { id: 2, description: 'Prepare Case Notes', status: 'Completed', dueDate: '2024-08-25' },
    { id: 3, description: 'Schedule Client Meeting', status: 'Pending', dueDate: '2024-09-05' },
    // Add more tasks here as needed
  ];

  // Function to display status badge
  const renderStatusBadge = (status) => {
    let variant;
    switch (status) {
      case 'Completed':
        variant = 'success';
        break;
      case 'In Progress':
        variant = 'info';
        break;
      case 'Pending':
        variant = 'warning';
        break;
      default:
        variant = 'secondary';
    }
    return <Badge bg={variant}>{status}</Badge>;
  };

  return (
    <div className="container mt-5 tasks-container">
      <Nav className="mb-4">
        <Nav.Link as={Link} to="/cases" className="text-indigo">Cases</Nav.Link>
        <Nav.Link as={Link} to="/time-management" className="text-indigo">Time Management</Nav.Link>
        <Nav.Link as={Link} to="/clients" className="text-indigo">Clients</Nav.Link>
        <Nav.Link as={Link} to="/documents" className="text-indigo">Documents</Nav.Link>
      </Nav>
      <h1 className="mb-4 text-center">Tasks</h1>

      {/* Buttons Section */}
      <div className="mb-4 d-flex justify-content-between">
        <Button variant="primary" as={Link} to="/add-task">Add Task</Button>
        <Button variant="primary" as={Link} to="/add-appointment">Add Appointment</Button>
        <Button variant="primary" as={Link} to="/calendar">Calendar</Button>
        <Button variant="primary" as={Link} to="/agenda">Agenda</Button>
      </div>

      <div className="table-responsive">
        <Table striped bordered hover className="shadow-sm custom-table">
          <thead className="bg-primary text-white">
            <tr>
              <th>Task ID</th>
              <th>Description</th>
              <th>Status</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id}>
                <td>{task.id}</td>
                <td>{task.description}</td>
                <td>{renderStatusBadge(task.status)}</td>
                <td>{task.dueDate}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default Tasks;
