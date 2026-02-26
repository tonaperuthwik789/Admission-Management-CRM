// src/pages/Dashboard.js

import { useEffect, useState } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import '../styles/Dashboard.css';

function Dashboard() {
  const [data, setData] = useState({});
  const [programs, setPrograms] = useState([]);
  const [pendingDocs, setPendingDocs] = useState([]);
  const [pendingFees, setPendingFees] = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: localStorage.getItem("token") };
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashRes, progRes, docsRes, feesRes] = await Promise.all([
        api.get('/dashboard', { headers }),
        api.get('/dashboard/programs', { headers }),
        api.get('/dashboard/pending-docs', { headers }).catch(() => ({ data: [] })),
        api.get('/dashboard/pending-fees', { headers }).catch(() => ({ data: [] }))
      ]);
      setData(dashRes.data);
      setPrograms(progRes.data);
      setPendingDocs(docsRes.data.slice(0, 5));
      setPendingFees(feesRes.data.slice(0, 5));
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mt-4 text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container-fluid mt-4">
        <h1>📊 Dashboard</h1>
        <p className="text-muted">Role: <strong>{userRole}</strong></p>

        {/* Key Metrics */}
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <h5 className="card-title">Total Intake</h5>
                <h2 className="mb-0">{data.totalIntake || 0}</h2>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card bg-success text-white">
              <div className="card-body">
                <h5 className="card-title">Filled Seats</h5>
                <h2 className="mb-0">{data.filledSeats || 0}</h2>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card bg-info text-white">
              <div className="card-body">
                <h5 className="card-title">Remaining</h5>
                <h2 className="mb-0">{data.remaining || 0}</h2>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card bg-warning text-dark">
              <div className="card-body">
                <h5 className="card-title">Confirmed</h5>
                <h2 className="mb-0">{data.confirmedAdmissions || 0}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Items */}
        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <div className="card border-warning">
              <div className="card-header bg-warning">
                <h5 className="mb-0">📋 Pending Documents: {data.pendingDocs || 0}</h5>
              </div>
              <div className="card-body">
                {pendingDocs.length === 0 ? (
                  <p className="text-muted">All documents verified</p>
                ) : (
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Applicant</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingDocs.map(doc => (
                        <tr key={doc.id}>
                          <td>{doc.first_name} {doc.last_name}</td>
                          <td><span className="badge bg-warning">{doc.document_status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6 mb-3">
            <div className="card border-danger">
              <div className="card-header bg-danger text-white">
                <h5 className="mb-0">💰 Pending Fees: {data.feePending || 0}</h5>
              </div>
              <div className="card-body">
                {pendingFees.length === 0 ? (
                  <p className="text-muted">All fees collected</p>
                ) : (
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Applicant</th>
                        <th>Program</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingFees.map(fee => (
                        <tr key={fee.id}>
                          <td>{fee.first_name} {fee.last_name}</td>
                          <td><small>{fee.program_name}</small></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Program-wise Summary */}
        {(userRole === 'MANAGEMENT' || userRole === 'ADMIN') && (
          <div className="row">
            <div className="col-12 mb-4">
              <div className="card">
                <div className="card-header bg-dark text-white">
                  <h5 className="mb-0">📚 Program-wise Summary</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Program</th>
                          <th>Branch</th>
                          <th>Type</th>
                          <th>Total Intake</th>
                          <th>Filled</th>
                          <th>Remaining</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {programs.map(prog => {
                          const percentage = prog.intake > 0 ? (prog.filled_seats / prog.intake * 100).toFixed(0) : 0;
                          return (
                            <tr key={prog.id}>
                              <td className="fw-bold">{prog.program_name}</td>
                              <td>{prog.branch_name || '-'}</td>
                              <td><span className="badge bg-secondary">{prog.course_type}</span></td>
                              <td>{prog.intake}</td>
                              <td>{prog.filled_seats}</td>
                              <td>{prog.remaining_seats}</td>
                              <td>
                                <div className="progress" style={{ width: '100px', height: '20px' }}>
                                  <div 
                                    className={`progress-bar ${percentage >= 100 ? 'bg-danger' : percentage >= 80 ? 'bg-warning' : 'bg-success'}`}
                                    role="progressbar" 
                                    style={{ width: `${Math.min(percentage, 100)}%` }}>
                                    {percentage}%
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Dashboard;