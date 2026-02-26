import { useState, useEffect } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import '../styles/Forms.css';

export default function SeatAllocation() {
  const [formData, setFormData] = useState({
    applicant_id: '',
    program_id: '',
    quota_id: '',
    allotment_number: ''
  });

  const [applicants, setApplicants] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [quotas, setQuotas] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const headers = { Authorization: localStorage.getItem("token") };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [appRes, progRes] = await Promise.all([
        api.get('/applicants', { headers }),
        api.get('/masters/programs', { headers })
      ]);
      setApplicants(appRes.data);
      setPrograms(progRes.data);
    } catch (err) {
      setError('Failed to load data');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleApplicantChange = async (applicantId) => {
    setFormData({ ...formData, applicant_id: applicantId });

    const applicant = applicants.find(a => a.id === parseInt(applicantId));
    setSelectedApplicant(applicant);

    if (applicant?.program_id) {
      setFormData(prev => ({ ...prev, program_id: applicant.program_id }));
      loadQuotasForProgram(applicant.program_id);
    }
  };

  const loadQuotasForProgram = async (programId) => {
    try {
      const res = await api.get(`/masters/quotas/${programId}`, { headers });
      setQuotas(res.data);
    } catch (err) {
      console.error('Failed to load quotas');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.applicant_id || !formData.program_id || !formData.quota_id) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      await api.post('/admissions/allocate', {
        applicant_id: parseInt(formData.applicant_id),
        program_id: parseInt(formData.program_id),
        quota_id: parseInt(formData.quota_id),
        allotment_number: formData.allotment_number
      }, { headers });
      setSuccess('Seat allocated successfully!');
      setFormData({
        applicant_id: '',
        program_id: '',
        quota_id: '',
        allotment_number: ''
      });
      setSelectedApplicant(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to allocate seat');
    } finally {
      setLoading(false);
    }
  };

  const getQuotaInfo = (quotaId) => quotas.find(q => q.id === parseInt(quotaId));
  const getProgram = (progId) => programs.find(p => p.id === progId);

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <div className="row">
          <div className="col-lg-8">
            <div className="form-section">
              <h2>🪑 Seat Allocation</h2>

              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label>Select Applicant *</label>
                  <select className="form-control" name="applicant_id" required
                    value={formData.applicant_id} onChange={(e) => handleApplicantChange(e.target.value)}>
                    <option value="">Choose Applicant</option>
                    {applicants.map(app => (
                      <option key={app.id} value={app.id}>
                        {app.first_name} {app.last_name} ({app.application_number})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedApplicant && (
                  <div className="alert alert-info">
                    <strong>Applicant Details:</strong><br/>
                    Email: {selectedApplicant.email}<br/>
                    Program: {selectedApplicant.program_name}<br/>
                    Category: {selectedApplicant.category}
                  </div>
                )}

                <div className="mb-3">
                  <label>Program *</label>
                  <select className="form-control" name="program_id" required
                    value={formData.program_id} onChange={(e) => { handleFormChange(e); loadQuotasForProgram(e.target.value); }}>
                    <option value="">Select Program</option>
                    {programs.map(prog => (
                      <option key={prog.id} value={prog.id}>
                        {prog.name} - {prog.branch_name} (Intake: {prog.intake})
                      </option>
                    ))}
                  </select>
                </div>

                {formData.program_id && getProgram(parseInt(formData.program_id)) && (
                  <div className="alert alert-warning">
                    <strong>Program Info:</strong><br/>
                    Total Intake: {getProgram(parseInt(formData.program_id)).intake}<br/>
                    Available Quotas: {quotas.length}
                  </div>
                )}

                <div className="mb-3">
                  <label>Select Quota *</label>
                  <select className="form-control" name="quota_id" required
                    value={formData.quota_id} onChange={handleFormChange}>
                    <option value="">Choose Quota</option>
                    {quotas.map(q => (
                      <option key={q.id} value={q.id} disabled={q.available_seats <= 0}>
                        {q.quota_name} ({q.mode_name}) - Available: {q.available_seats}/{q.total_seats}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.quota_id && getQuotaInfo(parseInt(formData.quota_id)) && (
                  <div className="alert alert-success">
                    <strong>Quota Status:</strong><br/>
                    Mode: {getQuotaInfo(parseInt(formData.quota_id)).mode_name}<br/>
                    Quota: {getQuotaInfo(parseInt(formData.quota_id)).quota_name}<br/>
                    Available Seats: {getQuotaInfo(parseInt(formData.quota_id)).available_seats}/{getQuotaInfo(parseInt(formData.quota_id)).total_seats}
                  </div>
                )}

                <div className="mb-3">
                  <label>Allotment Number (Optional)</label>
                  <input type="text" name="allotment_number" className="form-control"
                    placeholder="e.g., KCET-2026-1234"
                    value={formData.allotment_number} onChange={handleFormChange} />
                </div>

                <button type="submit" className="btn btn-primary btn-lg w-100" disabled={loading || (formData.quota_id && getQuotaInfo(parseInt(formData.quota_id))?.available_seats <= 0)}>
                  {loading ? 'Allocating...' : 'Allocate Seat'}
                </button>
              </form>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="form-section">
              <h4>📋 Quota Summary</h4>
              {quotas.length === 0 ? (
                <p className="text-muted">Select a program to see quotas</p>
              ) : (
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Quota</th>
                      <th>Available</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotas.map(q => (
                      <tr key={q.id} className={q.available_seats > 0 ? '' : 'table-danger'}>
                        <td>{q.quota_name}</td>
                        <td>
                          <span className={q.available_seats > 0 ? 'badge bg-success' : 'badge bg-danger'}>
                            {q.available_seats}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}