import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useMemo } from 'react';
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
      if (validationError) throw new Error(validationError);

      const newDocument = {
        caseNumber,
        description,
        documentType,
        file,
        fileUrl: URL.createObjectURL(file),
      };

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setDocuments([...documents, newDocument]);
      setSuccess('Document uploaded successfully!');
      setCaseNumber('');
      setDescription('');
      setDocumentType('');
      setFile(null);
      setIsFormVisible(false);
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

  // Drag-and-drop event handlers
  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  return (
    <div className="doc-management-container my-5 p-4 bg-light rounded shadow">
      <h2 className="doc-management-title mb-4 text-primary border-bottom pb-2">Document Management System</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="doc-management-search mb-4">
        <input
          type="text"
          placeholder="Search by case number, description, or document type"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control"
        />
      </div>

      <button className="doc-btn-primary mb-4" onClick={() => setIsFormVisible(!isFormVisible)}>
        {isFormVisible ? 'Close Form' : 'Add New Document'}
      </button>

      {isFormVisible && (
        <form onSubmit={handleUpload} className="mb-5">
          <div className="doc-form-group">
            <label htmlFor="caseNumber">Case Number:</label>
            <input
              type="text"
              id="caseNumber"
              value={caseNumber}
              onChange={(e) => setCaseNumber(e.target.value)}
              className="doc-form-control"
              required
            />
          </div>
          <div className="doc-form-group">
            <label htmlFor="description">Description:</label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="doc-form-control"
              required
            />
          </div>
          <div className="doc-form-group">
            <label htmlFor="documentType">Document Type:</label>
            <select
              id="documentType"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="doc-form-control-select"
              required
            >
              <option value="">Select Type</option>
              <option value="contract">Contract</option>
              <option value="agreement">Agreement</option>
              <option value="report">Report</option>
              <option value="invoice">Invoice</option>
            </select>
          </div>
          <div
            className="doc-file-drop-area"
            onDrop={handleFileDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
          >
            <label htmlFor="fileUpload">Drag & Drop File Here or Click to Upload</label>
            <input
              type="file"
              id="fileUpload"
              onChange={handleFileChange}
              className="doc-form-control-file"
              style={{ display: "none" }}
              required
            />
            {file && <p>File Selected: {file.name}</p>}
          </div>

          <button type="submit" className="doc-btn-primary" disabled={isLoading}>
            {isLoading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>
      )}

      <h3 className="doc-management-subtitle mb-3">Uploaded Documents</h3>
      <div className="row">
        {filteredDocuments.length > 0 ? (
          filteredDocuments.map((doc, index) => (
            <div key={index} className="col-md-4 text-center mb-4">
              <div className="doc-document-icon mb-2">
                {getIconForDocumentType(doc.file.type)}
              </div>
              <p>{doc.description}</p>
              <div className="d-flex justify-content-center gap-2">
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="doc-btn-link">
                  View Document
                </a>
                <button onClick={() => handleDelete(index)} className="doc-btn-danger">
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
