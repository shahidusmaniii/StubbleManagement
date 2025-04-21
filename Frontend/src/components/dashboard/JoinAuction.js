import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const JoinAuction = ({ onRoomJoined }) => {
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!roomCode) {
      setError('Please enter a room code');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('/api/rooms/join', { code: roomCode });
      
      setSuccess('Successfully joined auction room!');
      
      // Call the callback if provided
      if (typeof onRoomJoined === 'function') {
        onRoomJoined();
      }
      
      // Navigate to the auction room after a brief delay
      setTimeout(() => {
        navigate(`/auction/${roomCode}`);
      }, 1500);
    } catch (err) {
      console.error('Join room error:', err);
      setError(err.response?.data?.msg || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">Join Auction Room</h5>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <p>Enter the auction room code to join an agricultural residue auction.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label htmlFor="roomCode">Room Code</label>
            <input 
              type="text" 
              className="form-control" 
              id="roomCode"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter room code (e.g. ABC123)"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
          >
            {loading ? 'Joining...' : 'Join Auction'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinAuction; 