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
    const allowedOrigins = ['http://localhost:3000', 'https://stubble-management.vercel.app', 'https://stubble-management-vercel-app.vercel.app'];
    const origin = req.headers.origin;
    
    // Allow the requesting origin or deny if not in allowedOrigins
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (origin && origin.endsWith('.vercel.app')) {
        // Also allow any vercel.app subdomain for development/preview URLs
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

// Add fallback CORS middleware for safety
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    if (origin.includes('localhost') || 
        origin.includes('stubble-management') || 
        origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Use routers
app.use('/', router);
app.use('/', googleAuthRouter);

// Add a simple test route
app.get('/api/test', (req, res) => {
    res.json({ msg: 'API is working' });
});

// Add a CORS diagnostic endpoint
app.get('/api/cors-test', (req, res) => {
    res.json({ 
        msg: 'CORS test successful',
        headers: {
            origin: req.headers.origin || 'No origin header',
            host: req.headers.host,
            referer: req.headers.referer || 'No referer',
        },
        cors: {
            allowOrigin: res.getHeader('Access-Control-Allow-Origin') || 'Not set',
            allowMethods: res.getHeader('Access-Control-Allow-Methods') || 'Not set',
            allowHeaders: res.getHeader('Access-Control-Allow-Headers') || 'Not set',
            allowCredentials: res.getHeader('Access-Control-Allow-Credentials') || 'Not set'
        }
    });
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