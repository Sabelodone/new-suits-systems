import React, { useState, useEffect } from 'react';
import './EmailSettings.css'; // Import the CSS file

const EmailSettings = ({ onSettingsSave }) => {
  const [serviceId, setServiceId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [userId, setUserId] = useState('');

  // Load settings from local storage
  useEffect(() => {
    const savedServiceId = localStorage.getItem('serviceId');
    const savedTemplateId = localStorage.getItem('templateId');
    const savedUserId = localStorage.getItem('userId');

    if (savedServiceId) setServiceId(savedServiceId);
    if (savedTemplateId) setTemplateId(savedTemplateId);
    if (savedUserId) setUserId(savedUserId);
  }, []);

  const handleSave = () => {
    // Save settings to local storage
    localStorage.setItem('serviceId', serviceId);
    localStorage.setItem('templateId', templateId);
    localStorage.setItem('userId', userId);

    onSettingsSave({ serviceId, templateId, userId });
  };

  return (
    <div className="email-settings"> {/* Add class for styling */}
      <h3>Email Settings</h3>
      <label>
        Service ID:
        <input
          type="text"
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
        />
      </label>
      <label>
        Template ID:
        <input
          type="text"
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
        />
      </label>
      <label>
        User ID:
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
      </label>
      <button onClick={handleSave}>Save Settings</button>
    </div>
  );
};

export default EmailSettings;
