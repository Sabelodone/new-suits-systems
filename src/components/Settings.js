import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Nav, Form, Table, ListGroup } from 'react-bootstrap';
import './Settings.css'; // Add your custom CSS for styling

const Settings = () => {
  const [selectedTab, setSelectedTab] = useState('manage-users');

  const handleTabSelect = (tab) => {
    setSelectedTab(tab);
  };

  return (
    <Container className="mt-5 settings-container">
      <h1 className="text-center mb-4">Settings</h1>

      <Row>
        {/* Navigation for the settings on the left side */}
        <Col md={3} className="mb-4">
          <Nav className="flex-column">
            <Nav.Link
              onClick={() => handleTabSelect('manage-users')}
              active={selectedTab === 'manage-users'}
            >
              Manage Users
            </Nav.Link>
            <Nav.Link
              onClick={() => handleTabSelect('manage-offices')}
              active={selectedTab === 'manage-offices'}
            >
              Manage Offices
            </Nav.Link>
            <Nav.Link
              onClick={() => handleTabSelect('law-firm-settings')}
              active={selectedTab === 'law-firm-settings'}
            >
              Law Firm Settings
            </Nav.Link>
            <Nav.Link
              onClick={() => handleTabSelect('manage-activities')}
              active={selectedTab === 'manage-activities'}
            >
              Manage Activities
            </Nav.Link>
            <Nav.Link
              onClick={() => handleTabSelect('manage-documents')}
              active={selectedTab === 'manage-documents'}
            >
              Manage Documents
            </Nav.Link>
            <Nav.Link
              onClick={() => handleTabSelect('manage-practice-areas')}
              active={selectedTab === 'manage-practice-areas'}
            >
              Manage Practice Areas
            </Nav.Link>
            <Nav.Link
              onClick={() => handleTabSelect('subscription-payment')}
              active={selectedTab === 'subscription-payment'}
            >
              Subscription & Payment
            </Nav.Link>
          </Nav>
        </Col>

        {/* Content area on the right side */}
        <Col md={9}>
          {selectedTab === 'manage-users' && (
            <Card>
              <Card.Header>Manage Users</Card.Header>
              <Card.Body>
                <Form>
                  <Form.Group controlId="formUserEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" placeholder="Enter user email" />
                  </Form.Group>
                  <Form.Group controlId="formUserRole">
                    <Form.Label>Role</Form.Label>
                    <Form.Control as="select">
                      <option>Admin</option>
                      <option>Editor</option>
                      <option>Viewer</option>
                    </Form.Control>
                  </Form.Group>
                  <Button variant="primary" type="submit">Add User</Button>
                </Form>
                <Table striped bordered hover className="mt-4">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>john.doe@example.com</td>
                      <td>Admin</td>
                      <td>
                        <Button variant="danger">Remove</Button>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}

          {selectedTab === 'manage-offices' && (
            <Card>
              <Card.Header>Manage Offices</Card.Header>
              <Card.Body>
                <Form>
                  <Form.Group controlId="formOfficeName">
                    <Form.Label>Office Name</Form.Label>
                    <Form.Control type="text" placeholder="Enter office name" />
                  </Form.Group>
                  <Form.Group controlId="formOfficeLocation">
                    <Form.Label>Location</Form.Label>
                    <Form.Control type="text" placeholder="Enter office location" />
                  </Form.Group>
                  <Button variant="primary" type="submit">Add Office</Button>
                </Form>
                <ListGroup className="mt-4">
                  <ListGroup.Item>Office 1 - New York</ListGroup.Item>
                  <ListGroup.Item>Office 2 - Los Angeles</ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          )}

          {selectedTab === 'law-firm-settings' && (
            <Card>
              <Card.Header>Law Firm Settings</Card.Header>
              <Card.Body>
                <Form>
                  <Form.Group controlId="formFirmName">
                    <Form.Label>Firm Name</Form.Label>
                    <Form.Control type="text" placeholder="Enter law firm name" />
                  </Form.Group>
                  <Form.Group controlId="formFirmLogo">
                    <Form.Label>Upload Logo</Form.Label>
                    <Form.File />
                  </Form.Group>
                  <Button variant="primary" type="submit">Save Settings</Button>
                </Form>
              </Card.Body>
            </Card>
          )}

          {selectedTab === 'manage-activities' && (
            <Card>
              <Card.Header>Manage Activities</Card.Header>
              <Card.Body>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Activity</th>
                      <th>Date</th>
                      <th>Duration</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Client Meeting</td>
                      <td>2024-09-01</td>
                      <td>1 hour</td>
                      <td>
                        <Button variant="danger">Delete</Button>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}

          {selectedTab === 'manage-documents' && (
            <Card>
              <Card.Header>Manage Documents</Card.Header>
              <Card.Body>
                <Form>
                  <Form.Group controlId="formDocumentTitle">
                    <Form.Label>Document Title</Form.Label>
                    <Form.Control type="text" placeholder="Enter document title" />
                  </Form.Group>
                  <Form.Group controlId="formDocumentUpload">
                    <Form.Label>Upload Document</Form.Label>
                    <Form.File />
                  </Form.Group>
                  <Button variant="primary" type="submit">Upload Document</Button>
                </Form>
                <ListGroup className="mt-4">
                  <ListGroup.Item>Document 1 - Contract.pdf</ListGroup.Item>
                  <ListGroup.Item>Document 2 - Invoice.docx</ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          )}

          {selectedTab === 'manage-practice-areas' && (
            <Card>
              <Card.Header>Manage Practice Areas</Card.Header>
              <Card.Body>
                <Form>
                  <Form.Group controlId="formPracticeArea">
                    <Form.Label>Practice Area</Form.Label>
                    <Form.Control type="text" placeholder="Enter practice area" />
                  </Form.Group>
                  <Button variant="primary" type="submit">Add Practice Area</Button>
                </Form>
                <ListGroup className="mt-4">
                  <ListGroup.Item>Practice Area 1 - Family Law</ListGroup.Item>
                  <ListGroup.Item>Practice Area 2 - Criminal Law</ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          )}

          {selectedTab === 'subscription-payment' && (
            <Card>
              <Card.Header>Subscription & Payment</Card.Header>
              <Card.Body>
                <Form>
                  <Form.Group controlId="formPaymentMethod">
                    <Form.Label>Payment Method</Form.Label>
                    <Form.Control as="select">
                      <option>Credit Card</option>
                      <option>PayPal</option>
                      <option>Bank Transfer</option>
                    </Form.Control>
                  </Form.Group>
                  <Form.Group controlId="formPaymentDetails">
                    <Form.Label>Payment Details</Form.Label>
                    <Form.Control type="text" placeholder="Enter payment details" />
                  </Form.Group>
                  <Button variant="primary" type="submit">Update Payment</Button>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Settings;
