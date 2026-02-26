// src/components/Navbar.js

import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import '../styles/Navbar.css';

function Navbar() {

  const role = localStorage.getItem("role");
  const navigate = useNavigate();
  const [setupOpen, setSetupOpen] = useState(false);
  const [admissionsOpen, setAdmissionsOpen] = useState(false);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleSetupClick = () => {
    setSetupOpen(!setupOpen);
    setAdmissionsOpen(false); // Close admissions menu
  };

  const handleAdmissionsClick = () => {
    setAdmissionsOpen(!admissionsOpen);
    setSetupOpen(false); // Close setup menu
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <span className="navbar-brand">📚 Admission Management System</span>
          <ul className="nav-menu">
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">
                <span className="nav-icon">📊</span> Dashboard
              </Link>
            </li>

            {(role === 'ADMIN' || role === 'OFFICER') && (
              <>
                <li className="nav-item dropdown-wrapper">
                  <button 
                    className="nav-link dropdown-toggle"
                    onClick={handleSetupClick}
                  >
                    <span className="nav-icon">⚙️</span> Setup
                  </button>
                  {setupOpen && (
                    <ul className="dropdown-menu">
                      {role === 'ADMIN' && (
                        <>
                          <li style={{listStyle: 'none'}}><Link className="dropdown-item" to="/program-setup" onClick={() => setSetupOpen(false)}>Program Setup</Link></li>
                          <li style={{listStyle: 'none'}}><Link className="dropdown-item" to="/quota-setup" onClick={() => setSetupOpen(false)}>Quota Setup</Link></li>
                        </>
                      )}
                    </ul>
                  )}
                </li>
              </>
            )}

            {(role === 'OFFICER' || role === 'ADMIN') && (
              <>
                <li className="nav-item dropdown-wrapper">
                  <button 
                    className="nav-link dropdown-toggle"
                    onClick={handleAdmissionsClick}
                  >
                    <span className="nav-icon">👥</span> Admissions
                  </button>
                  {admissionsOpen && (
                    <ul className="dropdown-menu">
                      <li style={{listStyle: 'none'}}><Link className="dropdown-item" to="/applicant-form" onClick={() => setAdmissionsOpen(false)}>New Applicant</Link></li>
                      <li style={{listStyle: 'none'}}><Link className="dropdown-item" to="/seat-allocation" onClick={() => setAdmissionsOpen(false)}>Seat Allocation</Link></li>
                      <li style={{listStyle: 'none'}}><Link className="dropdown-item" to="/admission-confirm" onClick={() => setAdmissionsOpen(false)}>Confirm Admission</Link></li>
                      <li style={{listStyle: 'none'}}><Link className="dropdown-item" to="/fee-update" onClick={() => setAdmissionsOpen(false)}>Fee Status</Link></li>
                      <li style={{listStyle: 'none'}}><Link className="dropdown-item" to="/document-upload" onClick={() => setAdmissionsOpen(false)}>📤 Upload Documents</Link></li>
                      <li style={{listStyle: 'none'}}><Link className="dropdown-item" to="/document-verification" onClick={() => setAdmissionsOpen(false)}>📄 Verify Documents</Link></li>
                    </ul>
                  )}
                </li>
              </>
            )}
          </ul>
        </div>

        <div className="navbar-right">
          <span className="user-role">{role}</span>
          <button className="btn-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;