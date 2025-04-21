const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('config');
const Admin = require('../models/Admin');
const connectDB = require('./db');

// Admin credentials (customize these)
const adminData = {
    name: 'Admin User',
    email: 'admin@example.com',
    mobileNo: '1234567890',
    password: 'admin123'  // Will be hashed before storing
};

async function seedAdmin() {
    try {
        // Connect to database (this will be shared with other parts of the app)
        await connectDB();
        
        // Check if admin already exists
        const adminExists = await Admin.findOne({ email: adminData.email });
        
        if (adminExists) {
            console.log('Admin user already exists');
            console.log('Removing existing admin to create a fresh one...');
            await Admin.deleteOne({ email: adminData.email });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminData.password, salt);

        // Create the admin user
        const admin = await Admin.create({
            name: adminData.name,
            email: adminData.email,
            mobileNo: adminData.mobileNo,
            password: hashedPassword
        });

        console.log('Admin user created successfully');
        console.log('Email:', adminData.email);
        console.log('Password:', adminData.password);  // Log the unhashed password for reference
        
        // DON'T disconnect from database here - the app will use the same connection
        
    } catch (err) {
        console.error('Error seeding admin user:', err);
        // Don't exit process, just report the error
    }
}

// Run the seed function if this script is executed directly
if (require.main === module) {
    seedAdmin().then(() => {
        // Only disconnect if run as a standalone script
        mongoose.disconnect();
    });
}

module.exports = seedAdmin; 