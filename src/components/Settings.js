import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Nav, Form, ListGroup } from 'react-bootstrap';
import './Settings.css'; // Add your custom CSS for styling

const Settings = () => {
  const [selectedTab, setSelectedTab] = useState('manage-users');
  const [workflows, setWorkflows] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [roles, setRoles] = useState([]); // State for roles
  const [newWorkflow, setNewWorkflow] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState('');

  const handleTabSelect = (tab) => {
    setSelectedTab(tab);
  };

  useEffect(() => {
    const fetchWorkflows = async () => {
      const response = await fetch('/api/workflows');
      const data = await response.json();
      setWorkflows(data);
    };

    const fetchRoles = async () => {
      const response = await fetch('/api/roles'); // Adjust API endpoint
      const data = await response.json();
      setRoles(data);
    };

    fetchWorkflows();
    fetchRoles(); // Fetch roles on component mount
  }, []);

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

  const handleCreateStatus = async (event) => {
    event.preventDefault();
    const response = await fetch('/api/statuses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newStatus, workflow_id: selectedWorkflowId }),
    });
    if (response.ok) {
      const newStatusData = await response.json();
      setStatuses([...statuses, newStatusData]);
      setNewStatus('');
    }
  };

  const handleSelectWorkflow = async (workflowId) => {
    setSelectedWorkflowId(workflowId);
    const response = await fetch(`/api/statuses/${workflowId}`);
    const data = await response.json();
    setStatuses(data);
  };

  return (
    <Container className="mt-5 settings-container">
      <h1 className="text-center mb-4">Settings</h1>

      <Row>
        <Col md={3} className="mb-4">
          <Nav className="flex-column">
            <Nav.Link onClick={() => handleTabSelect('manage-users')} active={selectedTab === 'manage-users'}>
              Manage Users
            </Nav.Link>
            <Nav.Link onClick={() => handleTabSelect('manage-roles')} active={selectedTab === 'manage-roles'}>
              Manage Roles
            </Nav.Link>
            {/* Add more tabs as needed */}
          </Nav>
        </Col>

        <Col md={9}>
          {selectedTab === 'manage-roles' && (
            <Card>
              <Card.Header>Manage Roles</Card.Header>
              <Card.Body>
                <Form>
                  <Form.Group controlId="formRoleName">
                    <Form.Label>Role Name</Form.Label>
                    <Form.Control type="text" placeholder="Enter role name" />
                  </Form.Group>
                  <Button variant="primary" type="submit">Add Role</Button>
                </Form>
                <ListGroup className="mt-4">
                  {roles.map(role => (
                    <ListGroup.Item key={role.id}>
                      {role.name}
                      <Button variant="danger" className="float-end">Remove</Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          )}
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
                    <ListGroup.Item key={workflow.id} onClick={() => handleSelectWorkflow(workflow.id)}>
                      {workflow.name}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                {selectedWorkflowId && (
                  <Form onSubmit={handleCreateStatus}>
                    <Form.Group controlId="formStatusName">
                      <Form.Label>Status Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter status name"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                      />
                    </Form.Group>
                    <Button variant="primary" type="submit">Add Status</Button>
                  </Form>
                )}
                {statuses.length > 0 && (
                  <ListGroup className="mt-4">
                    {statuses.map((status) => (
                      <ListGroup.Item key={status.id}>
                        {status.name}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
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

