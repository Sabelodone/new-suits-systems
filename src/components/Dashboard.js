import React, { useState } from 'react';
import './Dashboard.css';
import './Chatbot.css';
import {  Button } from 'react-bootstrap';
import { Card, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faTimes, faFileAlt } from '@fortawesome/free-solid-svg-icons'; // Added faFileAlt icon
import { Link } from 'react-router-dom';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, BarElement, ArcElement } from 'chart.js';

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, BarElement, ArcElement);

// Chart data for Line, Pie, and Bar charts
const lineChartData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June'],
  datasets: [
    {
      label: 'Tasks Completed',
      data: [30, 45, 60, 20, 65, 75],
      borderColor: '#004d40',
      backgroundColor: 'rgba(0, 77, 64, 0.1)',
      fill: true,
    },
  ],
};

const pieChartData = {
  labels: ['Cases', 'Tasks', 'Time Management', 'Clients', 'Documents'],
  datasets: [
    {
      label: 'Distribution',
      data: [20, 30, 25, 15, 10],
      backgroundColor: ['#ff6f61', '#00bcd4', '#ffeb3b', '#4caf50', '#9c27b0'],
    },
  ],
};

const barChartData = {
  labels: ['Cases', 'Tasks', 'Clients', 'Documents'],
  datasets: [
    {
      label: 'Cases Closed',
      data: [12, 19, 3, 5],
      backgroundColor: '#004d40',
    },
    {
      label: 'Cases Open',
      data: [8, 12, 6, 9],
      backgroundColor: '#00bcd4',
    },
  ],
};

const Dashboard = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [consentGiven, setConsentGiven] = useState(false); // For consent
  const [isLoading, setIsLoading] = useState(false); // For loading state

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      if (!consentGiven) {
        alert('Please provide consent to use the chatbot.');
        return;
      }

      setMessages((prevMessages) => [...prevMessages, { text: inputValue, sender: 'user' }]);
      setIsLoading(true);
      setTimeout(() => {
        setMessages((prevMessages) => [...prevMessages, { text: "I'm a bot, how can I assist you?", sender: 'bot' }]);
        setIsLoading(false);
      }, 1000);
      setInputValue('');
    }
  };

  const handleConsent = () => {
    setConsentGiven(true);
    alert('Thank you for providing your consent.');
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4 text-center">Dashboard</h1>
      {/* Time Period Buttons */}
      <Row className="mb-3">
        <Col className="text-center">
          <Button variant="outline-primary" className="mx-2">Daily</Button>
          <Button variant="outline-primary" className="mx-2">Weekly</Button>
          <Button variant="outline-primary" className="mx-2">Monthly</Button>
        </Col>
      </Row>

      {/* Records section at the top of the charts */}
      <div className="d-flex justify-content-end align-items-center mb-4">
        <FontAwesomeIcon icon={faFileAlt} size="lg" className="me-2" />
        <h4 className="mb-0">Records</h4>
      </div>

      <Row>
        <Col md={4} className="mb-4">
          <Link to="/cases" className="text-decoration-none">
            <Card className="shadow-lg border-0">
              <Card.Body>
                <Card.Title className="text-primary">Cases Overview</Card.Title>
                <Line data={lineChartData} options={{ responsive: true }} />
              </Card.Body>
            </Card>
          </Link>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="shadow-lg border-0">
            <Card.Body>
              <Card.Title className="text-primary">Distribution Overview</Card.Title>
              <Pie data={pieChartData} options={{ responsive: true }} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="shadow-lg border-0">
            <Card.Body>
              <Card.Title className="text-primary">Cases Status</Card.Title>
              <Bar data={barChartData} options={{ responsive: true }} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Total Clients, Active Cases, and Pending Invoices section */}
      <Row className="mt-5">
        <Col md={4} className="mb-4">
          <Card className="shadow-lg border-0">
            <Card.Body>
              <Card.Title className="text-primary">Total Clients</Card.Title>
              <h4>120</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="shadow-lg border-0">
            <Card.Body>
              <Card.Title className="text-primary">Active Cases</Card.Title>
              <h4>35</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="shadow-lg border-0">
            <Card.Body>
              <Card.Title className="text-primary">Pending Invoices</Card.Title>
              <h4>8</h4>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* AI Chatbot Icon */}
      <div className="chatbot-icon text-center" title="Chat with AI" onClick={toggleChatbot}>
        <FontAwesomeIcon icon={faRobot} size="2x" />
      </div>

      {/* Chatbot Component */}
      {isChatbotOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header d-flex justify-content-between align-items-center">
            <h5 className="m-0">Chat Support</h5>
            <FontAwesomeIcon icon={faTimes} size="lg" onClick={toggleChatbot} style={{ cursor: 'pointer' }} />
          </div>
          <div className="chatbot-body">
            {!consentGiven ? (
              <div className="consent-message">
                <p>We value your privacy. Please consent to use this service:</p>
                <button onClick={handleConsent} className="consent-btn">I Consent</button>
              </div>
            ) : (
              <div className="messages">
                {messages.length > 0 ? (
                  messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender}`}>
                      {msg.text}
                    </div>
                  ))
                ) : (
                  <p className="no-messages">No messages yet. Start the conversation!</p>
                )}
                {isLoading && <div className="bot-typing">...typing</div>}
              </div>
            )}
            <div className="input-container">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Type a message..."
                aria-label="Type a message to chatbot"
                disabled={!consentGiven}
                className="chat-input"
              />
              <button onClick={handleSendMessage} className="send-btn" disabled={!consentGiven}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Dashboard;