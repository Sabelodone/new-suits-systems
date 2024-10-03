import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext'; // Adjust the path accordingly
import { Container, Form, Button } from 'react-bootstrap';
import './SignUp.css'; // Importing the SignUp.css file

function SignUp() {
  const { signUp } = useUser(); // Assuming signUp is a function from your context
  const navigate = useNavigate();
  
  // State variables for form fields and messages
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Email validation
  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email regex pattern
    return emailPattern.test(email);
  };

  // Password validation
  const validatePassword = (password) => password.length >= 6; // Ensure password is at least 6 characters

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Input validation
    if (!fullName.trim()) {
      setError('Full Name is required.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!termsAccepted) {
      setError('You must accept the terms and conditions.');
      return;
    }

    // Attempt sign-up
    try {
      await signUp(email, password); // Add your sign-up logic here
      setSuccessMessage('Sign-up successful! Redirecting to Sign In...');
      setTimeout(() => navigate('/signin'), 2000); // Redirect after 2 seconds
    } catch (error) {
      console.error('Sign-up failed:', error);
      setError('Sign-up failed. Please try again.');
    }
  };

  return (
    <Container>
      <h2>Sign Up</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formBasicFullName">
          <Form.Label>Full Name</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Enter your full name" 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)} 
            required 
          />
        </Form.Group>

        <Form.Group controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control 
            type="email" 
            placeholder="Enter email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </Form.Group>

        <Form.Group controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </Form.Group>

        <Form.Group controlId="formBasicConfirmPassword">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control 
            type="password" 
            placeholder="Confirm your password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
          />
        </Form.Group>

        <Form.Group controlId="formTerms">
          <Form.Check 
            type="checkbox" 
            label={
              <>
                I agree to the 
                <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer"> Terms and Conditions</a>
              </>
            } 
            checked={termsAccepted} 
            onChange={(e) => setTermsAccepted(e.target.checked)} 
            required 
          />
        </Form.Group>

        {/* Display error and success messages */}
        {error && <p className="text-danger">{error}</p>}
        {successMessage && <p className="text-success">{successMessage}</p>}

        <Button variant="primary" type="submit">
          Sign Up
        </Button>
      </Form>

      <div className="signin-link">
        <p>
          Already have an account? <a href="/signin">Sign In</a>
        </p>
      </div>
    </Container>
  );
}

export default SignUp;
