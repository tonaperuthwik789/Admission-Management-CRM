import { useState, useEffect } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import '../styles/Forms.css';

export default function FeeUpdate() {
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [feeStatus, setFeeStatus] = useState('Pending');

  const headers = { Authorization: localStorage.getItem("token") };

  useEffect(() => {
    loadApplicants();
  }, [feeStatus]);

  const loadApplicants = async () => {
    try {
      setLoading(true);
      const res = await api.get('/applicants', { headers });
      const filtered = feeStatus === 'Pending' 
        ? res.data.filter(a => a.fee_status === 'Pending')
        : res.data.filter(a => a.fee_status === 'Paid');
      setApplicants(filtered);
    } catch (err) {
      setError('Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (applicantId) => {
    setError('');
    setSuccess('');

    try {
      setLoading(true);
      await api.put(`/applicants/${applicantId}/fee`, 
        { fee_status: 'Paid' },
        { headers }
      );
      setSuccess('Fee marked as paid!');
      loadApplicants();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update fee status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h2>💳 Fee Management</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="mb-3">
          <button 
            className={`btn ${feeStatus === 'Pending' ? 'btn-warning' : 'btn-outline-warning'}`}
            onClick={() => setFeeStatus('Pending')}>
            Pending Payment ({applicants.length})
          </button>
          <button 
            className={`btn ms-2 ${feeStatus === 'Paid' ? 'btn-success' : 'btn-outline-success'}`}
            onClick={() => setFeeStatus('Paid')}>
            Fee Paid ({applicants.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row">
            {applicants.length === 0 ? (
              <div className="col-12">
                <div className="alert alert-info">
                  No applicants with {feeStatus} fee status.
                </div>
              </div>
            ) : (
              applicants.map(applicant => (
                <div className="col-md-6 col-lg-4 mb-3" key={applicant.id}>
                  <div className={`card ${applicant.fee_status === 'Paid' ? 'border-success' : 'border-warning'}`}>
                    <div className="card-body">
                      <h5 className="card-title">{applicant.first_name} {applicant.last_name}</h5>
                      <p className="card-text">
                        <small>
                          <strong>Email:</strong> {applicant.email}<br/>
                          <strong>Phone:</strong> {applicant.phone_number || 'N/A'}<br/>
                          <strong>Program:</strong> {applicant.program_name}<br/>
                          <strong>App #:</strong> {applicant.application_number}
                        </small>
                      </p>
                      <div className="mb-2">
                        <span className={`badge ${applicant.fee_status === 'Paid' ? 'bg-success' : 'bg-warning'}`}>
                          {applicant.fee_status}
                        </span>
                      </div>
                      {applicant.fee_status === 'Pending' && (
                        <button 
                          className="btn btn-sm btn-success w-100"
                          onClick={() => handleMarkPaid(applicant.id)}
                          disabled={loading}>
                          Mark as Paid
                        </button>
                      )}
                      {applicant.fee_status === 'Paid' && (
                        <div className="alert alert-success mb-0 py-2">
                          <small>✓ Fee Paid</small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}