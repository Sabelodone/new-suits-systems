// WorkflowSteps.js
import React, { useState } from 'react';
import { Button, ListGroup, Form } from 'react-bootstrap';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa'; // Icons for toggle indication

const WorkflowSteps = ({ workflow, selectedWorkflowId, setSelectedWorkflowId, handleDeleteWorkflow, setEditingWorkflowId, setEditWorkflowName, editingWorkflowId, handleEditWorkflow }) => {
  const [newStep, setNewStep] = useState({ name: '', step_order: '', requires_payment: false });
  const [editingStepId, setEditingStepId] = useState(null);
  const [editStep, setEditStep] = useState({ name: '', step_order: '', requires_payment: false });

  const toggleWorkflowSteps = (workflowId) => {
    setSelectedWorkflowId(selectedWorkflowId === workflowId ? null : workflowId);
  };

  const handleCreateStep = async (event) => {
    event.preventDefault();
    const response = await fetch(`/api/workflows/${workflow.id}/steps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStep),
    });
    if (response.ok) {
      const newStepData = await response.json();
      // Handle adding the new step to the workflow
      setNewStep({ name: '', step_order: '', requires_payment: false });
    }
  };

  const handleDeleteStep = async (stepId) => {
    const response = await fetch(`/api/workflows/${workflow.id}/steps/${stepId}`, { method: 'DELETE' });
    if (response.ok) {
      // Handle removing the step from the workflow
    }
  };

  const handleEditStep = async (event) => {
    event.preventDefault();
    const response = await fetch(`/api/workflows/${workflow.id}/steps/${editingStepId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editStep),
    });
    if (response.ok) {
      // Handle updating the step in the workflow
    }
  };

  return (
    <React.Fragment>
      <ListGroup.Item>
        <div className="d-flex justify-content-between align-items-center">
          <div
            className="d-flex align-items-center"
            onClick={() => toggleWorkflowSteps(workflow.id)}
            style={{ cursor: 'pointer', flexGrow: 1 }}
          >
            {selectedWorkflowId === workflow.id ? (
              <FaChevronDown className="mr-2" />
            ) : (
              <FaChevronRight className="mr-2" />
            )}
            <span>{workflow.name}</span>
          </div>
          <div className="d-flex flex-column align-items-end">
            <Button variant="danger" size="sm" onClick={() => handleDeleteWorkflow(workflow.id)} className="mt-1">
              Delete
            </Button>
            <Button variant="warning" size="sm" className="mt-1" onClick={() => {
              setEditingWorkflowId(workflow.id);
              setEditWorkflowName(workflow.name);
            }}>
              Edit
            </Button>
          </div>
        </div>
      </ListGroup.Item>

      {selectedWorkflowId === workflow.id && (
        <ListGroup className="ml-4">
          {workflow.steps.map((step) => (
            <ListGroup.Item key={step.id}>
              <div className="d-flex justify-content-between align-items-center">
                <span>{step.step_order}. {step.name} {step.requires_payment ? "(Requires Payment)" : ""}</span>
                <div className="d-flex flex-column align-items-end">
                  <Button variant="danger" size="sm" onClick={() => handleDeleteStep(step.id)} className="mt-1">
                    Delete
                  </Button>
                  <Button variant="warning" size="sm" className="mt-1" onClick={() => {
                    setEditingStepId(step.id);
                    setEditStep({
                      name: step.name,
                      step_order: step.step_order,
                      requires_payment: step.requires_payment,
                    });
                  }}>
                    Edit
                  </Button>
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {/* Form to create new step */}
      {selectedWorkflowId === workflow.id && (
        <Form onSubmit={handleCreateStep} className="mt-3">
          <Form.Group>
            <Form.Label>New Step</Form.Label>
            <Form.Control
              type="text"
              placeholder="Step Name"
              value={newStep.name}
              onChange={(e) => setNewStep({ ...newStep, name: e.target.value })}
            />
            <Form.Control
              type="number"
              placeholder="Step Order"
              value={newStep.step_order}
              onChange={(e) => setNewStep({ ...newStep, step_order: e.target.value })}
              className="mt-2"
            />
            <Form.Check
              type="checkbox"
              label="Requires Payment"
              checked={newStep.requires_payment}
              onChange={(e) => setNewStep({ ...newStep, requires_payment: e.target.checked })}
              className="mt-2"
            />
          </Form.Group>
          <Button variant="primary" type="submit">Add Step</Button>
        </Form>
      )}

      {/* Form to edit step */}
      {editingStepId && (
        <Form onSubmit={handleEditStep} className="mt-3">
          <Form.Group>
            <Form.Label>Edit Step</Form.Label>
            <Form.Control
              type="text"
              placeholder="Step Name"
              value={editStep.name}
              onChange={(e) => setEditStep({ ...editStep, name: e.target.value })}
            />
            <Form.Control
              type="number"
              placeholder="Step Order"
              value={editStep.step_order}
              onChange={(e) => setEditStep({ ...editStep, step_order: e.target.value })}
              className="mt-2"
            />
            <Form.Check
              type="checkbox"
              label="Requires Payment"
              checked={editStep.requires_payment}
              onChange={(e) => setEditStep({ ...editStep, requires_payment: e.target.checked })}
              className="mt-2"
            />
          </Form.Group>
          <Button variant="primary" type="submit">Update Step</Button>
        </Form>
      )}
    </React.Fragment>
  );
};

export default WorkflowSteps;

