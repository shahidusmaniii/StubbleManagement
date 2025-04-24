import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ServiceForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    mobileNo: '',
    acre: '',
    pType: 'Wheat',
    date1: '',
    du1: '',
    du2: '',
    type: 'Collection',
    mType: ['Manual']
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);

  const { email, mobileNo, acre, pType, date1, du1, du2, type, mType } = formData;

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const config = {
            headers: {
              'x-auth-token': token
            }
          };
          
          // Use the correct endpoint to fetch user data
          const res = await axios.get('/api/auth/me', config);
          if (res.data) {
            const user = res.data.user;
            setUserData(user);
            
            console.log('User data from service form:', user);
            
            // Auto-fill email and mobile number
            setFormData(prev => ({
              ...prev,
              email: user.email || '',
              mobileNo: user.mobileNo || ''
            }));
            
            // If user logged in via Google OAuth and has no mobile number, set a placeholder
            if (!user.mobileNo && user.provider === 'google') {
              console.log('Google OAuth user detected with no mobile number');
              setFormData(prev => ({
                ...prev,
                mobileNo: ''
              }));
            }
            
            console.log('User data loaded successfully:', user);
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, []);

  const onChange = (e) => {
    // Only allow changes to fields that are not auto-filled
    if (e.target.name !== 'email') {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // For mType field that needs to be an array for the API
      const serviceData = {
        ...formData,
        mType: Array.isArray(mType) ? mType : [mType]
      };

      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };

      const res = await axios.post('/api/services', serviceData, config);
      
      if (res.data.success) {
        setSuccess('Service request submitted successfully!');
        setFormData({
          email: userData?.email || '',
          mobileNo: userData?.mobileNo || '',
          acre: '',
          pType: 'Wheat',
          date1: '',
          du1: '',
          du2: '',
          type: 'Collection',
          mType: ['Manual']
        });
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to submit service request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1 className="text-primary mb-4">Request Stubble Service</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={email}
            onChange={onChange}
            required
            readOnly={true} // Always read-only to prevent edits
            className={userData?.email ? "form-control bg-light" : "form-control"}
          />
          {userData?.email && <small className="form-text text-muted">Auto-filled from your profile</small>}
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
            className={userData?.mobileNo ? "form-control" : "form-control"}
          />
          {userData?.mobileNo && <small className="form-text text-muted">You can edit this field if needed</small>}
        </div>
        
        <div className="form-group">
          <label>Area (in acres)</label>
          <input
            type="text"
            className="form-control"
            name="acre"
            value={acre}
            onChange={onChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Plant Type</label>
          <select
            className="form-control"
            name="pType"
            value={pType}
            onChange={onChange}
          >
            <option value="Wheat">Wheat</option>
            <option value="Rice">Rice</option>
            <option value="Sugarcane">Sugarcane</option>
            <option value="Corn">Corn</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Harvest Date</label>
          <input
            type="date"
            className="form-control"
            name="date1"
            value={date1}
            onChange={onChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Available From</label>
          <input
            type="date"
            className="form-control"
            name="du1"
            value={du1}
            onChange={onChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Available Until</label>
          <input
            type="date"
            className="form-control"
            name="du2"
            value={du2}
            onChange={onChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Service Type</label>
          <select
            className="form-control"
            name="type"
            value={type}
            onChange={onChange}
          >
            <option value="Collection">Collection</option>
            <option value="Processing">Processing</option>
            <option value="Harvesting">Harvesting</option>
            <option value="Both">Both Collection & Processing</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Collection Method</label>
          <select
            className="form-control"
            name="mType"
            value={mType}
            onChange={onChange}
          >
            <option value="Manual">Manual</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Combine">Combine</option>
          </select>
        </div>
        
        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
};

export default ServiceForm; 