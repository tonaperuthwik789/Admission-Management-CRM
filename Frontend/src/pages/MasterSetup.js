import { useState, useEffect } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import '../styles/MasterSetup.css';

function MasterSetup() {
  const [activeTab, setActiveTab] = useState('institution');
  const [formData, setFormData] = useState({});
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const headers = { Authorization: localStorage.getItem("token") };

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [ins, aca, prog, ay] = await Promise.all([
        api.get('/masters/institutions', { headers }),
        api.get('/masters/academic-years', { headers }),
        api.get('/masters/programs', { headers }),
        api.get('/masters/academic-years', { headers })
      ]);
      setData({
        institutions: ins.data,
        academicYears: aca.data,
        programs: prog.data
      });
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e, endpoint) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      setLoading(true);
      await api.post(`/masters/${endpoint}`, formData, { headers });
      setSuccess(`${activeTab} created successfully!`);
      setFormData({});
      loadAllData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h2>Master Setup</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <ul className="nav nav-tabs" role="tablist">
          <li className="nav-item">
            <a className={`nav-link ${activeTab === 'institution' ? 'active' : ''}`}
              onClick={() => setActiveTab('institution')}>Institution</a>
          </li>
          <li className="nav-item">
            <a className={`nav-link ${activeTab === 'campus' ? 'active' : ''}`}
              onClick={() => setActiveTab('campus')}>Campus</a>
          </li>
          <li className="nav-item">
            <a className={`nav-link ${activeTab === 'department' ? 'active' : ''}`}
              onClick={() => setActiveTab('department')}>Department</a>
          </li>
          <li className="nav-item">
            <a className={`nav-link ${activeTab === 'academic-year' ? 'active' : ''}`}
              onClick={() => setActiveTab('academic-year')}>Academic Year</a>
          </li>
          <li className="nav-item">
            <a className={`nav-link ${activeTab === 'program' ? 'active' : ''}`}
              onClick={() => setActiveTab('program')}>Program</a>
          </li>
        </ul>

        <div className="tab-content mt-4">
          {/* Institution Tab */}
          {activeTab === 'institution' && (
            <div className="form-section">
              <h4>Create Institution</h4>
              <form onSubmit={(e) => handleSubmit(e, 'institution')}>
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
                  {loading ? 'Creating...' : 'Create Institution'}
                </button>
              </form>

              <div className="mt-4">
                <h5>Existing Institutions</h5>
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Code</th>
                        <th>City</th>
                        <th>State</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.institutions?.map(inst => (
                        <tr key={inst.id}>
                          <td>{inst.name}</td>
                          <td>{inst.code}</td>
                          <td>{inst.city}</td>
                          <td>{inst.state}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Academic Year Tab */}
          {activeTab === 'academic-year' && (
            <div className="form-section">
              <h4>Create Academic Year</h4>
              <form onSubmit={(e) => handleSubmit(e, 'academic-year')}>
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
                  {loading ? 'Creating...' : 'Create Academic Year'}
                </button>
              </form>

              <div className="mt-4">
                <h5>Existing Academic Years</h5>
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Year</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.academicYears?.map(ay => (
                        <tr key={ay.id}>
                          <td>{ay.year}</td>
                          <td>{ay.start_date}</td>
                          <td>{ay.end_date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Program Tab */}
          {activeTab === 'program' && (
            <div className="form-section">
              <h4>Create Program</h4>
              <form onSubmit={(e) => handleSubmit(e, 'program')}>
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
                    <label>Intake *</label>
                    <input type="number" name="intake" className="form-control" required
                      value={formData.intake || ''} onChange={handleFormChange} />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label>Code</label>
                    <input type="text" name="code" className="form-control"
                      value={formData.code || ''} onChange={handleFormChange} />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label>Duration (years)</label>
                    <input type="number" name="duration" className="form-control"
                      value={formData.duration || ''} onChange={handleFormChange} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Program'}
                </button>
              </form>

              <div className="mt-4">
                <h5>Existing Programs</h5>
                <div className="table-responsive">
                  <table className="table table-striped table-sm">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Branch</th>
                        <th>Intake</th>
                        <th>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.programs?.map(prog => (
                        <tr key={prog.id}>
                          <td>{prog.name}</td>
                          <td>{prog.branch_name}</td>
                          <td>{prog.intake}</td>
                          <td>{prog.course_type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MasterSetup;
