import { useState, useEffect } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import '../styles/MasterSetup.css';

function ProgramSetup() {
  const [tabType, setTabType] = useState('institution');
  const [formData, setFormData] = useState({});
  const [institutions, setInstitutions] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const headers = { Authorization: localStorage.getItem("token") };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [insRes, ayRes, progRes] = await Promise.all([
        api.get('/masters/institutions', { headers }),
        api.get('/masters/academic-years', { headers }),
        api.get('/masters/programs', { headers })
      ]);
      setInstitutions(insRes.data);
      setAcademicYears(ayRes.data);
      setPrograms(progRes.data);
    } catch (err) {
      setError('Failed to load data');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      setLoading(true);
      await api.post(`/masters/${tabType === 'program' ? 'program' : tabType}`, formData, { headers });
      setSuccess(`${tabType} created successfully!`);
      setFormData({});
      loadInitialData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create');
    } finally {
      setLoading(false);
    }
  };

  const loadCampuses = async (instId) => {
    try {
      const res = await api.get(`/masters/campuses/${instId}`, { headers });
      setCampuses(res.data);
    } catch (err) {
      console.error('Failed to load campuses');
    }
  };

  const loadDepartments = async (campusId) => {
    try {
      const res = await api.get(`/masters/departments/${campusId}`, { headers });
      setDepartments(res.data);
    } catch (err) {
      console.error('Failed to load departments');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h2>📚 Program & Master Setup</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <ul className="nav nav-tabs" role="tablist">
          <li className="nav-item">
            <a className={`nav-link ${tabType === 'institution' ? 'active' : ''}`}
              onClick={() => setTabType('institution')} style={{ cursor: 'pointer' }}>
              🏢 Institution
            </a>
          </li>
          <li className="nav-item">
            <a className={`nav-link ${tabType === 'campus' ? 'active' : ''}`}
              onClick={() => setTabType('campus')} style={{ cursor: 'pointer' }}>
              🏫 Campus
            </a>
          </li>
          <li className="nav-item">
            <a className={`nav-link ${tabType === 'department' ? 'active' : ''}`}
              onClick={() => setTabType('department')} style={{ cursor: 'pointer' }}>
              📖 Department
            </a>
          </li>
          <li className="nav-item">
            <a className={`nav-link ${tabType === 'academic-year' ? 'active' : ''}`}
              onClick={() => setTabType('academic-year')} style={{ cursor: 'pointer' }}>
              📅 Academic Year
            </a>
          </li>
          <li className="nav-item">
            <a className={`nav-link ${tabType === 'program' ? 'active' : ''}`}
              onClick={() => setTabType('program')} style={{ cursor: 'pointer' }}>
              🎓 Program
            </a>
          </li>
        </ul>

        <div className="tab-content mt-4">
          {/* Institution */}
          {tabType === 'institution' && (
            <div className="form-section">
              <h4>Create Institution</h4>
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label>Name *</label>
                    <input type="text" name="name" className="form-control" required
                      value={formData.name || ''} onChange={handleFormChange} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Code</label>
                    <input type="text" name="code" className="form-control"
                      value={formData.code || ''} onChange={handleFormChange} />
                  </div>
                </div>
                <div className="mb-3">
                  <label>Address</label>
                  <input type="text" name="address" className="form-control"
                    value={formData.address || ''} onChange={handleFormChange} />
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label>City</label>
                    <input type="text" name="city" className="form-control"
                      value={formData.city || ''} onChange={handleFormChange} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>State</label>
                    <input type="text" name="state" className="form-control"
                      value={formData.state || ''} onChange={handleFormChange} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  Create Institution
                </button>
              </form>

              <div className="mt-4">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Code</th>
                      <th>City</th>
                    </tr>
                  </thead>
                  <tbody>
                    {institutions.map(i => (
                      <tr key={i.id}>
                        <td>{i.name}</td>
                        <td>{i.code}</td>
                        <td>{i.city}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Campus */}
          {tabType === 'campus' && (
            <div className="form-section">
              <h4>Create Campus</h4>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label>Institution *</label>
                  <select className="form-control" name="institution_id" required
                    value={formData.institution_id || ''} onChange={(e) => { handleFormChange(e); loadCampuses(e.target.value); }}>
                    <option value="">Select Institution</option>
                    {institutions.map(i => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                  </select>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label>Campus Name *</label>
                    <input type="text" name="name" className="form-control" required
                      value={formData.name || ''} onChange={handleFormChange} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Code</label>
                    <input type="text" name="code" className="form-control"
                      value={formData.code || ''} onChange={handleFormChange} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  Create Campus
                </button>
              </form>
            </div>
          )}

          {/* Department */}
          {tabType === 'department' && (
            <div className="form-section">
              <h4>Create Department</h4>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label>Institution *</label>
                  <select className="form-control" name="institution_id" required
                    value={formData.institution_id || ''} onChange={(e) => { handleFormChange(e); loadCampuses(e.target.value); setFormData({ ...formData, institution_id: e.target.value, campus_id: '' }); }}>
                    <option value="">Select Institution</option>
                    {institutions.map(i => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label>Campus *</label>
                  <select className="form-control" name="campus_id" required
                    value={formData.campus_id || ''} onChange={(e) => { handleFormChange(e); loadDepartments(e.target.value); }}>
                    <option value="">Select Campus</option>
                    {campuses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label>Department Name *</label>
                    <input type="text" name="name" className="form-control" required
                      value={formData.name || ''} onChange={handleFormChange} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Code</label>
                    <input type="text" name="code" className="form-control"
                      value={formData.code || ''} onChange={handleFormChange} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  Create Department
                </button>
              </form>
            </div>
          )}

          {/* Academic Year */}
          {tabType === 'academic-year' && (
            <div className="form-section">
              <h4>Create Academic Year</h4>
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label>Year (e.g., 2025-26) *</label>
                    <input type="text" name="year" className="form-control" required placeholder="2025-26"
                      value={formData.year || ''} onChange={handleFormChange} />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label>Start Date</label>
                    <input type="date" name="start_date" className="form-control"
                      value={formData.start_date || ''} onChange={handleFormChange} />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label>End Date</label>
                    <input type="date" name="end_date" className="form-control"
                      value={formData.end_date || ''} onChange={handleFormChange} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  Create Academic Year
                </button>
              </form>

              <div className="mt-4">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Period</th>
                    </tr>
                  </thead>
                  <tbody>
                    {academicYears.map(ay => (
                      <tr key={ay.id}>
                        <td>{ay.year}</td>
                        <td>{ay.start_date} to {ay.end_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Program */}
          {tabType === 'program' && (
            <div className="form-section">
              <h4>Create Program</h4>
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label>Institution *</label>
                    <select className="form-control" name="institution_id" required
                      value={formData.institution_id || ''} onChange={(e) => { handleFormChange(e); loadCampuses(e.target.value); setFormData({ ...formData, institution_id: e.target.value, campus_id: '', department_id: '' }); }}>
                      <option value="">Select Institution</option>
                      {institutions.map(i => (
                        <option key={i.id} value={i.id}>{i.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Campus *</label>
                    <select className="form-control" name="campus_id" required
                      value={formData.campus_id || ''} onChange={(e) => { handleFormChange(e); loadDepartments(e.target.value); setFormData({ ...formData, campus_id: e.target.value, department_id: '' }); }}>
                      <option value="">Select Campus</option>
                      {campuses.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label>Program Name *</label>
                    <input type="text" name="name" className="form-control" required
                      value={formData.name || ''} onChange={handleFormChange} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Branch Name</label>
                    <input type="text" name="branch_name" className="form-control"
                      value={formData.branch_name || ''} onChange={handleFormChange} />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label>Department *</label>
                    <select className="form-control" name="department_id" required
                      value={formData.department_id || ''} onChange={handleFormChange}>
                      <option value="">Select Department</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label>Academic Year *</label>
                    <select className="form-control" name="academic_year_id" required
                      value={formData.academic_year_id || ''} onChange={handleFormChange}>
                      <option value="">Select Year</option>
                      {academicYears.map(ay => (
                        <option key={ay.id} value={ay.id}>{ay.year}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label>Intake *</label>
                    <input type="number" name="intake" className="form-control" required
                      value={formData.intake || ''} onChange={handleFormChange} />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label>Course Type *</label>
                    <select className="form-control" name="course_type_id" required
                      value={formData.course_type_id || ''} onChange={handleFormChange}>
                      <option value="">Select Type</option>
                      <option value="1">Under Graduate</option>
                      <option value="2">Post Graduate</option>
                    </select>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label>Entry Type *</label>
                    <select className="form-control" name="entry_type_id" required
                      value={formData.entry_type_id || ''} onChange={handleFormChange}>
                      <option value="">Select Entry Type</option>
                      <option value="1">Regular</option>
                      <option value="2">Lateral</option>
                    </select>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label>Code</label>
                    <input type="text" name="code" className="form-control"
                      value={formData.code || ''} onChange={handleFormChange} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  Create Program
                </button>
              </form>

              <div className="mt-4">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Branch</th>
                      <th>Intake</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programs.map(p => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>{p.branch_name}</td>
                        <td>{p.intake}</td>
                        <td>{p.course_type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ProgramSetup;