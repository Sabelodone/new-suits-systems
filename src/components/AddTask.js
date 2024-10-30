import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const AddTask = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const response = await axios.post('http://34.35.32.197/api/tasks', { title, description }); // Adjust URL if necessary
      if (response.status === 201) {
        setSuccess(true);
        // Redirect to the tasks page after a successful submission
        navigate('/tasks');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while creating the task.');
    }
  };

  return (
    <div className="container mt-5">
      <h1>Add New Task</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Task created successfully!</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formTitle">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="formDescription">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Enter task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit">Add Task</Button>
      </Form>
    </div>
  );
};

export default AddTask;

