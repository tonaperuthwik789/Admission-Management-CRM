import { useState, useEffect } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import '../styles/DocumentVerification.css';

function DocumentVerification() {
  const [pendingDocuments, setPendingDocuments] = useState([]);
  const [approvedDocuments, setApprovedDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [applicantDocs, setApplicantDocs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  const headers = { Authorization: localStorage.getItem("token") };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pendRes, approveRes] = await Promise.all([
        api.get('/documents/pending', { headers }),
        api.get('/documents/verified', { headers })
      ]);
      
      // Group by applicant
      const pendingByApplicant = groupByApplicant(pendRes.data);
      const approvedByApplicant = groupByApplicant(approveRes.data);
      
      setPendingDocuments(pendingByApplicant);
      setApprovedDocuments(approvedByApplicant);
    } catch (err) {
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const groupByApplicant = (documents) => {
    const grouped = {};
    documents.forEach(doc => {
      if (!grouped[doc.applicant_id]) {
        grouped[doc.applicant_id] = {
          applicant_id: doc.applicant_id,
          applicant_name: doc.applicant_name,
          application_number: doc.application_number,
          documents: []
        };
      }
      grouped[doc.applicant_id].documents.push(doc);
    });
    return Object.values(grouped);
  };

  const openApplicantDocs = (applicant) => {
    setSelectedApplicant(applicant);
    setApplicantDocs(applicant.documents);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedApplicant(null);
    setApplicantDocs([]);
  };

  const verifyDocument = async (documentId) => {
    try {
      await api.post(`/documents/${documentId}/verify`, {}, { headers });
      setSuccess('Document verified successfully!');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify document');
    }
  };

  const rejectDocument = async (documentId) => {
    try {
      await api.post(`/documents/${documentId}/reject`, {}, { headers });
      setSuccess('Document rejected!');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject document');
    }
  };

  if (loading) return <div><Navbar /><p className="text-center mt-5">Loading...</p></div>;

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h2>📄 Document Verification</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Tabs */}
        <ul className="nav nav-tabs" role="tablist">
          <li className="nav-item">
            <a className={`nav-link ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')} style={{ cursor: 'pointer' }}>
              ⏳ Pending ({pendingDocuments.length})
            </a>
          </li>
          <li className="nav-item">
            <a className={`nav-link ${activeTab === 'verified' ? 'active' : ''}`}
              onClick={() => setActiveTab('verified')} style={{ cursor: 'pointer' }}>
              ✓ Verified ({approvedDocuments.length})
            </a>
          </li>
        </ul>

        <div className="tab-content mt-4">
          {/* Pending Documents */}
          {activeTab === 'pending' && (
            <div>
              {pendingDocuments.length > 0 ? (
                <div className="documents-list">
                  {pendingDocuments.map(applicant => (
                    <div key={applicant.applicant_id} className="applicant-card">
                      <div className="card-header">
                        <div>
                          <h5>{applicant.applicant_name}</h5>
                          <small className="text-muted">App #: {applicant.application_number}</small>
                        </div>
                        <div className="badge-group">
                          <span className="badge badge-warning">{applicant.documents.length} Pending</span>
                          <button className="btn btn-sm btn-primary ms-2"
                            onClick={() => openApplicantDocs(applicant)}>
                            View & Verify
                          </button>
                        </div>
                      </div>
                      <div className="card-body">
                        <ul className="doc-list">
                          {applicant.documents.map(doc => (
                            <li key={doc.id}>
                              <span className="doc-type">{doc.document_type}</span>
                              <span className="badge badge-warning-light">Pending</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info">No pending documents</div>
              )}
            </div>
          )}

          {/* Verified Documents */}
          {activeTab === 'verified' && (
            <div>
              {approvedDocuments.length > 0 ? (
                <div className="documents-list">
                  {approvedDocuments.map(applicant => (
                    <div key={applicant.applicant_id} className="applicant-card verified">
                      <div className="card-header">
                        <div>
                          <h5>{applicant.applicant_name}</h5>
                          <small className="text-muted">App #: {applicant.application_number}</small>
                        </div>
                        <span className="badge badge-success">{applicant.documents.length} Verified</span>
                      </div>
                      <div className="card-body">
                        <ul className="doc-list">
                          {applicant.documents.map(doc => (
                            <li key={doc.id}>
                              <span className="doc-type">{doc.document_type}</span>
                              <span className="badge badge-success-light">✓ Verified</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info">No verified documents</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedApplicant && (
        <>
          <div className="modal-backdrop show"></div>
          <div className="modal d-block" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
            <div className="modal-dialog modal-lg" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    📄 Verify Documents - {selectedApplicant.applicant_name}
                  </h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Document Type</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applicantDocs.map(doc => (
                        <tr key={doc.id}>
                          <td>{doc.document_type}</td>
                          <td>
                            <span className="badge badge-warning">Pending</span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-success me-2"
                              onClick={() => verifyDocument(doc.id)}>
                              ✓ Verify
                            </button>
                            <button className="btn btn-sm btn-danger"
                              onClick={() => rejectDocument(doc.id)}>
                              ✗ Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default DocumentVerification;
