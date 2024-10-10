import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useMemo } from 'react';
import './DocumentManagement.css'; // Ensure the path is correct for component-specific CSS

const DocumentManager = () => {
  const [documents, setDocuments] = useState([]);
  const [caseNumber, setCaseNumber] = useState('');
  const [description, setDescription] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [file, setFile] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false); // Toggle form visibility
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // File validation (size and type)
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

  // Handle document upload
  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const validationError = validateFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      const newDocument = {
        caseNumber,
        description,
        documentType,
        file,
        fileUrl: URL.createObjectURL(file),
      };

      // Simulate an API request
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setDocuments([...documents, newDocument]);
      setSuccess('Document uploaded successfully!');
      // Reset form fields
      setCaseNumber('');
      setDescription('');
      setDocumentType('');
      setFile(null);
      setIsFormVisible(false); // Hide form after upload
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // File change handler
  const handleFileChange = (e) => setFile(e.target.files[0]);

  // Filter documents by search term
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      return (
        doc.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.documentType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [documents, searchTerm]);

  // Get icon based on document type
  const getIconForDocumentType = (type) => {
    switch (type) {
      case 'application/pdf':
        return '📄'; // PDF icon
      case 'image/jpeg':
      case 'image/png':
        return '🖼️'; // Image icon
      default:
        return '📁'; // Generic document icon
    }
  };

  return (
    <div className="doc-manager-container my-5 p-4 bg-light rounded shadow">
      <h2 className="doc-manager-title mb-4 text-primary border-bottom pb-2">Document Management System</h2>

      {/* Display error or success messages */}
      {error && <div className="doc-manager-alert alert alert-danger">{error}</div>}
      {success && <div className="doc-manager-alert alert alert-success">{success}</div>}

      {/* Search bar */}
      <div className="doc-manager-search mb-4">
        <input
          type="text"
          placeholder="Search by case number, description, or document type"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control"
        />
      </div>

      {/* Toggle form visibility */}
      <button
        className="doc-manager-add-btn btn btn-success mb-4"
        onClick={() => setIsFormVisible(!isFormVisible)}
      >
        {isFormVisible ? 'Close Form' : 'Add New Document'}
      </button>

      {/* Document upload form */}
      {isFormVisible && (
        <form onSubmit={handleUpload} className="doc-manager-form mb-5">
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
          <button type="submit" className="doc-manager-upload-btn btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>
      )}

      {/* Display uploaded documents */}
      <h3 className="doc-manager-subtitle mb-3">Uploaded Documents</h3>
      <div className="row">
        {filteredDocuments.length > 0 ? (
          filteredDocuments.map((doc, index) => (
            <div key={index} className="doc-manager-card col-md-4 text-center mb-4">
              <div className="doc-manager-icon">
                {getIconForDocumentType(doc.file.type)}
              </div>
              <p>{doc.description}</p>
              <a href={doc.fileUrl} download className="btn btn-link">
                {doc.caseNumber}
              </a>
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
