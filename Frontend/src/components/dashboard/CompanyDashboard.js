import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import JoinAuction from './JoinAuction';

const CompanyDashboard = ({ user }) => {
  const [joinedRooms, setJoinedRooms] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAvailable, setShowAvailable] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get joined rooms
      const joinedRes = await axios.get('/api/rooms');
      setJoinedRooms(joinedRes.data.rooms || []);
      
      // Get available rooms
      const availableRes = await axios.get('/api/rooms/available');
      setAvailableRooms(availableRes.data.availableRooms || []);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handler for when a room is joined successfully
  const handleRoomJoined = () => {
    fetchData(); // Refresh the data
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">Company Dashboard</h1>
      <p className="lead">Welcome, {user?.name || 'Company Owner'}</p>
      
      <div className="row">
        <div className="col-md-8">
          {/* Joined Rooms Section */}
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">My Auction Rooms</h5>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              
              {joinedRooms.length === 0 ? (
                <div className="alert alert-info">
                  <p>You haven't joined any active auction rooms yet.</p>
                  <p>Use the form on the right to join an auction by entering a room code.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Starting Bid</th>
                        <th>End Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {joinedRooms.map(room => (
                        <tr key={room._id}>
                          <td>{room.name}</td>
                          <td>₹{room.startBid}/acre</td>
                          <td>{formatDate(room.endDate)}</td>
                          <td>
                            <Link 
                              to={`/auction/${room.code}`} 
                              className="btn btn-sm btn-primary"
                            >
                              Enter Room
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              <button 
                className="btn btn-outline-primary mt-3" 
                onClick={fetchData}
                disabled={loading}
              >
                <i className="fas fa-sync-alt mr-1"></i> 
                {loading ? 'Refreshing...' : 'Refresh List'}
              </button>
            </div>
          </div>
          
          {/* Available Rooms Toggle */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Available Auction Rooms</h5>
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setShowAvailable(!showAvailable)}
            >
              {showAvailable ? 'Hide' : 'Show'} Available Rooms
            </button>
          </div>
          
          {/* Available Rooms Section */}
          {showAvailable && (
            <div className="card mb-4">
              <div className="card-body">
                {availableRooms.length === 0 ? (
                  <div className="alert alert-info">
                    No additional auction rooms are available to join at this time.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Starting Bid</th>
                          <th>End Date</th>
                          <th>Join</th>
                        </tr>
                      </thead>
                      <tbody>
                        {availableRooms.map(room => (
                          <tr key={room._id}>
                            <td>{room.name}</td>
                            <td>₹{room.startBid}/acre</td>
                            <td>{formatDate(room.endDate)}</td>
                            <td>
                              <Link 
                                to="#"
                                className="btn btn-sm btn-outline-success"
                                onClick={() => {
                                  navigator.clipboard.writeText(room.code);
                                  alert(`Room code ${room.code} copied to clipboard. Please paste it in the Join Room form.`);
                                }}
                              >
                                Copy Code
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="col-md-4">
          <JoinAuction onRoomJoined={handleRoomJoined} />
          
          <div className="card">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">Auction Information</h5>
            </div>
            <div className="card-body">
              <p>As a company, you can participate in auctions to purchase agricultural residue.</p>
              <p>To join an auction:</p>
              <ol>
                <li>Enter the auction room code provided by the admin</li>
                <li>Place bids on available lots</li>
                <li>If you win, you'll be notified and can proceed with the purchase</li>
              </ol>
              <p><strong>Note:</strong> All bids are binding and cannot be retracted once placed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard; 