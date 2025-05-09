import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [services, setServices] = useState([]);
  const [completedServices, setCompletedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('No token found, redirecting to login');
          setError('You must be logged in to view this page');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }
        
        setDebugInfo('Fetching dashboard data...');
        
        const config = {
          headers: {
            'x-auth-token': token
          }
        };
        
        // Get current user info
        const userRes = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/auth/me`, config);
        console.log('User info response:', userRes.data);
        console.log('User type:', userRes.data.user.type, 'User object:', userRes.data.user);
        setUserInfo(userRes.data);
        
        // Get farmer's active service requests
        setDebugInfo('Fetching services...');
        const servicesRes = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/services/me`, config);
        console.log('Services response:', servicesRes.data);
        setServices(servicesRes.data || []);
        
        // Get farmer's completed service requests
        setDebugInfo('Fetching completed services...');
        const completedRes = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/services/completed`, config);
        console.log('Completed services response:', completedRes.data);
        setCompletedServices(completedRes.data || []);
        
        setDebugInfo('Dashboard data loaded successfully');
      } catch (err) {
        console.error('Dashboard error:', err);
        
        // Check for authentication errors
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          setError('Authentication error. Please log in again.');
          // Clear token and redirect to login
          localStorage.removeItem('token');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError(`Failed to load dashboard data: ${err.message}`);
          setDebugInfo(`Error status: ${err.response?.status || 'Unknown'}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (err) {
      console.error('Date formatting error:', err);
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2">{debugInfo || 'Loading dashboard...'}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4">{userInfo?.userType || 'User'} Dashboard</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {debugInfo && <div className="alert alert-info">{debugInfo}</div>}
      
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="dashboard-stat bg-primary text-white">
            <h1>{services.length}</h1>
            <p>Active Service Requests</p>
          </div>
        </div>
        <div className="col-md-6">
          <div className="dashboard-stat bg-success text-white">
            <h1>{completedServices.length}</h1>
            <p>Completed Services</p>
          </div>
        </div>
      </div>
      
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <h2>My Service Requests</h2>
        <button 
          onClick={() => {
            console.log('New Request button clicked, navigating to /service');
            navigate('/service');
          }} 
          className="btn btn-primary"
        >
          <i className="fas fa-plus mr-1"></i> New Request
        </button>
      </div>
      
      {services.length === 0 ? (
        <div className="alert alert-info">
          You haven't created any service requests yet. Create one to get started!
        </div>
      ) : (
        <div className="row">
          {services.map((service) => (
            <div className="col-md-6 mb-4" key={service._id || Math.random().toString()}>
              <div className="card service-card">
                <div className="card-body">
                  <h4 className="card-title">{service.pType} Stubble - {service.acre} Acres</h4>
                  <p className="card-text">
                    <strong>Service Type:</strong> {service.type}<br />
                    <strong>Collection Method:</strong> {service.mType}<br />
                    <strong>Harvest Date:</strong> {formatDate(service.date1)}<br />
                    <strong>Available:</strong> {formatDate(service.du1)} to {formatDate(service.du2)}
                  </p>
                  <div className="d-flex justify-content-between mt-3">
                    <span className="badge badge-primary p-2">Pending</span>
                    <button className="btn btn-sm btn-outline-danger">
                      <i className="fas fa-trash mr-1"></i> Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <h2 className="mt-5 mb-4">Completed Services</h2>
      
      {completedServices.length === 0 ? (
        <div className="alert alert-info">
          You don't have any completed service requests yet.
        </div>
      ) : (
        <div className="row">
          {completedServices.map((service) => (
            <div className="col-md-6 mb-4" key={service._id || Math.random().toString()}>
              <div className="card service-card completed-service">
                <div className="card-body">
                  <h4 className="card-title">Completed Service</h4>
                  <p className="card-text">
                    <strong>Total Residue Processed:</strong> {service.tResidue} tons<br />
                    <strong>Total Grain Yield:</strong> {service.tGrain} tons<br />
                    <strong>Completion Date:</strong> {formatDate(service.sDate)}<br />
                  </p>
                  <div className="d-flex justify-content-between mt-3">
                    <span className="badge badge-success p-2">Completed</span>
                    <span className="text-muted">Service ID: {service._id?.substring(0, 8) || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard; 