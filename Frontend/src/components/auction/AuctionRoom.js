import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5001');
    setSocket(newSocket);

    // Join auction room
    newSocket.emit('joinRoom', { roomId });

    // Listen for new bids
    newSocket.on('newBid', (bid) => {
      setBids((prevBids) => [bid, ...prevBids]);
      setAuction((prevAuction) => ({
        ...prevAuction,
        currentBid: bid.amount
      }));
    });

    // Clean up on component unmount
    return () => {
      newSocket.emit('leaveRoom', { roomId });
      newSocket.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    const fetchAuctionData = async () => {
      try {
        // Get auction details
        const auctionRes = await axios.get(`/api/auctions/${roomId}`);
        
        // Get auction bids
        const bidsRes = await axios.get(`/api/auctions/${roomId}/bids`);
        
        setAuction(auctionRes.data);
        setBids(bidsRes.data);
        
        // Set initial bid amount slightly higher than current bid
        if (auctionRes.data.currentBid) {
          setBidAmount((parseInt(auctionRes.data.currentBid) + 10).toString());
        } else {
          setBidAmount((parseInt(auctionRes.data.startingBid) + 10).toString());
        }
      } catch (err) {
        setError('Failed to load auction data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctionData();
  }, [roomId]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleBid = async (e) => {
    e.preventDefault();
    setBidSuccess('');
    setError('');

    // Validate bid amount
    if (!bidAmount || isNaN(bidAmount) || parseInt(bidAmount) <= 0) {
      setError('Please enter a valid bid amount');
      return;
    }

    // Check if bid is higher than current bid
    if (auction.currentBid && parseInt(bidAmount) <= parseInt(auction.currentBid)) {
      setError('Bid must be higher than the current bid');
      return;
    }

    // Check if bid is higher than starting bid
    if (!auction.currentBid && parseInt(bidAmount) <= parseInt(auction.startingBid)) {
      setError('Bid must be higher than the starting bid');
      return;
    }

    try {
      const res = await axios.post(`/api/auctions/${roomId}/bid`, { amount: bidAmount });
      
      // Emit bid to socket
      socket.emit('placeBid', {
        roomId,
        bid: res.data
      });

      setBidSuccess('Bid placed successfully!');
      
      // Update UI
      setBids([res.data, ...bids]);
      setAuction({
        ...auction,
        currentBid: bidAmount
      });
      
      // Increase bid amount for next bid
      setBidAmount((parseInt(bidAmount) + 10).toString());
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to place bid');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div></div>;
  }

  if (!auction) {
    return <div className="alert alert-danger">Auction not found or has ended.</div>;
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
              <p className="card-text">
                <strong>Description:</strong> {auction.description || 'No description provided.'}<br />
                <strong>Company:</strong> {auction.companyName}<br />
                <strong>Starting Bid:</strong> ₹{auction.startingBid}/acre<br />
                <strong>Current Bid:</strong> ₹{auction.currentBid || auction.startingBid}/acre<br />
                <strong>End Date:</strong> {formatDate(auction.endDate)}<br />
                <strong>Status:</strong> {isAuctionEnded ? 'Ended' : 'Active'}<br />
                <strong>Participants:</strong> {auction.participants || 0}
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
                  {bids.map((bid, index) => (
                    <li key={index} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{bid.userName}</strong> bid
                          <span className="text-success ml-2">₹{bid.amount}</span>
                        </div>
                        <small className="text-muted">
                          {formatDate(bid.createdAt)}
                        </small>
                      </div>
                    </li>
                  ))}
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