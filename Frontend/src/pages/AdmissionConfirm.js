import { useState, useEffect } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import '../styles/Forms.css';

export default function AdmissionConfirm() {
  const [admissions, setAdmissions] = useState([]);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('pending');

  const headers = { Authorization: localStorage.getItem("token") };

  useEffect(() => {
    loadAdmissions();
  }, [filter]);

  const loadAdmissions = async () => {
    try {
      setLoading(true);
      const endpoint = filter === 'pending' ? '/admissions/status/pending' : '/admissions/status/confirmed';
      const res = await api.get(endpoint, { headers });
      setAdmissions(res.data);
    } catch (err) {
      setError('Failed to load admissions');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (admissionId) => {
    setError('');
    setSuccess('');

    const admission = admissions.find(a => a.id === admissionId);
    if (!admission) return;

    if (admission.fee_status !== 'Paid') {
      setError('Fee must be paid before confirmation');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(`/admissions/confirm/${admissionId}`, {}, { headers });
      setSuccess(`Admission confirmed! Number: ${res.data.admission_number}`);
      loadAdmissions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to confirm admission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h2>✅ Admission Confirmation</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="mb-3">
          <button 
            className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('pending')}>
            Pending Confirmation ({admissions.filter(a => !a.confirmed).length})
          </button>
          <button 
            className={`btn ms-2 ${filter === 'confirmed' ? 'btn-success' : 'btn-outline-success'}`}
            onClick={() => setFilter('confirmed')}>
            Confirmed ({admissions.filter(a => a.confirmed).length})
          </button>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Applicant Name</th>
                  <th>Program</th>
                  <th>Email</th>
                  <th>Fee Status</th>
                  <th>Admission Number</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {admissions.map(admission => (
                  <tr key={admission.id}>
                    <td className="fw-bold">{admission.first_name} {admission.last_name}</td>
                    <td>{admission.program_name}</td>
                    <td>{admission.email}</td>
                    <td>
                      <span className={`badge ${admission.fee_status === 'Paid' ? 'bg-success' : 'bg-warning'}`}>
                        {admission.fee_status}
                      </span>
                    </td>
                    <td>
                      {admission.admission_number ? (
                        <code>{admission.admission_number}</code>
                      ) : (
                        <span className="text-muted">Pending</span>
                      )}
                    </td>
                    <td>
                      {!admission.admission_number ? (
                        <button 
                          className="btn btn-sm btn-success"
                          onClick={() => handleConfirm(admission.id)}
                          disabled={admission.fee_status !== 'Paid' || loading}>
                          Confirm
                        </button>
                      ) : (
                        <span className="badge bg-success">Confirmed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {admissions.length === 0 && (
              <div className="alert alert-info">
                No {filter} admissions found.
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}