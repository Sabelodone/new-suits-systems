import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { useUser } from './UserContext'; 
import './SignUp.css';
import axios from 'axios'; 

function SignUp() {
  const { signUp } = useUser(); 
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [genderId, setGenderId] = useState(''); 
  const [genders, setGenders] = useState([]); // Added state for genders
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false); 

  // Fetch genders on component mount
  useEffect(() => {
    const fetchGenders = async () => {
      try {
        const response = await axios.get('http://34.35.32.197/users/api/genders'); // Update the endpoint as needed
        setGenders(response.data);
      } catch (err) {
        setError('Failed to fetch gender options.');
      }
    };

    fetchGenders();
  }, []);

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
      await axios.post('http://34.35.32.197/users/api/register', {
        email,
        username,
        password,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        gender_id: genderId, // Include gender_id in the request
      });
      setSuccessMessage('Sign-up successful! Redirecting...');
      setTimeout(() => navigate('/signin'), 2000); 
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
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <input
          className="signup-input"
          type="text"
          placeholder="Middle Name"
          value={middleName}
          onChange={(e) => setMiddleName(e.target.value)}
        />
        <input
          className="signup-input"
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
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
          type="text"
          placeholder="Username" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
        <select
          className="signup-input"
          value={genderId}
          onChange={(e) => setGenderId(e.target.value)} 
          required
        >
          <option value="">Select Gender</option>
          {genders.map(gender => (
            <option key={gender.id} value={gender.id}>{gender.name}</option>
          ))}
        </select>
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

