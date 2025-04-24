const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '512824280172-9965tinrcgi43ju4ptvbjso8qe5pgv80.apps.googleusercontent.com');

// Debug endpoint - just logs the credential
router.post('/api/auth/google-debug', (req, res) => {
    console.log('Received Google debug request');
    const { credential } = req.body;
    
    if (!credential) {
        return res.status(400).json({ msg: 'No credential provided' });
    }
    
    console.log('Got credential of length:', credential.length);
    
    res.json({ 
        success: true,
        msg: 'Credential received and logged'
    });
});

// Simple endpoint - no token verification
router.post('/api/auth/google-simple', (req, res) => {
    console.log('Received simplified Google auth request');
    const { credential, userType } = req.body;
    
    if (!credential) {
        return res.status(400).json({ msg: 'No credential provided' });
    }
    
    console.log('Creating dummy user and token with userType:', userType || 'Farmer');
    
    // Use provided userType or default to Farmer
    const userTypeToUse = userType || 'Farmer';
    
    // Create a dummy user
    const dummyUser = {
        id: '12345',
        name: 'Google User',
        email: 'google@example.com',
        type: userTypeToUse
    };
    
    // Generate a JWT token
    const token = jwt.sign(
        { user: { id: dummyUser.id, type: dummyUser.type } },
        process.env.JWT_TOKEN || 'mytokenyoyoyo',
        { expiresIn: '1h' }
    );
    
    res.json({
        token,
        user: dummyUser
    });
});

// Full Google auth - with token verification but no database
router.post('/api/auth/google', async (req, res) => {
    try {
        console.log('Received Google auth request');
        const { credential, token } = req.body;
        
        // Use either credential or token parameter
        const idToken = credential || token;
        
        if (!idToken) {
            return res.status(400).json({ msg: 'No credential provided' });
        }
        
        try {
            console.log('Verifying token...');
            const ticket = await client.verifyIdToken({
                idToken: idToken,
                audience: process.env.GOOGLE_CLIENT_ID || '512824280172-9965tinrcgi43ju4ptvbjso8qe5pgv80.apps.googleusercontent.com'
            });
            
            const payload = ticket.getPayload();
            console.log('Token verified, payload received');
            
            const { email, name, picture, sub } = payload;
            
            // Create a user from the Google data
            const user = {
                id: sub,
                name,
                email,
                avatar: picture,
                type: 'Farmer'
            };
            
            // Generate a JWT token
            const token = jwt.sign(
                { user: { id: user.id, type: user.type } },
                process.env.JWT_TOKEN || 'mytokenyoyoyo',
                { expiresIn: '1h' }
            );
            
            res.json({
                token,
                user
            });
        } catch (verifyError) {
            console.error('Token verification error:', verifyError);
            return res.status(400).json({ 
                msg: 'Invalid Google token',
                error: verifyError.message
            });
        }
    } catch (err) {
        console.error('Google auth error:', err);
        res.status(500).json({ 
            msg: 'Server Error',
            error: err.message
        });
    }
});

module.exports = router; 