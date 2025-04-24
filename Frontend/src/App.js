import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

// Components
import Navbar from './components/layout/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import VerifyEmail from './components/auth/VerifyEmail';
import Dashboard from './components/dashboard/Dashboard';
import Home from './components/Home';
import AuctionRoom from './components/auction/AuctionRoom';
import ServiceForm from './components/services/ServiceForm';
import AdminDashboard from './components/admin/AdminDashboard';
import CompanyDashboard from './components/company/CompanyDashboard';
import Footer from './components/layout/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Set default axios settings
axios.defaults.baseURL = 'http://localhost:8000';

// Add a response interceptor for global error handling
axios.interceptors.response.use(
  response => response,
  error => {
    // Handle authentication errors globally
    if (error.response && error.response.status === 401) {
      console.log('Authentication error detected, clearing token');
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['x-auth-token'];
      // We'll let the component handle the redirect
    }
    return Promise.reject(error);
  }
);

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      // Check for token in localStorage
      if (localStorage.token) {
        try {
          // Set axios auth header
          axios.defaults.headers.common['x-auth-token'] = localStorage.token;
          
          // Decode token for basic user info
          const decoded = jwtDecode(localStorage.token);
          
          // Additionally verify with backend
          try {
            const res = await axios.get('/api/auth/me');
            console.log('User verification response:', res.data);
            setUser(res.data.user);
            setAuthError(null);
          } catch (err) {
            console.error('Error verifying token with backend:', err);
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['x-auth-token'];
            setAuthError('Session expired. Please log in again.');
          }
        } catch (err) {
          console.error('Token decode error:', err);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['x-auth-token'];
          setAuthError('Invalid authentication token. Please log in again.');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    delete axios.defaults.headers.common['x-auth-token'];
  };

  // Auth route component
  const PrivateRoute = ({ children, userType }) => {
    if (loading) {
      return (
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2">Verifying authentication...</p>
        </div>
      );
    }
    
    if (!user) {
      return <Navigate to="/login" />;
    }
    
    console.log('PrivateRoute check - User type:', user.type, 'Required type:', userType);
    
    // For /service route, allow access if user type is null, undefined, or matches 'Farmer'
    if (userType === 'Farmer' && (!user.type || user.type === 'Farmer')) {
      return children;
    }
    
    // For other routes, maintain strict type checking
    if (userType && user.type !== userType) {
      return <Navigate to="/" />;
    }
    
    return children;
  };

  return (
    <Router>
      <div className="App">
        <Navbar user={user} logout={logout} />
        <div className="container py-4">
          {authError && (
            <div className="alert alert-danger">{authError}</div>
          )}
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register setUser={setUser} />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  {user?.type === 'Admin' ? (
                    <AdminDashboard user={user} />
                  ) : user?.type === 'Company' ? (
                    <CompanyDashboard user={user} />
                  ) : (
                    <Dashboard />
                  )}
                </PrivateRoute>
              }
            />
            
            <Route
              path="/auction/:roomId"
              element={
                <PrivateRoute>
                  <AuctionRoom />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/service"
              element={
                <PrivateRoute userType="Farmer">
                  <ServiceForm />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
