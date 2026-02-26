// src/pages/ApplicantForm.js

import { useState, useEffect } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import '../styles/Forms.css';

function ApplicantForm() {

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    category: 'GM',
    date_of_birth: '',
    gender: '',
    qualifying_exam: '',
    qualifying_marks: '',
    entry_type_id: '',
    admission_mode_id: '',
    program_id: ''
  });

  const [programs, setPrograms] = useState([]);
  const [entryTypes, setEntryTypes] = useState([]);
  const [admissionModes, setAdmissionModes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const headers = { Authorization: localStorage.getItem("token") };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [progRes, etRes, modeRes] = await Promise.all([
        api.get('/masters/programs', { headers }),
        api.get('/masters/entry-types', { headers }),
        api.get('/masters/admission-modes', { headers })
      ]);
      setPrograms(progRes.data);
      setEntryTypes(etRes.data);
      setAdmissionModes(modeRes.data);
    } catch (err) {
      setError('Failed to load data');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.first_name || !form.last_name || !form.email || !form.program_id) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/applicants', form, { headers });
      setSuccess(`Applicant created successfully! App #: ${res.data.application_number}`);
      setForm({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        category: 'GM',
        date_of_birth: '',
        gender: '',
        qualifying_exam: '',
        qualifying_marks: '',
        entry_type_id: '',
        admission_mode_id: '',
        program_id: ''
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create applicant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="form-section">
              <h2>👥 New Applicant Registration</h2>
              <p className="text-muted">Maximum 15 fields as per BRS</p>

              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <form onSubmit={handleSubmit}>
                {/* Row 1: Name */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label>First Name *</label>
                    <input type="text" name="first_name" className="form-control" required
                      value={form.first_name} onChange={handleChange} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Last Name *</label>
                    <input type="text" name="last_name" className="form-control" required
                      value={form.last_name} onChange={handleChange} />
                  </div>
                </div>

                {/* Row 2: Contact Info */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label>Email *</label>
                    <input type="email" name="email" className="form-control" required
                      value={form.email} onChange={handleChange} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Phone Number</label>
                    <input type="tel" name="phone_number" className="form-control" pattern="[0-9]{10}"
                    maxLength="10" value={form.phone_number} onChange={handleChange} />
                  </div>
                </div>

                {/* Row 3: Personal Details */}
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label>Date of Birth</label>
                    <input type="date" name="date_of_birth" className="form-control"
                      value={form.date_of_birth} onChange={handleChange} />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label>Gender</label>
                    <select name="gender" className="form-control" value={form.gender} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="O">Other</option>
                    </select>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label>Category</label>
                    <select name="category" className="form-control" value={form.category} onChange={handleChange}>
                      <option value="GM">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                    </select>
                  </div>
                </div>

                {/* Row 4: Academic Details */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label>Qualifying Exam</label>
                    <input type="text" name="qualifying_exam" className="form-control" placeholder="e.g., 12th Board, JEE"
                      value={form.qualifying_exam} onChange={handleChange} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Qualifying Marks</label>
                    <input type="number" name="qualifying_marks" className="form-control" step="0.01"
                      value={form.qualifying_marks} onChange={handleChange} />
                  </div>
                </div>

                {/* Row 5: Admission Details */}
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label>Program *</label>
                    <select name="program_id" className="form-control" required
                      value={form.program_id} onChange={handleChange}>
                      <option value="">Select Program</option>
                      {programs.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.branch_name})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label>Entry Type</label>
                    <select name="entry_type_id" className="form-control"
                      value={form.entry_type_id} onChange={handleChange}>
                      <option value="">Select Entry Type</option>
                      {entryTypes.map(et => (
                        <option key={et.id} value={et.id}>{et.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label>Admission Mode</label>
                    <select name="admission_mode_id" className="form-control"
                      value={form.admission_mode_id} onChange={handleChange}>
                      <option value="">Select Mode</option>
                      {admissionModes.map(am => (
                        <option key={am.id} value={am.id}>{am.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                    {loading ? 'Creating...' : 'Register Applicant'}
                  </button>
                </div>

                <p className="text-muted mt-3">
                  <small>* Required fields</small>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ApplicantForm;