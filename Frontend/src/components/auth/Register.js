import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = ({ setUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNo: '',
    password: '',
    password2: '',
    userType: 'Farmer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { name, email, mobileNo, password, password2, userType } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== password2) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const registerData = {
        name,
        email,
        mobileNo,
        password,
        userType
      };

      const res = await axios.post('/api/auth/register', registerData);
      
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
      const errorMsg = err.response?.data?.errors?.[0]?.msg || 
                      err.response?.data?.msg || 
                      'Registration failed. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1 className="text-primary mb-4">Register</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={name}
            onChange={onChange}
            required
          />
        </div>
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
          <label>Mobile Number</label>
          <input
            type="text"
            className="form-control"
            name="mobileNo"
            value={mobileNo}
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
          <label>Confirm Password</label>
          <input
            type="password"
            className="form-control"
            name="password2"
            value={password2}
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
            onChange={onChange}
          >
            <option value="Farmer">Farmer</option>
            <option value="Company">Company</option>
          </select>
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Register'}
        </button>
      </form>
      <p className="mt-3">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register; 