import { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Login.css';

function Login({setUser}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', {email, password});
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      console.log('Login successful, role:',res.data.role);
      setUser(res.data.role);
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.message 
        || err.response?.data 
        || err.message 
        || 'Login failed. Please check your credentials.';
      console.error('Login error:', errorMsg);
      setError(errorMsg);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Admission Management System</h1>
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input 
              id="email"
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input 
              id="password"
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="login-btn">Login</button>
        </form>
        <div className="register-section">
          <p>Don't have an account?</p>
          <Link to="/register" className="register-link">Create a new account</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;