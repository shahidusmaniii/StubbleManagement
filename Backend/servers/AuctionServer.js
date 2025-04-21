const express = require('express');
const app = express();
const http = require('http');
const AuctionServer = http.createServer(app);
const { Server } = require('socket.io');
const AuctionModel = require('../models/Auction');
const RoomModel = require('../models/AuctionRoom');
const connectDB = require('../config/db');
const cookieParser = require('cookie-parser');

connectDB();
app.use(cookieParser());
app.use(express.json());

const io = new Server(AuctionServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

const auctionTimers = {};

io.on('connection', (socket) => {
    console.log("A user is Connected", socket.id);

    socket.on("join room", async (data) => {
        console.log("Join room request received:", data);
        
        if (!data || !data.code) {
            console.log("Invalid join room request: missing room code");
            socket.emit("room_error", "Missing room code");
            return;
        }
        
        console.log("Room code is ", data.code);
        let room = await RoomModel.findOne({ code: data.code });
        
        if (room) {
            console.log("Room found, details:", {
                name: room.name,
                code: room.code,
                startDate: room.startDate,
                endDate: room.endDate
            });
            
            console.log("Joined Successfully");
            socket.join(data.code); 
            socket.emit("startDetails", room);

            const endTime = new Date(room.endDate).getTime();
            const currentTime = new Date().getTime();

            if (currentTime >= endTime) {
                console.log("Auction already ended for room:", data.code);
                socket.emit("auction_ended");
            } else {
                const timeLeft = endTime - currentTime;
                console.log(`Auction time remaining for room ${data.code}: ${Math.floor(timeLeft/1000/60)} minutes`);
                
                if (auctionTimers[data.code]) {
                    clearTimeout(auctionTimers[data.code]);
                }
                auctionTimers[data.code] = setTimeout(() => {
                    console.log(`Auction timer ended for room ${data.code}`);
                    io.to(data.code).emit("auction_ended");
                    endAuction(data.code);
                }, timeLeft);
            }

            let startingBid = await AuctionModel.findOne({ room: data.code });
            console.log("Starting bid:", startingBid ? startingBid.bid : 0);
            socket.emit("starting_bid", startingBid ? startingBid.bid : 0);

            let latestBid = await AuctionModel.findOne({ room: data.code }).sort({ _id: -1 });
            if (latestBid) {
                console.log("Latest bid:", latestBid);
                socket.emit("curr_bid", latestBid);
            }

            // Get recent bids with proper sorting and include timestamp
            let recentBids = await AuctionModel.find({ room: data.code })
                .sort({ createdAt: -1 })
                .limit(10);
                
            console.log("Recent bids:", recentBids.length);
            socket.emit("bids", recentBids);
        } else {
            console.log("Room not found with code:", data.code);
            socket.emit("room_error", data.code);
        }
    });

    socket.on('send_bid', async (data) => {
        console.log("Received bid request:", {
            user: data.user,
            userName: data.userName,
            bid: data.bid,
            room: data.code
        });
        
        if (!data.user) {
            socket.emit("auth_error", { msg: "You must be logged in to place a bid" });
            return;
        }

        // Verify room exists
        let room = await RoomModel.findOne({ code: data.code });
        if (!room) {
            socket.emit("error_bid", { message: "Auction room not found" });
            return;
        }

        // Check if auction is still active
        if (new Date() >= new Date(room.endDate)) {
            socket.emit("error_bid", { message: "This auction has ended" });
            return;
        }

        // Validate bid amount
        if (!data.bid || isNaN(data.bid) || data.bid <= 0) {
            socket.emit("error_bid", { message: "Invalid bid amount" });
            return;
        }

        // Get latest bid for comparison
        let latestBid = await AuctionModel.findOne({ room: data.code }).sort({ _id: -1 });
        
        // Ensure bid is higher than current highest bid
        if (latestBid && latestBid.bid >= data.bid) {
            socket.emit("error_bid", { message: `Your bid must be higher than the current bid of ₹${latestBid.bid}` });
            return;
        }

        try {
            // Make sure we have a valid username
            const displayName = data.userName || 'Anonymous';
            
            // Store the exact user ID string
            const userId = String(data.user);

            console.log(`Creating new bid with userId '${userId}' (type: ${typeof userId}), displayName: ${displayName}`);

            // Create new bid record in database
            let newBid = await AuctionModel.create({ 
                bid: data.bid,
                user: userId,
                userName: displayName,
                room: data.code
            });
            
            console.log("New bid created in DB:", {
                id: newBid._id,
                user: newBid.user,
                userName: newBid.userName,
                bid: newBid.bid
            });

            // Broadcast bid to all users in the room
            io.to(data.code).emit('receive_bid', newBid);
            
            // Update current highest bid
            io.to(data.code).emit("curr_bid", newBid);
            
            console.log(`New bid: ₹${data.bid} by ${displayName} (${userId}) in room ${data.code}`);
        } catch (error) {
            console.error("Database error:", error);
            socket.emit("error_bid", { message: "Server error occurred while placing bid" });
        }
    });

    socket.on('disconnect', () => {
        console.log("User disconnected", socket.id);
    });
});

// Add a new endpoint to get room info
app.get('/api/rooms/join', async (req, res) => {
    try {
        const { code } = req.query;
        
        if (!code) {
            return res.status(400).json({ success: false, msg: 'Room code is required' });
        }
        
        console.log("REST API: Get room info for code:", code);
        const room = await RoomModel.findOne({ code });
        
        if (!room) {
            return res.status(404).json({ success: false, msg: 'Room not found' });
        }
        
        return res.json({
            success: true,
            room
        });
    } catch (err) {
        console.error("Error getting room:", err);
        res.status(500).json({ success: false, msg: 'Server error' });
    }
});

// Better auction end function with cleanup
function endAuction(roomCode) {
    console.log(`Ending auction for room ${roomCode}`);
    
    if (auctionTimers[roomCode]) {
        clearTimeout(auctionTimers[roomCode]);
        delete auctionTimers[roomCode];
        console.log(`Cleared timer for room ${roomCode}`);
    }
    
    // Get highest bid
    AuctionModel.findOne({ room: roomCode }).sort({ bid: -1 }).limit(1)
        .then(highestBid => {
            if (highestBid) {
                console.log(`Auction ended. Winner: ${highestBid.userName || highestBid.user}, Amount: ${highestBid.bid}`);
                // Notify all users about the winner
                io.to(roomCode).emit('auction_winner', {
                    user: highestBid.user,
                    userName: highestBid.userName || 'Anonymous',
                    bid: highestBid.bid
                });
            } else {
                console.log(`Auction ended with no bids for room ${roomCode}`);
                io.to(roomCode).emit('auction_ended', { message: 'Auction ended with no bids' });
            }
        })
        .catch(err => {
            console.error(`Error finding highest bid for room ${roomCode}:`, err);
            io.to(roomCode).emit('auction_error', { message: 'Error determining auction winner' });
        });
}

// Testing routes to help debug auction issues
app.get('/api/test/rooms', async (req, res) => {
    try {
        const rooms = await RoomModel.find();
        res.json({
            success: true,
            count: rooms.length,
            rooms: rooms.map(room => ({
                id: room._id,
                name: room.name,
                code: room.code,
                startDate: room.startDate,
                endDate: room.endDate,
                startBid: room.startBid
            }))
        });
    } catch (err) {
        console.error("Error fetching test rooms:", err);
        res.status(500).json({ success: false, msg: 'Server error' });
    }
});

app.post('/api/test/rooms', async (req, res) => {
    try {
        // Generate a random code if not provided
        const code = req.body.code || Math.random().toString(36).substring(2, 8).toUpperCase();
        
        const newRoom = await RoomModel.create({
            name: req.body.name || 'Test Auction Room',
            code: code,
            description: req.body.description || 'This is a test auction room',
            startBid: req.body.startBid || 100,
            startDate: req.body.startDate || new Date(),
            endDate: req.body.endDate || new Date(Date.now() + 3600000) // 1 hour from now
        });
        
        // Create initial bid with proper name
        await AuctionModel.create({
            bid: newRoom.startBid,
            user: "Admin",
            userName: "Admin (System)",
            room: newRoom.code
        });
        
        res.status(201).json({
            success: true,
            msg: 'Test room created successfully',
            room: newRoom
        });
    } catch (err) {
        console.error("Error creating test room:", err);
        res.status(500).json({ success: false, msg: 'Server error: ' + err.message });
    }
});

app.get('/api/test/bids/:roomCode', async (req, res) => {
    try {
        const bids = await AuctionModel.find({ room: req.params.roomCode }).sort({ _id: -1 });
        res.json({
            success: true,
            count: bids.length,
            bids
        });
    } catch (err) {
        console.error("Error fetching bids:", err);
        res.status(500).json({ success: false, msg: 'Server error' });
    }
});

// module.exports = AuctionServer;
const AUCTION_SERVER_PORT = process.env.AUCTION_SERVER_PORT || 8001;
AuctionServer.listen(AUCTION_SERVER_PORT, () => {
    console.log(`Auction Server is Runnig at port ${AUCTION_SERVER_PORT}`);
});