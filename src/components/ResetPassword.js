import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import './ResetPassword.css';

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      setMessage('');
      return;
    }

    // Send new password to API (replace with actual API call)
    setMessage('Your password has been reset successfully.');
    setErrorMessage('');
  };

  return (
    <div className="reset-password-container">
      <h2>Reset Password</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formNewPassword">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="form-input"
          />
        </Form.Group>
        <Form.Group controlId="formConfirmPassword">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="form-input"
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="btn-submit">
          Reset Password
        </Button>
      </Form>
      {message && <p className="text-success mt-3 message">{message}</p>}
      {errorMessage && <p className="text-danger mt-3 message">{errorMessage}</p>}

      {/* Forgot Password Link */}
      <div className="forgot-password-link">
        <p>
          <a href="/forgot-password">Forgot Password?</a>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;
