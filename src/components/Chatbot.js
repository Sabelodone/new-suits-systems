import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faComments } from '@fortawesome/free-solid-svg-icons';
import './Chatbot.css'; // Create a CSS file for styling

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return; // Prevent sending empty messages

    setMessages((prevMessages) => [
      ...prevMessages,
      { text: inputValue, sender: 'user' },
    ]);
    
    const response = await fetch('/api/chat', { // Replace with your API endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: inputValue }),
    });

    if (response.ok) {
      const data = await response.json();
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: inputValue, sender: 'user' },
        { text: data.reply, sender: 'bot' },
      ]);
    } else {
      console.error('Failed to send message');
    }
    
    setInputValue(''); // Clear the input field
  };

  return (
    <div className={`chatbot ${isOpen ? 'open' : ''}`}>
      <div className="chatbot-header" onClick={toggleChatbot}>
        <h3>Chatbot</h3>
        <FontAwesomeIcon icon={faComments} onClick={toggleChatbot} />
      </div>
      {isOpen && (
        <div className="chatbot-body">
          <div className="messages">
            {messages.map((msg, index) => (
              <div key={index} className={msg.sender}>
                {msg.text}
              </div>
            ))}
          </div>
          <input
            type="text"
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <FontAwesomeIcon icon={faTimes} onClick={toggleChatbot} />
        </div>
      )}
    </div>
  );
};

export default Chatbot;
