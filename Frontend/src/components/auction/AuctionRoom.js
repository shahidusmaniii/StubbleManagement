import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

const AuctionRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bidSuccess, setBidSuccess] = useState('');
  const [socket, setSocket] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Get the current user ID when the component loads
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        // Try to get the token
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // Try to get user info from API
        const res = await axios.get('/api/auth/me', {
          headers: { 'x-auth-token': token }
        });
        
        if (res.data && res.data.user) {
          // Save the user ID for later comparison
          setCurrentUserId(res.data.user._id);
          console.log("Found user ID:", res.data.user._id);
          
          // Also store in localStorage for future reference
          localStorage.setItem('currentUserId', res.data.user._id);
        }
      } catch (err) {
        console.error("Error getting user info:", err);
      }
    };
    
    getUserInfo();
  }, []);
  
  // Function to check if a bid belongs to the current user
  const isCurrentUserBid = useCallback((bid) => {
    if (!bid || !currentUserId) return false;
    
    // Ensure both IDs are strings for comparison
    const bidUserId = String(bid.user);
    const myUserId = String(currentUserId);
    
    console.log(`Comparing bid user ID: ${bidUserId} with current user ID: ${myUserId}`);
    
    // Compare as strings to avoid type mismatches
    return bidUserId === myUserId;
  }, [currentUserId]);
  
  // Socket connection setup
  useEffect(() => {
    const newSocket = io('http://localhost:8001');
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      console.log("Socket connected:", newSocket.id);
      setSocketConnected(true);
      newSocket.emit('join room', { code: roomId });
    });
    
    newSocket.on('connect_error', (err) => {
      console.error("Socket connection error:", err);
      setError(`Socket connection error: ${err.message}`);
    });
    
    newSocket.on('startDetails', (roomData) => {
      setAuction(roomData);
      setLoading(false);
      
      if (roomData.startBid) {
        setBidAmount((parseInt(roomData.startBid) + 10).toString());
      }
    });
    
    newSocket.on('receive_bid', (bid) => {
      console.log("Received bid:", bid, "Current user:", currentUserId);
      setBids(prevBids => [bid, ...prevBids]);
      setAuction(prevAuction => ({
        ...prevAuction,
        currentBid: bid.bid
      }));
    });
    
    // Other socket event handlers...
    newSocket.on('curr_bid', (bidData) => {
      setAuction(prevAuction => ({
        ...prevAuction,
        currentBid: bidData.bid
      }));
    });
    
    newSocket.on('starting_bid', (startingBid) => {
      setAuction(prevAuction => ({
        ...prevAuction,
        startingBid: startingBid
      }));
    });
    
    newSocket.on('auction_ended', () => {
      setError('This auction has ended');
    });
    
    newSocket.on('room_error', (code) => {
      setError(`Room not found with code: ${code}`);
      setLoading(false);
    });
    
    newSocket.on('error_bid', (errorData) => {
      setError(errorData.message);
    });
    
    newSocket.on('auth_error', (errorData) => {
      setError(errorData.msg);
    });
    
    newSocket.on('bids', (bidsData) => {
      console.log("Received bid history:", bidsData);
      setBids(bidsData);
    });
    
    return () => {
      newSocket.disconnect();
    };
  }, [roomId, currentUserId]);
  
  // Format date functions
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const formatBidTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    try {
      const bidDate = new Date(timestamp);
      if (isNaN(bidDate.getTime())) return 'Just now';
      
      // If date is today, just show time
      const today = new Date();
      if (bidDate.toDateString() === today.toDateString()) {
        return bidDate.toLocaleTimeString();
      }
      
      // If date is older, show date and time
      return bidDate.toLocaleString();
    } catch (err) {
      console.error('Date formatting error:', err);
      return 'Just now';
    }
  };
  
  // Render a bid in the history
  const renderBidItem = useCallback((bid) => {
    // Check if this bid belongs to the current user
    const isMine = isCurrentUserBid(bid);
    
    // Use "You" for current user's bids, otherwise show the name
    const displayName = isMine ? "You" : (bid.userName || bid.user || 'Anonymous');
    
    return (
      <li key={bid._id || Math.random()} className={`list-group-item ${isMine ? 'bg-light' : ''}`}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <strong className={isMine ? 'text-primary' : ''}>{displayName}</strong> bid
            <span className="text-success ml-2">₹{bid.bid}</span>
          </div>
          <small className="text-muted">
            {formatBidTime(bid.createdAt)}
          </small>
        </div>
      </li>
    );
  }, [isCurrentUserBid]);
  
  // Handle placing a bid
  const handleBid = async (e) => {
    e.preventDefault();
    setBidSuccess('');
    setError('');
    
    // Validation checks...
    if (!bidAmount || isNaN(bidAmount) || parseInt(bidAmount) <= 0) {
      setError('Please enter a valid bid amount');
      return;
    }
    
    if (auction.currentBid && parseInt(bidAmount) <= parseInt(auction.currentBid)) {
      setError('Bid must be higher than the current bid');
      return;
    }
    
    if (!auction.currentBid && parseInt(bidAmount) <= parseInt(auction.startingBid)) {
      setError('Bid must be higher than the starting bid');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to place a bid');
        return;
      }
      
      // Get user info for the bid
      let userId = currentUserId;
      let userName = '';
      
      // Try to get user info from API if we don't have it
      try {
        const userRes = await axios.get('/api/auth/me', {
          headers: { 'x-auth-token': token }
        });
        
        if (userRes.data && userRes.data.user) {
          userId = userRes.data.user._id;
          userName = userRes.data.user.name || userRes.data.user.email.split('@')[0]; // Fallback to email username
          setCurrentUserId(userId);
          
          // Store current user info in localStorage for future reference
          localStorage.setItem('currentUserName', userName);
        }
      } catch (err) {
        console.error('Error getting user info:', err);
        // Try to get name from localStorage as fallback
        userName = localStorage.getItem('currentUserName') || 'Anonymous';
      }
      
      console.log("Placing bid with user ID:", userId, "and name:", userName);
      
      // Send bid through socket
      socket.emit('send_bid', {
        bid: parseInt(bidAmount),
        user: userId,
        userName: userName,
        code: roomId
      });
      
      setBidSuccess('Bid placed successfully!');
      
      // Increase bid amount for next bid
      setBidAmount((parseInt(bidAmount) + 10).toString());
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to place bid');
      console.error(err);
    }
  };
  
  // Rest of component (loading states, JSX, etc.)...
  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2">Connecting to auction room...</p>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>Auction Room Error</h4>
          <p>{error || "Auction not found or has ended."}</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary mt-3">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isAuctionEnded = new Date(auction.endDate) < new Date();

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{auction.title}</h1>
        <button onClick={() => navigate(-1)} className="btn btn-outline-secondary">
          Back
        </button>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {bidSuccess && <div className="alert alert-success">{bidSuccess}</div>}
      
      <div className="row">
        <div className="col-md-8">
          <div className="card auction-container mb-4">
            <div className="card-body">
              <h4 className="card-title">Auction Details</h4>
              {timeRemaining && (
                <div className="alert alert-info">
                  <strong>Time Remaining:</strong> {timeRemaining}
                </div>
              )}
              <p className="card-text">
                <strong>Description:</strong> {auction?.description || 'No description provided.'}<br />
                <strong>Company:</strong> {auction?.companyName}<br />
                <strong>Starting Bid:</strong> ₹{auction?.startingBid}/acre<br />
                <strong>Current Bid:</strong> ₹{auction?.currentBid || auction?.startingBid}/acre<br />
                <strong>End Date:</strong> {auction?.endDate ? formatDate(auction.endDate) : 'N/A'}<br />
                <strong>Status:</strong> {auction?.endDate && new Date(auction.endDate) < new Date() ? 'Ended' : 'Active'}<br />
                <strong>Participants:</strong> {auction?.participants || 0}
              </p>
              
              {!isAuctionEnded && (
                <div className="bid-section">
                  <h5>Place Your Bid</h5>
                  <form onSubmit={handleBid} className="d-flex">
                    <div className="input-group mr-2">
                      <div className="input-group-prepend">
                        <span className="input-group-text">₹</span>
                      </div>
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder="Bid amount"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        min={(auction.currentBid ? parseInt(auction.currentBid) + 1 : parseInt(auction.startingBid) + 1).toString()}
                        required
                      />
                      <div className="input-group-append">
                        <span className="input-group-text">/acre</span>
                      </div>
                    </div>
                    <button type="submit" className="btn btn-auction">
                      <i className="fas fa-gavel mr-1"></i> Place Bid
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Bid History</h5>
            </div>
            <div className="card-body p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {bids.length === 0 ? (
                <p className="text-center p-3">No bids yet. Be the first to bid!</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {bids.map(renderBidItem)}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionRoom; 