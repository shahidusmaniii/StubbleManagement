require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const router = require('./api/auth');
const googleAuthRouter = require('./api/google-auth');
const app = express();

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://usmaniii:usmaniii123@cluster0.ky9wk.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB connection error:', err));

// CORS middleware - handle all preflight and CORS issues
app.use((req, res, next) => {
    // Allow requests from these origins
    const allowedOrigins = ['https://stubble-management-jwrkb34nh-shahidusmaniiis-projects.vercel.app', 'http://localhost:3000'];
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, x-auth-token');
    
    // Set to true if you need the website to include cookies in the requests
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Pass to next layer of middleware
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// For parsing application/json
app.use(express.json());
app.use(cookieParser());

// Use routers
app.use('/', router);
app.use('/', googleAuthRouter);

// Add a simple test route
app.get('/api/test', (req, res) => {
    res.json({ msg: 'API is working' });
});

// Add debug logging for environment variables
console.log('Environment variables loaded:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set (value hidden)' : 'Not set');
console.log('JWT_TOKEN:', process.env.JWT_TOKEN ? 'Set (value hidden)' : 'Not set');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set (value hidden)' : 'Not set');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set (value hidden)' : 'Not set');
console.log('PORT:', process.env.PORT || 8000);

const SERVER_PORT = process.env.PORT || 8000;
app.listen(SERVER_PORT, () => console.log(`server started on port ${SERVER_PORT}`)); 