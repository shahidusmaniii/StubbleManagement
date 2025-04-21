const io = require('socket.io-client');

// Connect to the auction server
const socket = io('http://localhost:8001');
const roomCode = 'M8UBUA';

// Listen for connection events
socket.on('connect', () => {
  console.log('Connected to server, socket ID:', socket.id);
  
  // Join the auction room
  socket.emit('join room', { code: roomCode });
  console.log('Requested to join room:', roomCode);
});

// Listen for room join confirmation
socket.on('startDetails', (roomData) => {
  console.log('Successfully joined room. Room details:', roomData);
});

// Listen for bid events
socket.on('receive_bid', (bid) => {
  console.log('New bid received:', bid);
});

socket.on('curr_bid', (bid) => {
  console.log('Current highest bid:', bid);
});

socket.on('starting_bid', (startingBid) => {
  console.log('Starting bid:', startingBid);
});

socket.on('auction_ended', () => {
  console.log('Auction has ended');
});

// Listen for errors
socket.on('room_error', (code) => {
  console.error('Room error for code:', code);
});

socket.on('error_bid', (errorData) => {
  console.error('Bid error:', errorData);
});

socket.on('auth_error', (errorData) => {
  console.error('Auth error:', errorData);
});

// Place a bid after 3 seconds
setTimeout(() => {
  const bidData = {
    bid: 550,
    user: 'TestUser123',
    code: roomCode
  };
  
  console.log('Placing bid:', bidData);
  socket.emit('send_bid', bidData);
}, 3000);

// Disconnect after 10 seconds
setTimeout(() => {
  console.log('Disconnecting...');
  socket.disconnect();
  process.exit(0);
}, 10000); 