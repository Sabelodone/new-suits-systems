import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext'; // Adjust path as needed
import { Form, Button } from 'react-bootstrap';
import './SignIn.css'; // Importing the SignIn.css file
import { userDetailsAtom } from './shared/queries-store';
import { usePortal } from '@ibnlanre/portal';


function SignIn() {
  const { signIn } = useUser(); // Fetch signIn function from your context
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // State to hold error messages
  // const [user, setUser] = usePortal.atom(userDetailsAtom) //store logged in user details
  const { user } = useUser();

  console.log(user)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors


    try {
      await signIn(email, password); // Attempt to sign in
      navigate('/dashboard'); // Redirect to Welcome after successful sign-in

    } catch (err) {
      setError('Invalid email or password. Please try again.'); // Set error message if sign-in fails
    }
  };


  // console.log(user)

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

        {/* Display error message if sign-in fails */}
        {error && <p className="signin-error text-danger">{error}</p>}

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
