import React, { useState } from 'react';
import { Card, Button, Form, Spinner } from 'react-bootstrap';
import './LegalTemplates.css';

const templates = [
  {
    id: 1,
    name: 'Contract Agreement',
    fields: [
      { label: 'Party A Name', type: 'text', name: 'partyA' },
      { label: 'Party B Name', type: 'text', name: 'partyB' },
      { label: 'Contract Date', type: 'date', name: 'contractDate' },
      { label: 'Is this contract renewable?', type: 'checkbox', name: 'isRenewable' }
    ]
  },
  {
    id: 2,
    name: 'Non-Disclosure Agreement (NDA)',
    fields: [
      { label: 'Disclosing Party', type: 'text', name: 'disclosingParty' },
      { label: 'Receiving Party', type: 'text', name: 'receivingParty' },
      { label: 'Effective Date', type: 'date', name: 'effectiveDate' },
      { label: 'Confidentiality Duration (Years)', type: 'number', name: 'confidentialityDuration' }
    ]
  },
  {
    id: 3,
    name: 'Power of Attorney',
    fields: [
      { label: 'Principal Name', type: 'text', name: 'principal' },
      { label: 'Agent Name', type: 'text', name: 'agent' },
      { label: 'Effective Until', type: 'date', name: 'effectiveUntil' },
      { label: 'Agent Authority', type: 'textarea', name: 'agentAuthority' }
    ]
  },
  {
    id: 4,
    name: 'Affidavit',
    fields: [
      { label: 'Affiant Name', type: 'text', name: 'affiant' },
      { label: 'Date Signed', type: 'date', name: 'dateSigned' },
      { label: 'Has this affidavit been notarized?', type: 'radio', name: 'notarized', options: ['Yes', 'No'] }
    ]
  },
  {
    id: 5,
    name: 'Employment Contract',
    fields: [
      { label: 'Employer Name', type: 'text', name: 'employer' },
      { label: 'Employee Name', type: 'text', name: 'employee' },
      { label: 'Start Date', type: 'date', name: 'startDate' },
      { label: 'Position', type: 'text', name: 'position' },
      { label: 'Monthly Salary (ZAR)', type: 'number', name: 'salary' }
    ]
  },
  {
    id: 6,
    name: 'Lease Agreement',
    fields: [
      { label: 'Landlord Name', type: 'text', name: 'landlord' },
      { label: 'Tenant Name', type: 'text', name: 'tenant' },
      { label: 'Lease Start Date', type: 'date', name: 'leaseStartDate' },
      { label: 'Monthly Rent (ZAR)', type: 'number', name: 'monthlyRent' },
      { label: 'Lease Duration (Months)', type: 'number', name: 'leaseDuration' }
    ]
  },
  {
    id: 7,
    name: 'Sales Agreement',
    fields: [
      { label: 'Seller Name', type: 'text', name: 'seller' },
      { label: 'Buyer Name', type: 'text', name: 'buyer' },
      { label: 'Item Description', type: 'textarea', name: 'itemDescription' },
      { label: 'Sale Price (ZAR)', type: 'number', name: 'salePrice' },
      { label: 'Sale Date', type: 'date', name: 'saleDate' }
    ]
  },
  {
    id: 8,
    name: 'Memorandum of Understanding (MoU)',
    fields: [
      { label: 'Party A Name', type: 'text', name: 'partyA' },
      { label: 'Party B Name', type: 'text', name: 'partyB' },
      { label: 'Effective Date', type: 'date', name: 'effectiveDate' },
      { label: 'Scope of Understanding', type: 'textarea', name: 'scope' },
      { label: 'Duration (Months)', type: 'number', name: 'duration' }
    ]
  },
  {
    id: 9,
    name: 'Service Agreement',
    fields: [
      { label: 'Client Name', type: 'text', name: 'client' },
      { label: 'Service Provider Name', type: 'text', name: 'serviceProvider' },
      { label: 'Service Start Date', type: 'date', name: 'serviceStartDate' },
      { label: 'Service Description', type: 'textarea', name: 'serviceDescription' },
      { label: 'Service Fee (ZAR)', type: 'number', name: 'serviceFee' }
    ]
  }
];

// Form Field Generator Component
const FormField = ({ field, formData, handleInputChange }) => {
  const { label, type, name, options } = field;

  return (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      {type === 'textarea' ? (
        <Form.Control
          as="textarea"
          name={name}
          value={formData[name] || ''}
          onChange={handleInputChange}
          required
        />
      ) : type === 'radio' ? (
        options.map((option, i) => (
          <Form.Check
            key={i}
            type="radio"
            label={option}
            name={name}
            value={option}
            checked={formData[name] === option}
            onChange={handleInputChange}
            required
          />
        ))
      ) : (
        <Form.Control
          type={type}
          name={name}
          value={formData[name] || ''}
          onChange={handleInputChange}
          required
        />
      )}
    </Form.Group>
  );
};

const LegalTemplates = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate a server request
    setTimeout(() => {
      console.log('Form data:', formData);
      alert('Document created successfully!');
      setIsSubmitting(false);
    }, 1500);
  };

  const handleClose = () => {
    setSelectedTemplate(null);
  };

  return (
    <div className="legal-templates">
      <div className="sidebar">
        <h2>Legal Document Templates</h2>
        <div className="template-list">
          {templates.map((template) => (
            <Card key={template.id} className="template-card mb-4">
              <Card.Body>
                <Card.Title>{template.name}</Card.Title>
                <Button variant="primary" onClick={() => handleTemplateSelect(template)}>
                  Create {template.name}
                </Button>
              </Card.Body>
            </Card>
          ))}
        </div>
      </div>

      <div className="content">
        {selectedTemplate && (
          <div className="form-container mt-5">
            <h3>Create {selectedTemplate.name}</h3>
            <Form onSubmit={handleSubmit}>
              {selectedTemplate.fields.map((field, index) => (
                <FormField
                  key={index}
                  field={field}
                  formData={formData}
                  handleInputChange={handleInputChange}
                />
              ))}
              <div className="d-flex">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Spinner animation="border" size="sm" /> : 'Submit'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleClose}
                  className="ml-3"
                >
                  Close
                </Button>
              </div>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalTemplates;