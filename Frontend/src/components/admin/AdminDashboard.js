import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [services, setServices] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('services');
  const [createRoomModal, setCreateRoomModal] = useState(false);
  const [clearServiceModal, setClearServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [clearForm, setClearForm] = useState({
    tResidue: '',
    tGrain: '',
    sDate: new Date().toISOString().substring(0, 10) // Today's date in YYYY-MM-DD format
  });
  const [roomForm, setRoomForm] = useState({
    name: '',
    description: '',
    code: '',
    startBid: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            'x-auth-token': token
          }
        };
        
        // Get dashboard data from API
        const dashboardRes = await axios.get('/api/dashboard', config);
        
        if (dashboardRes.data) {
          setServices(dashboardRes.data.services || []);
          setRooms(dashboardRes.data.rooms || []);
        }
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const toggleCreateRoomModal = () => {
    setCreateRoomModal(!createRoomModal);
    if (!createRoomModal) {
      // Generate random code when opening modal
      const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      setRoomForm({
        ...roomForm,
        code: randomCode
      });
    }
  };

  const toggleClearServiceModal = (service = null) => {
    setClearServiceModal(!clearServiceModal);
    setSelectedService(service);
    
    if (service) {
      // Initialize with default values
      setClearForm({
        tResidue: '',
        tGrain: '',
        sDate: new Date().toISOString().substring(0, 10)
      });
    }
  };

  const handleCreateRoomChange = (e) => {
    setRoomForm({ ...roomForm, [e.target.name]: e.target.value });
  };

  const handleClearFormChange = (e) => {
    setClearForm({ ...clearForm, [e.target.name]: e.target.value });
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };

      const res = await axios.post('/api/rooms', roomForm, config);
      
      if (res.data && res.data.success) {
        // Add new room to the list
        setRooms([...rooms, res.data.room]);
        // Close modal and reset form
        setCreateRoomModal(false);
        setRoomForm({
          name: '',
          description: '',
          code: '',
          startBid: '',
          startDate: '',
          endDate: ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create auction room');
      console.error(err);
    }
  };

  const handleClearService = async (e) => {
    e.preventDefault();
    
    if (!selectedService) return;
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      };

      // Convert date string to ISO format for the API
      const data = {
        ...clearForm,
        sDate: new Date(clearForm.sDate).toISOString()
      };

      await axios.delete(`/api/services/${selectedService.email}`, { 
        headers: config.headers, 
        data 
      });
      
      // Remove the cleared service from the list
      setServices(services.filter(service => service._id !== selectedService._id));
      
      // Close the modal
      toggleClearServiceModal();
    } catch (err) {
      setError('Failed to clear service request');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div></div>;
  }

  return (
    <div>
      <h1 className="mb-4">Admin Dashboard</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="dashboard-stat bg-primary text-white">
            <h1>{services.length}</h1>
            <p>Service Requests</p>
          </div>
        </div>
        <div className="col-md-6">
          <div className="dashboard-stat bg-success text-white">
            <h1>{rooms.length}</h1>
            <p>Auction Rooms</p>
          </div>
        </div>
      </div>
      
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            Service Requests
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'rooms' ? 'active' : ''}`}
            onClick={() => setActiveTab('rooms')}
          >
            Auction Rooms
          </button>
        </li>
      </ul>
      
      {/* Service Requests Tab */}
      {activeTab === 'services' && (
        <div>
          <h2 className="mb-3">Service Requests</h2>
          
          {services.length === 0 ? (
            <div className="alert alert-info">No service requests found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Plant Type</th>
                    <th>Area (acres)</th>
                    <th>Service Type</th>
                    <th>Harvest Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service._id}>
                      <td>{service.email}</td>
                      <td>{service.pType}</td>
                      <td>{service.acre}</td>
                      <td>{service.type}</td>
                      <td>{formatDate(service.date1)}</td>
                      <td>
                        <button 
                          onClick={() => toggleClearServiceModal(service)}
                          className="btn btn-sm btn-success"
                        >
                          Mark Complete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* Auction Rooms Tab */}
      {activeTab === 'rooms' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>Auction Rooms</h2>
            <button 
              onClick={toggleCreateRoomModal} 
              className="btn btn-primary"
            >
              <i className="fas fa-plus mr-1"></i> Create Room
            </button>
          </div>
          
          {rooms.length === 0 ? (
            <div className="alert alert-info">No auction rooms found. Create one to get started!</div>
          ) : (
            <div className="row">
              {rooms.map((room) => (
                <div className="col-md-6 mb-4" key={room._id}>
                  <div className="card auction-container">
                    <div className="card-body">
                      <h4 className="card-title">{room.name}</h4>
                      <p className="card-text">
                        <strong>Description:</strong> {room.description}<br />
                        <strong>Room Code:</strong> {room.code}<br />
                        <strong>Starting Bid:</strong> ₹{room.startBid}/acre<br />
                        <strong>Start Date:</strong> {formatDate(room.startDate)}<br />
                        <strong>End Date:</strong> {formatDate(room.endDate)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Create Room Modal */}
      {createRoomModal && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Auction Room</h5>
                <button type="button" className="close" onClick={toggleCreateRoomModal}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleCreateRoom}>
                  <div className="form-group">
                    <label>Room Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={roomForm.name}
                      onChange={handleCreateRoomChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={roomForm.description}
                      onChange={handleCreateRoomChange}
                      required
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label>Room Code</label>
                    <input
                      type="text"
                      className="form-control"
                      name="code"
                      value={roomForm.code}
                      onChange={handleCreateRoomChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Starting Bid (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="startBid"
                      value={roomForm.startBid}
                      onChange={handleCreateRoomChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="startDate"
                      value={roomForm.startDate}
                      onChange={handleCreateRoomChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="endDate"
                      value={roomForm.endDate}
                      onChange={handleCreateRoomChange}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">Create Room</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Clear Service Modal */}
      {clearServiceModal && selectedService && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Complete Service Request</h5>
                <button type="button" className="close" onClick={() => toggleClearServiceModal()}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <h6>Service Request Details:</h6>
                  <p>
                    <strong>Farmer Email:</strong> {selectedService.email}<br />
                    <strong>Plant Type:</strong> {selectedService.pType}<br />
                    <strong>Area:</strong> {selectedService.acre} acres<br />
                    <strong>Service Type:</strong> {selectedService.type}
                  </p>
                </div>
                
                <form onSubmit={handleClearService}>
                  <div className="form-group">
                    <label>Total Residue Processed (tons)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="tResidue"
                      value={clearForm.tResidue}
                      onChange={handleClearFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Total Grain Yield (tons)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="tGrain"
                      value={clearForm.tGrain}
                      onChange={handleClearFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Completion Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="sDate"
                      value={clearForm.sDate}
                      onChange={handleClearFormChange}
                      required
                    />
                  </div>
                  <div className="alert alert-warning">
                    <strong>Note:</strong> This will mark the service request as completed and it will be visible to the farmer
                    in their dashboard. The request will be removed from the pending list.
                  </div>
                  <button type="submit" className="btn btn-success">Mark as Completed</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 