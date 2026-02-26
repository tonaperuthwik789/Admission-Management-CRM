import { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Login.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'OFFICER'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const res = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message 
        || err.response?.data 
        || err.message 
        || 'Registration failed. Please try again.';
      setError(errorMsg);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Admission Management System</h1>
        <h2>Create Account</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="name">Full Name:</label>
            <input 
              id="name"
              type="text" 
              name="name"
              value={formData.name} 
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input 
              id="email"
              type="email" 
              name="email"
              value={formData.email} 
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role:</label>
            <select 
              id="role"
              name="role"
              value={formData.role} 
              onChange={handleChange}
              required
            >
              <option value="OFFICER">Admission Officer</option>
              <option value="ADMIN">Admin</option>
              <option value="MANAGEMENT">Management</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input 
              id="password"
              type="password" 
              name="password"
              value={formData.password} 
              onChange={handleChange}
              placeholder="Enter password (min 6 characters)"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input 
              id="confirmPassword"
              type="password" 
              name="confirmPassword"
              value={formData.confirmPassword} 
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          <button type="submit" className="login-btn">Register</button>
        </form>

        <div className="register-section">
          <p>Already have an account?</p>
          <Link to="/" className="register-link">Login here</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
