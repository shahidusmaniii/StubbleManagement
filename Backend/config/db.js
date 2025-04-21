const mongoose = require("mongoose");
const config = require('config');

const db = config.get('mongoURI');

// Create a global mongoose connection
let isConnected = false;

async function connectDB() {
    if (isConnected) {
        console.log('Using existing database connection');
        return;
    }

    try {
        mongoose.set('strictQuery', false);
        
        // Connection options to handle deprecation warnings
        const connectionOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5s
            maxPoolSize: 10 // Maintain up to 10 socket connections
        };
        
        await mongoose.connect(db, connectionOptions);
        
        isConnected = true;
        console.log("Successfully Connected to the DB");
        
        // Handle connection errors after initial connection
        mongoose.connection.on('error', err => {
            console.error('MongoDB connection error:', err);
            isConnected = false;
        });
        
        // Handle disconnection
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            isConnected = false;
        });
        
        // Handle process termination
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });
        
    } catch (err) {
        console.error("Error occurred during DB connection:", err);
        isConnected = false;
        process.exit(1);
    }
}

module.exports = connectDB;