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

// Configure CORS with proper settings
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(cookieParser());   
app.use(express.json()); 
  
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