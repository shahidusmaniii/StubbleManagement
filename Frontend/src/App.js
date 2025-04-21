import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

// Components
import Navbar from './components/layout/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
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

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token in localStorage
    if (localStorage.token) {
      try {
        const decoded = jwtDecode(localStorage.token);
        setUser(decoded.user);
        
        // Set axios auth header
        axios.defaults.headers.common['x-auth-token'] = localStorage.token;
      } catch (err) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    delete axios.defaults.headers.common['x-auth-token'];
  };

  // Auth route component
  const PrivateRoute = ({ children, userType }) => {
    if (loading) return <div>Loading...</div>;
    
    if (!user) {
      return <Navigate to="/login" />;
    }
    
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
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register setUser={setUser} />} />
            
            <Route path="/dashboard" element={
              <PrivateRoute>
                {user?.type === 'Farmer' ? <Dashboard /> : 
                 user?.type === 'Company' ? <CompanyDashboard /> : 
                 user?.type === 'Admin' ? <AdminDashboard /> : <Home />}
              </PrivateRoute>
            } />
            
            <Route path="/service" element={
              <PrivateRoute userType="Farmer">
                <ServiceForm />
              </PrivateRoute>
            } />
            
            <Route path="/auction/:roomId" element={
              <PrivateRoute>
                <AuctionRoom />
              </PrivateRoute>
            } />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
