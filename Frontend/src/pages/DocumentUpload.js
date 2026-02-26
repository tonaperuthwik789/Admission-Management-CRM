import { useState, useEffect } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import '../styles/DocumentUpload.css';

function DocumentUpload() {
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [filePath, setFilePath] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [applicantDocs, setApplicantDocs] = useState([]);

  const headers = { Authorization: localStorage.getItem("token") };

  const documentTypes = [
    '10th Mark Sheet',
    '12th Mark Sheet',
    'Bachelor Degree',
    'Post Graduate Degree',
    'Birth Certificate',
    'Aadhar Card',
    'Community Certificate',
    'Income Certificate',
    'Medical Certificate',
    'Character Certificate'
  ];

  useEffect(() => {
    loadApplicants();
  }, []);

  const loadApplicants = async () => {
    try {
      const res = await api.get('/applicants', { headers });
      setApplicants(res.data);
    } catch (err) {
      console.error('Error loading applicants:', err);
      setMessage('Error loading applicants');
    }
  };

  const handleApplicantChange = async (e) => {
    const appId = e.target.value;
    setSelectedApplicant(appId);
    
    if (appId) {
      try {
        const res = await api.get(`/documents/applicant/${appId}`, { headers });
        setApplicantDocs(res.data);
      } catch (err) {
        console.error('Error loading applicant documents:', err);
      }
    } else {
      setApplicantDocs([]);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // In a real app, you'd upload to a server. Here we'll just use a fake path
      setFilePath(`/uploads/${selectedFile.name}`);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedApplicant) {
      setMessage('Please select an applicant');
      return;
    }
    if (!documentType) {
      setMessage('Please select a document type');
      return;
    }
    if (!filePath) {
      setMessage('Please select a file');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(`/documents/upload/${selectedApplicant}`, 
        { 
          document_type: documentType, 
          file_path: filePath 
        }, 
        { headers }
      );

      setMessage('✓ Document uploaded successfully!');
      
      // Add to uploaded list
      setUploadedDocs([...uploadedDocs, {
        applicant_id: selectedApplicant,
        document_type: documentType,
        file_path: filePath,
        upload_date: new Date().toLocaleDateString()
      }]);

      // Reset form
      setDocumentType('');
      setFilePath('');
      setFile(null);

      // Reload applicant documents
      loadApplicants();
      handleApplicantChange({ target: { value: selectedApplicant } });

      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error uploading document: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="document-upload-container">
        <div className="upload-header">
          <h2>📤 Upload Documents</h2>
          <p>Upload documents for applicants to track verification</p>
        </div>

        {message && (
          <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
            {message}
          </div>
        )}

        <div className="upload-content">
          {/* Upload Form */}
          <div className="upload-form-section">
            <h3>📝 Upload New Document</h3>
            <form onSubmit={handleUpload} className="upload-form">
              <div className="form-group">
                <label>Select Applicant:</label>
                <select 
                  value={selectedApplicant}
                  onChange={handleApplicantChange}
                  required
                >
                  <option value="">Choose an applicant...</option>
                  {applicants.map(app => (
                    <option key={app.id} value={app.id}>
                      {app.first_name} {app.last_name} (App #: {app.application_number})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Document Type:</label>
                <select 
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  required
                >
                  <option value="">Select document type...</option>
                  {documentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Upload File:</label>
                <div className="file-input-wrapper">
                  <input 
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    required
                  />
                  <span className="file-name">
                    {file ? file.name : 'No file selected'}
                  </span>
                </div>
                <small>Supported: PDF, JPG, PNG, DOC, DOCX (Max 5MB)</small>
              </div>

              <button 
                type="submit" 
                className="btn-upload"
                disabled={loading}
              >
                {loading ? 'Uploading...' : '📤 Upload Document'}
              </button>
            </form>
          </div>

          {/* Applicant Documents */}
          {selectedApplicant && (
            <div className="applicant-docs-section">
              <h3>📄 Applicant Documents</h3>
              {applicantDocs.length > 0 ? (
                <div className="docs-list">
                  <table className="docs-table">
                    <thead>
                      <tr>
                        <th>Document Type</th>
                        <th>Upload Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applicantDocs.map((doc, idx) => (
                        <tr key={idx}>
                          <td>{doc.document_type}</td>
                          <td>{new Date(doc.upload_date).toLocaleDateString()}</td>
                          <td>
                            <span className={`status-badge ${doc.verification_status.toLowerCase()}`}>
                              {doc.verification_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-docs">No documents uploaded yet for this applicant</div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default DocumentUpload;
