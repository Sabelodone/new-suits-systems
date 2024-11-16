import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Nav, Form, ListGroup } from 'react-bootstrap';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa'; // Icons for toggle indication

const Settings = () => {
  const [selectedTab, setSelectedTab] = useState('manage-workflows');
  const [workflows, setWorkflows] = useState([]);
  const [newWorkflow, setNewWorkflow] = useState('');
  const [newStep, setNewStep] = useState({ name: '', step_order: '', requires_payment: false });
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(null); // Toggle selection
  const [editingWorkflowId, setEditingWorkflowId] = useState(null);
  const [editingStepId, setEditingStepId] = useState(null);
  const [editWorkflowName, setEditWorkflowName] = useState('');
  const [editStep, setEditStep] = useState({ name: '', step_order: '', requires_payment: false });

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    const response = await fetch('/api/workflows');
    const data = await response.json();
    setWorkflows(data);
  };

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

  const handleCreateStep = async (event) => {
    event.preventDefault();
    const response = await fetch(`/api/workflows/${selectedWorkflowId}/steps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStep),
    });
    if (response.ok) {
      const newStepData = await response.json();
      const updatedWorkflows = workflows.map(workflow =>
        workflow.id === selectedWorkflowId
          ? { ...workflow, steps: [...workflow.steps, newStepData] }
          : workflow
      );
      setWorkflows(updatedWorkflows);
      setNewStep({ name: '', step_order: '', requires_payment: false });
    }
  };

  const toggleWorkflowSteps = (workflowId) => {
    setSelectedWorkflowId(selectedWorkflowId === workflowId ? null : workflowId);
  };

  const handleDeleteWorkflow = async (workflowId) => {
    const response = await fetch(`/api/workflows/${workflowId}`, { method: 'DELETE' });
    if (response.ok) {
      setWorkflows(workflows.filter(workflow => workflow.id !== workflowId));
    }
  };

  const handleDeleteStep = async (workflowId, stepId) => {
    const response = await fetch(`/api/workflows/${workflowId}/steps/${stepId}`, { method: 'DELETE' });
    if (response.ok) {
      const updatedWorkflows = workflows.map(workflow =>
        workflow.id === workflowId
          ? { ...workflow, steps: workflow.steps.filter(step => step.id !== stepId) }
          : workflow
      );
      setWorkflows(updatedWorkflows);
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

  const handleEditStep = async (event) => {
    event.preventDefault();
    const response = await fetch(`/api/workflows/${selectedWorkflowId}/steps/${editingStepId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editStep),
    });
    if (response.ok) {
      const updatedWorkflows = workflows.map(workflow =>
        workflow.id === selectedWorkflowId
          ? {
              ...workflow,
              steps: workflow.steps.map(step =>
                step.id === editingStepId ? { ...step, ...editStep } : step
              ),
            }
          : workflow
      );
      setWorkflows(updatedWorkflows);
      setEditingStepId(null);
      setEditStep({ name: '', step_order: '', requires_payment: false });
    }
  };

  return (
    <Container className="mt-5 settings-container">
      <h1 className="text-center mb-4">Settings</h1>
      <Row>
        <Col md={3}>
          <Nav className="flex-column">
            <Nav.Link onClick={() => setSelectedTab('manage-workflows')} active={selectedTab === 'manage-workflows'}>
              Manage Workflows
            </Nav.Link>
          </Nav>
        </Col>

        <Col md={9}>
          {selectedTab === 'manage-workflows' && (
            <Card>
              <Card.Header>Manage Workflows</Card.Header>
              <Card.Body>
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
                    <React.Fragment key={workflow.id}>
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
                          <div className="d-flex flex-column align-items-end"> {/* Align buttons to the right */}
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteWorkflow(workflow.id)}
                              className="mt-1" // Margin above
                            >
                              Delete
                            </Button>
                            <Button
                              variant="warning"
                              size="sm"
                              className="mt-1" // Margin above
                              onClick={() => {
                                setEditingWorkflowId(workflow.id);
                                setEditWorkflowName(workflow.name);
                              }}
                            >
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
                                <div className="d-flex flex-column align-items-end"> {/* Align buttons to the right */}
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDeleteStep(workflow.id, step.id)}
                                    className="mt-1" // Margin above
                                  >
                                    Delete
                                  </Button>
                                  <Button
                                    variant="warning"
                                    size="sm"
                                    className="mt-1" // Margin above
                                    onClick={() => {
                                      setEditingStepId(step.id);
                                      setEditStep({
                                        name: step.name,
                                        step_order: step.step_order,
                                        requires_payment: step.requires_payment,
                                      });
                                    }}
                                  >
                                    Edit
                                  </Button>
                                </div>
                              </div>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      )}
                    </React.Fragment>
                  ))}
                </ListGroup>

                {editingWorkflowId && (
                  <Form onSubmit={handleEditWorkflow} className="mt-3">
                    <Form.Group controlId="editWorkflowName">
                      <Form.Label>Edit Workflow Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter new workflow name"
                        value={editWorkflowName}
                        onChange={(e) => setEditWorkflowName(e.target.value)}
                      />
                    </Form.Group>
                    <Button variant="success" type="submit">Save Changes</Button>
                    <Button variant="secondary" onClick={() => setEditingWorkflowId(null)} className="ml-2">
                      Cancel
                    </Button>
                  </Form>
                )}

                {editingStepId && (
                  <Form onSubmit={handleEditStep} className="mt-3">
                    <Form.Group controlId="editStepName">
                      <Form.Label>Edit Step Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter new step name"
                        value={editStep.name}
                        onChange={(e) => setEditStep({ ...editStep, name: e.target.value })}
                      />
                    </Form.Group>
                    <Form.Group controlId="editStepOrder">
                      <Form.Label>Edit Step Order</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter step order"
                        value={editStep.step_order}
                        onChange={(e) => setEditStep({ ...editStep, step_order: e.target.value })}
                      />
                    </Form.Group>
                    <Form.Group controlId="editRequiresPayment">
                      <Form.Check
                        type="checkbox"
                        label="Requires Payment"
                        checked={editStep.requires_payment}
                        onChange={(e) => setEditStep({ ...editStep, requires_payment: e.target.checked })}
                      />
                    </Form.Group>
                    <Button variant="success" type="submit">Save Changes</Button>
                    <Button variant="secondary" onClick={() => setEditingStepId(null)} className="ml-2">
                      Cancel
                    </Button>
                  </Form>
                )}

                {selectedWorkflowId && (
                  <Form onSubmit={handleCreateStep} className="mt-3">
                    <Form.Group controlId="formStepName">
                      <Form.Label>Step Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter step name"
                        value={newStep.name}
                        onChange={(e) => setNewStep({ ...newStep, name: e.target.value })}
                      />
                    </Form.Group>
                    <Form.Group controlId="formStepOrder">
                      <Form.Label>Step Order</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter step order"
                        value={newStep.step_order}
                        onChange={(e) => setNewStep({ ...newStep, step_order: e.target.value })}
                      />
                    </Form.Group>
                    <Form.Group controlId="formRequiresPayment">
                      <Form.Check
                        type="checkbox"
                        label="Requires Payment"
                        checked={newStep.requires_payment}
                        onChange={(e) => setNewStep({ ...newStep, requires_payment: e.target.checked })}
                      />
                    </Form.Group>
                    <Button variant="primary" type="submit">Add Step</Button>
                  </Form>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Settings;

