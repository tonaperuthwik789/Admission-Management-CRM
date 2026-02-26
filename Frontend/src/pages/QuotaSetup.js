import { useState, useEffect } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import '../styles/MasterSetup.css';

function QuotaSetup() {
  const [formData, setFormData] = useState({});
  const [programs, setPrograms] = useState([]);
  const [admissionModes, setAdmissionModes] = useState([]);
  const [quotas, setQuotas] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const headers = { Authorization: localStorage.getItem("token") };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [progRes, modeRes] = await Promise.all([
        api.get('/masters/programs', { headers }),
        api.get('/masters/admission-modes', { headers })
      ]);
      setPrograms(progRes.data);
      setAdmissionModes(modeRes.data);
    } catch (err) {
      setError('Failed to load data');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProgramChange = async (programId) => {
    setFormData({ ...formData, program_id: programId });
    setSelectedProgram(programId);

    if (programId) {
      try {
        const res = await api.get(`/masters/quotas/${programId}`, { headers });
        setQuotas(res.data);
      } catch (err) {
        console.error('Failed to load quotas');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.program_id || !formData.admission_mode_id || !formData.quota_name || !formData.total_seats) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      await api.post('/masters/quota', formData, { headers });
      setSuccess('Quota created successfully!');
      setFormData({});
      handleProgramChange(selectedProgram);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create quota');
    } finally {
      setLoading(false);
    }
  };

  const getProgram = (id) => programs.find(p => p.id === id);

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h2>⚙️ Quota & Seat Configuration</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="row">
          <div className="col-lg-6">
            <div className="form-section">
              <h4>Create Quota</h4>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label>Program *</label>
                  <select className="form-control" required
                    value={formData.program_id || ''} 
                    onChange={(e) => handleProgramChange(e.target.value)}>
                    <option value="">Select Program</option>
                    {programs.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} - {p.branch_name} (Intake: {p.intake})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedProgram && getProgram(selectedProgram) && (
                  <div className="alert alert-info">
                    <strong>Program Details:</strong><br/>
                    Total Intake: {getProgram(selectedProgram)?.intake}<br/>
                    Allocated: {quotas.reduce((sum, q) => sum + q.total_seats, 0)}<br/>
                    Remaining: {getProgram(selectedProgram)?.intake - quotas.reduce((sum, q) => sum + q.total_seats, 0)}
                  </div>
                )}

                <div className="mb-3">
                  <label>Admission Mode *</label>
                  <select className="form-control" name="admission_mode_id" required
                    value={formData.admission_mode_id || ''} onChange={handleFormChange}>
                    <option value="">Select Mode</option>
                    {admissionModes.map(mode => (
                      <option key={mode.id} value={mode.id}>{mode.name}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label>Quota Name *</label>
                  <input type="text" name="quota_name" className="form-control" required
                    placeholder="e.g., KCET, COMEDK, Management"
                    value={formData.quota_name || ''} onChange={handleFormChange} />
                </div>

                <div className="mb-3">
                  <label>Total Seats *</label>
                  <input type="number" name="total_seats" className="form-control" required
                    min="1"
                    value={formData.total_seats || ''} onChange={handleFormChange} />
                </div>

                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Quota'}
                </button>
              </form>
            </div>
          </div>

          <div className="col-lg-6">
            {selectedProgram && (
              <div className="form-section">
                <h4>Current Quotas for {getProgram(selectedProgram)?.name}</h4>
                {quotas.length === 0 ? (
                  <p className="text-muted">No quotas configured yet</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Mode</th>
                          <th>Quota</th>
                          <th>Total</th>
                          <th>Filled</th>
                          <th>Available</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quotas.map(q => (
                          <tr key={q.id}>
                            <td>{q.mode_name}</td>
                            <td>{q.quota_name}</td>
                            <td>{q.total_seats}</td>
                            <td>
                              <span className="badge bg-success">{q.filled_seats}</span>
                            </td>
                            <td>
                              <span className={`badge ${q.available_seats > 0 ? 'bg-info' : 'bg-danger'}`}>
                                {q.available_seats}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* All Programs Overview */}
        <div className="mt-5">
          <h4>📊 All Programs Overview</h4>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Program</th>
                  <th>Branch</th>
                  <th>Type</th>
                  <th>Total Intake</th>
                  <th>Allocated</th>
                  <th>Remaining</th>
                  <th>Quotas</th>
                </tr>
              </thead>
              <tbody>
                {programs.map(p => {
                  const progQuotas = p.id ? quotas.filter(q => q.program_id === p.id) : [];
                  const allocated = progQuotas.reduce((sum, q) => sum + q.total_seats, 0);
                  return (
                    <tr key={p.id}>
                      <td><strong>{p.name}</strong></td>
                      <td>{p.branch_name}</td>
                      <td>{p.course_type}</td>
                      <td>{p.intake}</td>
                      <td>{allocated}</td>
                      <td>
                        <span className={p.intake - allocated === 0 ? 'text-danger fw-bold' : ''}>
                          {p.intake - allocated}
                        </span>
                      </td>
                      <td>{progQuotas.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default QuotaSetup;