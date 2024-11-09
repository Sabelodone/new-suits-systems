// Workflows.js
import React, { useState } from 'react';
import { Button, Form, ListGroup } from 'react-bootstrap';
import WorkflowSteps from './WorkflowSteps';

const Workflows = ({ workflows, setWorkflows }) => {
  const [newWorkflow, setNewWorkflow] = useState('');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(null); // Toggle selection
  const [editingWorkflowId, setEditingWorkflowId] = useState(null);
  const [editWorkflowName, setEditWorkflowName] = useState('');

  const handleCreateWorkflow = async (event) => {
    event.preventDefault();
    const response = await fetch('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newWorkflow }),
    });
    if (response.ok) {
      const newWorkflowData = await response.json();
      setWorkflows([...workflows, newWorkflowData]);
      setNewWorkflow('');
    }
  };

  const handleDeleteWorkflow = async (workflowId) => {
    const response = await fetch(`/api/workflows/${workflowId}`, { method: 'DELETE' });
    if (response.ok) {
      setWorkflows(workflows.filter(workflow => workflow.id !== workflowId));
    }
  };

  const handleEditWorkflow = async (event) => {
    event.preventDefault();
    const response = await fetch(`/api/workflows/${editingWorkflowId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editWorkflowName }),
    });
    if (response.ok) {
      const updatedWorkflows = workflows.map(workflow =>
        workflow.id === editingWorkflowId ? { ...workflow, name: editWorkflowName } : workflow
      );
      setWorkflows(updatedWorkflows);
      setEditingWorkflowId(null);
      setEditWorkflowName('');
    }
  };

  return (
    <>
      <Form onSubmit={handleCreateWorkflow}>
        <Form.Group controlId="formWorkflowName">
          <Form.Label>Workflow Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter workflow name"
            value={newWorkflow}
            onChange={(e) => setNewWorkflow(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" type="submit">Add Workflow</Button>
      </Form>

      <ListGroup className="mt-4">
        {workflows.map((workflow) => (
          <WorkflowSteps
            key={workflow.id}
            workflow={workflow}
            selectedWorkflowId={selectedWorkflowId}
            setSelectedWorkflowId={setSelectedWorkflowId}
            handleDeleteWorkflow={handleDeleteWorkflow}
            setEditingWorkflowId={setEditingWorkflowId}
            setEditWorkflowName={setEditWorkflowName}
            editingWorkflowId={editingWorkflowId}
            handleEditWorkflow={handleEditWorkflow}
          />
        ))}
      </ListGroup>
    </>
  );
};

export default Workflows;

