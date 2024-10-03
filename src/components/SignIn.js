// SignIn.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext'; // Adjust the path accordingly
import { Container, Form, Button } from 'react-bootstrap';
import './SignIn.css'; // Importing the SignIn.css file

function SignIn() {
  const { signIn } = useUser(); // Assuming signIn is a function from your context
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // State to hold error messages
  const [rememberMe, setRememberMe] = useState(false); // State for Remember Me checkbox

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      await signIn(email, password);
      navigate('/welcome'); // Redirect to Welcome after successful sign-in
    } catch (error) {
      console.error('Sign-in failed:', error);
      setError('Sign-in failed. Please check your credentials and try again.'); // Display error message
    }
  };

  return (
    <Container>
      <h2>Sign In</h2>
      <Form onSubmit={handleSubmit}>
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

        <Form.Group controlId="formBasicRememberMe">
          <Form.Check 
            type="checkbox" 
            label="Remember Me" 
            checked={rememberMe} 
            onChange={(e) => setRememberMe(e.target.checked)} 
          />
        </Form.Group>

        {/* Display error message if sign-in fails */}
        {error && <p className="text-danger">{error}</p>}

        <Button variant="primary" type="submit">
          Sign In
        </Button>
      </Form>

      <div className="forgot-password-link">
        <p>
          <a href="/forgot-password">Forgot Password?</a>
        </p>
      </div>
      <div className="signup-link">
        <p>
          Don't have an account? <a href="/signup">Sign Up</a>
        </p>
      </div>
    </Container>
  );
}

export default SignIn;
