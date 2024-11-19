import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useMemo } from 'react';
import axios from 'axios';
import './DocumentManagement.css';

const DocumentManager = () => {
  const [documents, setDocuments] = useState([]);
  const [caseNumber, setCaseNumber] = useState('');
  const [description, setDescription] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [file, setFile] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateFile = (file) => {
    if (!file) return 'Please select a file.';
    if (file.size > 10 * 1024 * 1024) {
      return 'File is too large. Maximum size is 10MB.';
    }
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      return 'Invalid file type. Only PDF, JPEG, and PNG files are allowed.';
    }
    return null;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return; // Exit the function if there's an error
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64File = reader.result.split(',')[1]; // Get base64 string

        const newDocument = {
	  file_name: file.name,
          file_content: base64File, // Use base64 encoded content
          // Include additional fields if needed, like:
          // case_id: caseNumber,
          // document_type_id: documentType,
          //caseNumber,
          //description,
          //documentType,
          //file_name: file.name,
          //file_content: base64File, // Use base64 encoded content
        };

        await axios.post('http://34.35.69.207/api/documents', newDocument); // Adjust the URL as needed

        setDocuments([...documents, newDocument]);
        setSuccess('Document uploaded successfully!');
        setCaseNumber('');
        setDescription('');
        setDocumentType('');
        setFile(null);
        setIsFormVisible(false);
      };
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) =>
      [doc.caseNumber, doc.description, doc.documentType]
        .some(field => field.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [documents, searchTerm]);

  const getIconForDocumentType = (type) => {
    switch (type) {
      case 'application/pdf':
        return '📄'; 
      case 'image/jpeg':
      case 'image/png':
        return '📄'; 
      default:
        return '📄'; 
    }
  };

  const handleDelete = (index) => {
    setDocuments((prevDocs) => prevDocs.filter((_, docIndex) => docIndex !== index));
  };

  return (
    <div className="doc-manager-container my-5 p-4 bg-light rounded shadow">
      <h2 className="doc-manager-title mb-4 text-primary border-bottom pb-2">Document Management System</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="doc-manager-search mb-4">
        <input
          type="text"
          placeholder="Search by case number, description, or document type"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control"
        />
      </div>

      <button className="btn btn-success mb-4" onClick={() => setIsFormVisible(!isFormVisible)}>
        {isFormVisible ? 'Close Form' : 'Add New Document'}
      </button>

      {isFormVisible && (
        <form onSubmit={handleUpload} className="mb-5">
          <div className="form-group">
            <label htmlFor="caseNumber">Case Number:</label>
            <input
              type="text"
              id="caseNumber"
              value={caseNumber}
              onChange={(e) => setCaseNumber(e.target.value)}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="documentType">Document Type:</label>
            <select
              id="documentType"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="form-control"
              required
            >
              <option value="">Select Type</option>
              <option value="contract">Contract</option>
              <option value="agreement">Agreement</option>
              <option value="report">Report</option>
              <option value="invoice">Invoice</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="fileUpload">Upload File:</label>
            <input
              type="file"
              id="fileUpload"
              onChange={handleFileChange}
              className="form-control-file"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>
      )}

      <h3 className="doc-manager-subtitle mb-3">Uploaded Documents</h3>
      <div className="row">
        {filteredDocuments.length > 0 ? (
          filteredDocuments.map((doc, index) => (
            <div key={index} className="col-md-4 text-center mb-4">
              <div className="doc-document-icon mb-2">
                {getIconForDocumentType(doc.file.type)}
              </div>
              <p>{doc.description}</p>
              <div className="d-flex justify-content-center gap-2">
                <a href={`data:application/pdf;base64,${doc.file_content}`} target="_blank" rel="noopener noreferrer" className="btn btn-link">
                  View Document
                </a>
                <button onClick={() => handleDelete(index)} className="btn btn-danger">
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No documents found.</p>
        )}
      </div>
    </div>
  );
};

export default DocumentManager;

