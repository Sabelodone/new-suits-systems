import React, { useState } from 'react';
import { Nav, Table, Badge, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Tasks.css';

const Tasks = () => {
  const [tasks, setTasks] = useState([
    { id: 1, description: 'Review Documents', status: 'In Progress', dueDate: '2024-08-30' },
    { id: 2, description: 'Prepare Case Notes', status: 'Completed', dueDate: '2024-08-25' },
    { id: 3, description: 'Schedule Client Meeting', status: 'Pending', dueDate: '2024-09-05' },
  ]);

  // Set the default state values to true so that all sections are open by default
  const [showAddTaskForm, setShowAddTaskForm] = useState(true);
  const [showAddAppointmentForm, setShowAddAppointmentForm] = useState(true);
  const [showAgendaSection, setShowAgendaSection] = useState(true);
  const [showCalendarSection, setShowCalendarSection] = useState(true);

  // State for new task and new appointment
  const [newTask, setNewTask] = useState({ description: '', status: '', dueDate: '' });
  const [newAppointment, setNewAppointment] = useState({ title: '', date: '', time: '' });

  // Toggle functions for each form and section
  const toggleAddTaskForm = () => setShowAddTaskForm(!showAddTaskForm);
  const toggleAddAppointmentForm = () => setShowAddAppointmentForm(!showAddAppointmentForm);
  const toggleAgendaSection = () => setShowAgendaSection(!showAgendaSection);
  const toggleCalendarSection = () => setShowCalendarSection(!showCalendarSection);

  // Function to add a new task
  const handleAddTask = () => {
    setTasks([...tasks, { id: tasks.length + 1, ...newTask }]);
    setNewTask({ description: '', status: '', dueDate: '' });
    setShowAddTaskForm(true);
  };

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
        <Button variant="primary" onClick={toggleAddTaskForm}>
          {showAddTaskForm ? 'Close Add Task' : 'Add Task'}
        </Button>
        <Button variant="primary" onClick={toggleAddAppointmentForm}>
          {showAddAppointmentForm ? 'Close Add Appointment' : 'Add Appointment'}
        </Button>
        <Button variant="primary" onClick={toggleAgendaSection}>
          {showAgendaSection ? 'Close Agenda' : 'Agenda'}
        </Button>
        <Button variant="primary" onClick={toggleCalendarSection}>
          {showCalendarSection ? 'Close Calendar' : 'Calendar'}
        </Button>
      </div>

      {/* Add Task Form */}
      {showAddTaskForm && (
        <div className="mb-4 p-3 border rounded shadow-sm">
          <h5>Add New Task</h5>
          <Form>
            <Form.Group controlId="formTaskDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter task description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formTaskStatus" className="mt-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
              >
                <option value="">Select status</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
              </Form.Select>
            </Form.Group>
            <Form.Group controlId="formTaskDueDate" className="mt-3">
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
            </Form.Group>
            <Button variant="primary" className="mt-3" onClick={handleAddTask}>
              Add Task
            </Button>
          </Form>
        </div>
      )}

      {/* Add Appointment Form */}
      {showAddAppointmentForm && (
        <div className="mb-4 p-3 border rounded shadow-sm">
          <h5>Add New Appointment</h5>
          <Form>
            <Form.Group controlId="formAppointmentTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter appointment title"
                value={newAppointment.title}
                onChange={(e) => setNewAppointment({ ...newAppointment, title: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formAppointmentDate" className="mt-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={newAppointment.date}
                onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formAppointmentTime" className="mt-3">
              <Form.Label>Time</Form.Label>
              <Form.Control
                type="time"
                value={newAppointment.time}
                onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
              />
            </Form.Group>
            <Button variant="primary" className="mt-3">
              Add Appointment
            </Button>
          </Form>
        </div>
      )}

      {/* Agenda Section */}
      {showAgendaSection && (
        <div className="mb-4 p-3 border rounded shadow-sm">
          <h5>Agenda</h5>
          <p>Here you can add or view your agenda items for the upcoming days.</p>
          {/* Add more agenda-related content or functionality here */}
        </div>
      )}

      {/* Calendar Section */}
      {showCalendarSection && (
        <div className="mb-4 p-3 border rounded shadow-sm">
          <h5>Calendar</h5>
          <p>This is the Calendar view where you can see scheduled tasks, appointments, and events.</p>
          {/* You could embed a calendar component here if needed */}
        </div>
      )}

      {/* Table for tasks */}
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
