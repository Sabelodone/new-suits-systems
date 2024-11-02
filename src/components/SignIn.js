import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext'; // Adjust path as needed
import { Form, Button } from 'react-bootstrap';
import './SignIn.css'; // Importing the SignIn.css file
import axios from 'axios'; // Import axios for API requests

function SignIn() {
  const {setUser} = useUser();
  const { signIn, setUserRoles } = useUser(); // Ensure setUserRoles is defined in context
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // State to hold error messages

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://34.35.32.197/api/users/login', { email, password }); // Send request to backend
      if (response.status === 200) {
	    //const { roles } = response.data; // Extract roles from response
	    //setUserRoles(roles); // Store roles in context or state management
	    const userData = response.data;
	    setUser(userData);
	    navigate('/welcome');
      }
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="signin-container">
      <h2 className="signin-heading">Sign In</h2>
      <Form onSubmit={handleSubmit} className="signin-form">
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control 
            className="signin-input" 
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
            className="signin-input" 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </Form.Group>

        {error && <p className="signin-error text-danger">{error}</p>} {/* Display error message if sign-in fails */}

        <Button className="signin-button" variant="primary" type="submit">
          Sign In
        </Button>
      </Form>

      <div className="forgot-password-link">
        <p>
          <a href="/forgot-password">Forgot Password?</a>
        </p>
      </div>
      <div className="signin-link">
        <p>
          Don't have an account? <a href="/signup">Sign Up</a>
        </p>
      </div>
    </div>
  );
}

export default SignIn;

