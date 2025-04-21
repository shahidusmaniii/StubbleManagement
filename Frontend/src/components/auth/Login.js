import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'Farmer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  const { email, password, userType } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Auto-fill admin credentials when Admin type is selected
  const handleUserTypeChange = (e) => {
    const selectedType = e.target.value;
    
    if (selectedType === 'Admin') {
      setFormData({
        ...formData,
        userType: selectedType,
        email: 'admin@example.com',
        password: 'admin123'
      });
    } else {
      setFormData({
        ...formData,
        userType: selectedType
      });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDebugInfo('');

    try {
      // For debugging
      setDebugInfo(`Attempting to log in with: ${email} as ${userType}`);
      
      // Make sure we're sending to the correct endpoint
      const res = await axios.post('/api/auth/login', formData);
      
      if (res.data && res.data.token) {
        // Set token to localStorage
        localStorage.setItem('token', res.data.token);
        
        // Set auth header
        axios.defaults.headers.common['x-auth-token'] = res.data.token;
        
        // Set user state
        setUser(res.data.user);
        
        // Redirect to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Enhanced error message with more details
      const errorMessage = err.response?.data?.msg || 'Login failed. Please try again.';
      const statusCode = err.response?.status || 'Unknown';
      
      setError(`${errorMessage} (Status: ${statusCode})`);
      
      // Show more debug info
      setDebugInfo(`Request failed. Check console for details.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1 className="text-primary mb-4">Login</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {debugInfo && <div className="alert alert-info">{debugInfo}</div>}
      
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={email}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            name="password"
            value={password}
            onChange={onChange}
            required
            minLength="6"
          />
        </div>
        <div className="form-group">
          <label>User Type</label>
          <select
            className="form-control"
            name="userType"
            value={userType}
            onChange={handleUserTypeChange}
          >
            <option value="Farmer">Farmer</option>
            <option value="Company">Company</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
      <p className="mt-3">
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login; 