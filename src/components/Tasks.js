import React, { useEffect, useState } from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Tasks.css';
import { Table, Badge, Button } from 'react-bootstrap';
import axios from 'axios';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('http://34.35.32.197/api/tasks');
	console.log('Fetched Tasks:', response.data); // For Debugging
        setTasks(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

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

  if (loading) return <p>Loading tasks...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mt-5 tasks-container">
      <Nav className="mb-4">
        <Nav.Link as={Link} to="/cases" className="text-indigo">Cases</Nav.Link>
        <Nav.Link as={Link} to="/time-management" className="text-indigo">Time Management</Nav.Link>
        <Nav.Link as={Link} to="/clients" className="text-indigo">Clients</Nav.Link>
        <Nav.Link as={Link} to="/documents" className="text-indigo">Documents</Nav.Link>
      </Nav>
      <h1 className="mb-4 text-center">Tasks</h1>

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
              <th>Task</th>
              <th>Description</th>
              <th>Status</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id}>
                <td>{task.title || 'No Title'}</td>
                <td>{task.description || 'No Description'}</td>
                <td>{renderStatusBadge(task.status || 'N/A')}</td>
                <td>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default Tasks;

