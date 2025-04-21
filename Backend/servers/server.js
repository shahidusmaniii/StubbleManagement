const express = require('express');
const config = require('config');
const connectDB = require('../config/db');
const seedAdmin = require('../config/seedAdmin');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const router = require('../api/auth');
const app = express();

// Connect to database
connectDB();

// Seed admin user
seedAdmin().catch(err => console.error('Error seeding admin:', err));

app.use(cookieParser());   
app.use(express.json()); 
app.use(cors());
  
// The router now includes full paths like /api/auth/*
app.use('/', router);

const SERVER_PORT = config.get('serverPort') || 8000;
app.listen(SERVER_PORT, () => console.log(`server started on port ${SERVER_PORT}`));