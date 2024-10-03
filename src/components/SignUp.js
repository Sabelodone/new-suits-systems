import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link from react-router-dom
import { useUser } from './UserContext'; // Adjust path as needed
import './SignUp.css';

function SignUp() {
  const { signUp } = useUser(); // Fetch signUp function from your context
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false); // State for terms acceptance

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!acceptedTerms) {
      setError('You must accept the terms and conditions.');
      return;
    }

    try {
      await signUp(name, email, password);
      setSuccessMessage('Sign-up successful! Redirecting...');
      setTimeout(() => navigate('/signin'), 2000); // Redirect to sign-in after success
    } catch (err) {
      setError('Sign-up failed. Please try again.');
    }
  };

  return (
    <div className="signup-container">
      <h2 className="signup-heading">Sign Up</h2>
      <form className="signup-form" onSubmit={handleSubmit}>
        <input
          className="signup-input"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="signup-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="signup-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          className="signup-input"
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <div>
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={() => setAcceptedTerms(!acceptedTerms)}
            required
          />
          <label>
            I accept the{' '}
            <Link to="/terms-and-conditions">Terms and Conditions</Link>
          </label>
        </div>
        {error && <p className="signup-error">{error}</p>}
        {successMessage && <p className="signup-success">{successMessage}</p>}
        <button className="signup-button" type="submit">Sign Up</button>
      </form>
      <p className="signup-link">
        <Link to="/signin">Already have an account? Sign In</Link>
      </p>
    </div>
  );
}

export default SignUp;
