// CreateCase.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateCase = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Submitting new case with title:', title, 'and description:', description);

    axios.post('http://34.35.69.207/api/cases', { title, description })
      .then(response => {
        console.log('Case created successfully:', response.data); // Log successful case creation
	alert('Case created successfully!');
        navigate('/cases'); // Redirect back to the cases list after creation
      })
      .catch(error => {
        console.error('Error creating case:', error); // Log any errors
	alert('There was an error creating the case!');
      });
  };

  return (
    <div className="container mt-5">
      <h1>Create New Case</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary mt-3">Create Case</button>
      </form>
    </div>
  );
};

export default CreateCase;

