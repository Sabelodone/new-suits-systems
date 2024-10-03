import React, { useState } from 'react'; 
import './Dashboard.css'; 
import './Chatbot.css'; 
import { Card, Row, Col } from 'react-bootstrap'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faRobot, faTimes } from '@fortawesome/free-solid-svg-icons'; 
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
      // Check for user consent before sending messages
      if (!consentGiven) {
        alert('Please provide consent to use the chatbot.');
        return;
      }
      
      // Add user message
      setMessages((prevMessages) => [...prevMessages, { text: inputValue, sender: 'user' }]);
      
      // Simulate loading and bot response
      setIsLoading(true);
      setTimeout(() => {
        setMessages((prevMessages) => [...prevMessages, { text: "I'm a bot, how can I assist you?", sender: 'bot' }]);
        setIsLoading(false);
      }, 1000);
      
      // Clear input
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

      {/* AI Chatbot Icon */}
      <div className="chatbot-icon text-center" title="Chat with AI" onClick={toggleChatbot}>
        <FontAwesomeIcon icon={faRobot} size="2x" />
      </div>

      {/* Chatbot Component */}
      {isChatbotOpen && (
        <div className="chatbot open">
          <div className="chatbot-header d-flex justify-content-between align-items-center">
            <h5 className="m-0">Chatbot</h5>
            <FontAwesomeIcon icon={faTimes} size="lg" onClick={toggleChatbot} style={{ cursor: 'pointer' }} />
          </div>
          <div className="chatbot-body">
            {/* Consent Message */}
            {!consentGiven && (
              <div className="consent-message">
                <p>To use the chatbot, please give your consent:</p>
                <button onClick={handleConsent}>I Consent</button>
              </div>
            )}
            <div className="messages">
              {messages.map((msg, index) => (
                <div key={index} className={msg.sender === 'user' ? 'user' : 'bot'}>
                  {msg.text}
                </div>
              ))}
              {isLoading && <div className="bot">...typing</div>} {/* Loading indication */}
            </div>
            <div className="input-container">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Type a message..."
                disabled={!consentGiven} // Disable input until consent is given
              />
              <button onClick={handleSendMessage} disabled={!consentGiven}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
