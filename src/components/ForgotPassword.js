import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import './ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check if the email format is valid
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      setMessage('');
      return;
    }

    // Simulate checking the email against your API/database
    const existingEmails = ['sabelozondo825@gmail.com', 'user@example.com']; // Replace with actual email list

    if (!existingEmails.includes(email)) {
      setErrorMessage('This email is not registered in our system.');
      setMessage('');
      return;
    }

    // If the email is valid and exists
    setMessage('A reset link has been sent to your email if it exists in our system.');
    setErrorMessage('');
  };

  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>
      <p>Please enter the email address you’d like your password information to be sent to.</p>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="btn-submit">
          Send Reset Link
        </Button>
      </Form>
      {message && <p className="text-success mt-3 message">{message}</p>}
      {errorMessage && <p className="text-danger mt-3 message">{errorMessage}</p>}
      
      {/* Reset Password Link */}
      <div className="reset-password-link">
        <p>
          <a href="/reset-password">Reset Password</a>
        </p>
      </div>

      {/* Back to Sign In Link */}
      <a href="/signin" className="back-to-signin">
        ← Back to Sign In
      </a>
    </div>
  );
}

export default ForgotPassword;
