const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Company = require('../models/Company');
const Admin = require('../models/Admin');
const service = require('../models/Service');
const AuctionModel = require('../models/Auction');
const ClearedList = require('../models/ClearedList');
const { encryption } = require('../middleware/hasing');
const { check, validationResult } = require('express-validator/check');
const RoomModel = require('../models/AuctionRoom');
const mongoose = require('mongoose');
const { sendVerificationEmail } = require('../utils/email');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '512824280172-9965tinrcgi43ju4ptvbjso8qe5pgv80.apps.googleusercontent.com');

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'managementstubble@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'rqgk aajr rwkz eilp'
    }
});

// Test email endpoint
router.get('/test-email', async (req, res) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER || 'managementstubble@gmail.com',
            to: process.env.EMAIL_USER || 'managementstubble@gmail.com',
            subject: 'Test Email from Stubble Management',
            text: 'This is a test email to verify the email configuration is working correctly.'
        };

        await transporter.sendMail(mailOptions);
        res.json({ msg: 'Test email sent successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add after the existing test-email endpoint
/**
 * @route   POST /api/auth/test-email
 * @desc    Test email sending functionality
 * @access  Public
 */
router.post('/api/auth/test-email', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ msg: 'Email is required' });
        }
        
        // Import the sendTestEmail function
        const { sendTestEmail } = require('../utils/email');
        
        console.log('Attempting to send test email to:', email);
        const result = await sendTestEmail(email);
        
        if (result.success) {
            if (result.service === 'ethereal') {
                // If we used the test service
                return res.json({ 
                    success: true, 
                    msg: 'Test email created with Ethereal. Check the preview URL:', 
                    service: 'ethereal',
                    previewUrl: result.previewUrl 
                });
            } else {
                // If Gmail worked
                return res.json({ 
                    success: true, 
                    msg: 'Test email sent successfully with Gmail', 
                    service: 'gmail',
                    messageId: result.messageId 
                });
            }
        } else {
            return res.status(500).json({ 
                success: false, 
                msg: 'Failed to send test email', 
                error: result.error 
            });
        }
    } catch (err) {
        console.error('Test email error:', err);
        res.status(500).json({ 
            msg: 'Server Error', 
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// Define the schema for room participants if it doesn't exist elsewhere
const RoomParticipationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    userType: {
        type: String,
        required: true
    },
    roomCode: {
        type: String,
        required: true
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
});

// Create the model if it doesn't already exist
const RoomParticipation = mongoose.models.RoomParticipation || mongoose.model('RoomParticipation', RoomParticipationSchema);

// Generate verification token
const generateVerificationToken = () => {
    return crypto.randomBytes(20).toString('hex');
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get('/api/auth/me', auth, async (req, res) => {
    try {
        // Get the user type from the token
        const userType = req.user.type;

        if (userType === 'Farmer') {
            const user = await User.findById(req.user.id).select('-password');
            if (user) {
                return res.json({
                    user,
                    userType: 'Farmer'
                });
            }
        } else if (userType === 'Company') {
            const company = await Company.findById(req.user.id).select('-password');
            if (company) {
                return res.json({
                    user: company,
                    userType: 'Company'
                });
            }
        } else if (userType === 'Admin') {
            const admin = await Admin.findById(req.user.id).select('-password');
            if (admin) {
                return res.json({
                    user: admin,
                    userType: 'Admin'
                });
            }
        }

        return res.status(404).json({ msg: 'User not found' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/api/auth/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
    check('userType', 'User type is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, userType } = req.body;
    console.log(`Login attempt: Email=${email}, UserType=${userType}`);

    try {
        let user;
        let collection;

        // Determine which collection to query based on userType
        if (userType === 'Farmer') {
            user = await User.findOne({ email });
            collection = User;
        } else if (userType === 'Company') {
            user = await Company.findOne({ email });
            collection = Company;
        } else if (userType === 'Admin') {
            user = await Admin.findOne({ email });
            collection = Admin;
            console.log(`Admin lookup result: ${user ? 'Found' : 'Not found'}`);
        } else {
            return res.status(400).json({ msg: 'Invalid user type' });
        }

        if (!user) {
            console.log(`User not found: ${email}`);
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Check if email is verified (skip for Admin)
        if (userType !== 'Admin' && !user.isEmailVerified && !user.googleId) {
            console.log(`User ${email} has not verified email`);
            return res.status(401).json({ 
                msg: 'Email not verified. Please check your email for verification link.',
                needsVerification: true 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`Password comparison result: ${isMatch ? 'Match' : 'No match'}`);
        
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = {
            user: {
                id: user.id,
                type: userType
            }
        };

        // Use either environment variable or config for JWT token
        const jwtSecret = process.env.JWT_TOKEN || 'mytokenyoyoyo';

        jwt.sign(
            payload,
            jwtSecret,
            { expiresIn: 360000 },
            (err, token) => {
                if (err) {
                    console.error('JWT signing error:', err);
                    return res.status(500).json({ msg: 'Error creating authentication token' });
                }
                
                console.log(`Login successful for: ${email}`);
                res.json({
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        type: userType
                    }
                });
            }
        );
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ 
            msg: 'Server Error', 
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

/**
 * @route   POST /api/auth/register
 * @desc    Register a user (Farmer or Company only)
 * @access  Public
 */
router.post('/api/auth/register', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('mobileNo', 'Mobile number is required').not().isEmpty(),
    check('userType', 'User type is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, mobileNo, userType } = req.body;

    // Prevent registration as Admin
    if (userType === 'Admin') {
        return res.status(403).json({ msg: 'Admin registration not allowed' });
    }

    try {
        // Check for existing user across all collections
        const farmerExists = await User.findOne({ email });
        const companyExists = await Company.findOne({ email });
        const adminExists = await Admin.findOne({ email });

        if (farmerExists || companyExists || adminExists) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate verification token
        const verificationToken = generateVerificationToken();
        const verificationExpires = new Date();
        verificationExpires.setHours(verificationExpires.getHours() + 24);

        let newUser;

        // Create the appropriate user type
        if (userType === 'Farmer') {
            newUser = await User.create({
                name,
                mobileNo,
                email,
                password: hashedPassword,
                emailVerificationToken: verificationToken,
                emailVerificationExpires: verificationExpires
            });
        } else if (userType === 'Company') {
            newUser = await Company.create({
                name,
                mobileNo,
                email,
                password: hashedPassword,
                emailVerificationToken: verificationToken,
                emailVerificationExpires: verificationExpires
            });
        } else {
            return res.status(400).json({ msg: 'Invalid user type' });
        }

        // Send verification email
        try {
            const emailResult = await sendVerificationEmail(email, verificationToken, userType);
            console.log('Verification email result:', emailResult);
            
            if (emailResult.service === 'ethereal') {
                // If we used the ethereal test service, provide the preview URL
                return res.status(201).json({ 
                    msg: 'Registration successful! Since we had trouble with our email service, we are providing a preview link for your verification email. Please check it to verify your account.',
                    emailService: 'ethereal',
                    previewUrl: emailResult.previewUrl,
                    user: {
                        id: newUser.id,
                        name: newUser.name,
                        email: newUser.email,
                        type: userType
                    }
                });
            }
            
            // If Gmail succeeded
            return res.status(201).json({ 
                msg: 'Registration successful. Please check your email to verify your account.',
                emailService: 'gmail',
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    type: userType
                }
            });
            
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // Continue with registration but notify user about email issue
            return res.status(201).json({ 
                msg: 'Registration successful, but we could not send a verification email. Please use the direct verification link below:',
                directVerificationLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}&type=${userType}`,
                emailError: emailError.message,
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    type: userType
                }
            });
        }
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

/**
 * @route   GET /api/auth/verify-email
 * @desc    Verify user's email
 * @access  Public
 */
router.get('/api/auth/verify-email', async (req, res) => {
    const { token, type } = req.query;

    console.log(`Email verification attempt: Token=${token}, Type=${type}`);

    if (!token || !type) {
        return res.status(400).json({ msg: 'Invalid verification link - missing token or type' });
    }

    try {
        let user;
        if (type === 'Farmer') {
            console.log('Searching for farmer with token:', token);
            user = await User.findOne({
                emailVerificationToken: token,
                emailVerificationExpires: { $gt: Date.now() }
            });
        } else if (type === 'Company') {
            console.log('Searching for company with token:', token);
            user = await Company.findOne({
                emailVerificationToken: token,
                emailVerificationExpires: { $gt: Date.now() }
            });
        } else {
            console.log('Invalid user type for verification:', type);
            return res.status(400).json({ msg: 'Invalid user type for verification' });
        }

        if (!user) {
            console.log('Invalid or expired verification token');
            
            // Check if expired
            const expiredUser = type === 'Farmer' 
                ? await User.findOne({ emailVerificationToken: token })
                : await Company.findOne({ emailVerificationToken: token });
                
            if (expiredUser) {
                // Token exists but expired
                console.log('Found expired token for user:', expiredUser.email);
                
                // Issue a new token
                const newToken = generateVerificationToken();
                expiredUser.emailVerificationToken = newToken;
                
                const verificationExpires = new Date();
                verificationExpires.setHours(verificationExpires.getHours() + 24);
                expiredUser.emailVerificationExpires = verificationExpires;
                
                await expiredUser.save();
                
                // Send a new verification email
                try {
                    await sendVerificationEmail(expiredUser.email, newToken, type);
                    return res.status(400).json({ 
                        msg: 'Verification link expired. A new verification link has been sent to your email.',
                        emailResent: true
                    });
                } catch (emailErr) {
                    console.error('Failed to send new verification email:', emailErr);
                    return res.status(400).json({ 
                        msg: 'Verification link expired. Could not send a new link. Please register again or contact support.',
                        emailResent: false
                    });
                }
            }
            
            return res.status(400).json({ msg: 'Invalid or expired verification link' });
        }

        console.log('User found, verifying email. Current verification status:', user.isEmailVerified);
        
        // Mark as verified
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        
        // Debug the user object before saving
        console.log('Updated user object before save:', {
            id: user._id,
            email: user.email,
            isEmailVerified: user.isEmailVerified,
            hasToken: !!user.emailVerificationToken
        });
        
        const savedUser = await user.save();
        
        // Debug the user object after saving
        console.log('User after save:', {
            id: savedUser._id,
            email: savedUser.email,
            isEmailVerified: savedUser.isEmailVerified,
            hasToken: !!savedUser.emailVerificationToken
        });

        console.log(`Email verified successfully for user: ${user.email}`);
        res.json({ 
            msg: 'Email verified successfully',
            user: {
                email: user.email,
                name: user.name,
                isVerified: user.isEmailVerified
            }
        });
    } catch (err) {
        console.error('Email verification error:', err);
        res.status(500).json({ 
            msg: 'Server Error', 
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

/**
 * @route   POST /api/auth/google
 * @desc    Authenticate with Google and get token
 * @access  Public
 */
router.post('/api/auth/google', async (req, res) => {
    const { token, credential, userType } = req.body;
    
    // Use either credential or token parameter
    const idToken = credential || token;
    
    if (!idToken) {
        return res.status(400).json({ msg: 'No credential provided' });
    }

    try {
        console.log(`Verifying Google token for userType: ${userType || 'Farmer'}`);
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID || '512824280172-9965tinrcgi43ju4ptvbjso8qe5pgv80.apps.googleusercontent.com'
        });

        const payload = ticket.getPayload();
        console.log('Google payload received:', {
            email: payload.email,
            name: payload.name,
            sub: payload.sub
        });
        
        const { email, name, sub: googleId, picture } = payload;
        
        // Default to Farmer if userType not provided
        const userTypeToUse = userType || 'Farmer';

        let user;
        if (userTypeToUse === 'Farmer') {
            user = await User.findOne({ $or: [{ email }, { googleId }] });
        } else if (userTypeToUse === 'Company') {
            user = await Company.findOne({ $or: [{ email }, { googleId }] });
        } else {
            return res.status(400).json({ msg: 'Invalid user type' });
        }

        if (user) {
            console.log(`Existing user found with email: ${email}`);
            // Update user if they exist
            if (!user.googleId) {
                console.log('Updating user with Google ID');
                user.googleId = googleId;
                await user.save();
            }
        } else {
            // Create new user
            console.log(`Creating new user with email: ${email}`);
            try {
                const userData = {
                    name,
                    email,
                    googleId,
                    isEmailVerified: true
                };
                
                // Add avatar if available
                if (picture) {
                    userData.avatar = picture;
                }
                
                console.log('Creating user with data:', userData);
                
                if (userTypeToUse === 'Farmer') {
                    user = await User.create(userData);
                } else if (userTypeToUse === 'Company') {
                    user = await Company.create(userData);
                }
                console.log('New user created successfully:', user._id);
            } catch (createError) {
                console.error('Error creating user:', createError);
                return res.status(400).json({ 
                    msg: 'Failed to create user account',
                    error: createError.message
                });
            }
        }

        const jwtPayload = {
            user: {
                id: user.id,
                type: userTypeToUse
            }
        };

        // Use either environment variable or config for JWT token
        const jwtSecret = process.env.JWT_TOKEN || 'mytokenyoyoyo';

        jwt.sign(
            jwtPayload,
            jwtSecret,
            { expiresIn: 360000 },
            (err, token) => {
                if (err) {
                    console.error('JWT signing error:', err);
                    throw err;
                }
                console.log('Authentication successful, token generated');
                res.json({
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        type: userTypeToUse
                    }
                });
            }
        );
    } catch (err) {
        console.error('Google auth error:', err);
        res.status(500).json({ 
            msg: 'Server Error', 
            error: err.message 
        });
    }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user / clear session
 * @access  Private
 */
router.post('/api/auth/logout', auth, (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ msg: 'Failed to logout' });
            }
            res.clearCookie('connect.sid');
            return res.json({ msg: 'Logged out successfully' });
        });
    } else {
        // If using JWT only, just send success response
        // Client-side should remove the token
        return res.json({ msg: 'Logged out successfully' });
    }
});

/**
 * @route   POST /api/services
 * @desc    Create a service request
 * @access  Private
 */
router.post('/api/services', auth, async (req, res) => {
    try {
        const serviceExists = await service.findOne({ email: req.body.email });

        if (serviceExists) {
            return res.status(400).json({ msg: 'Service request already exists' });
        }

        const newService = await service.create({
            email: req.body.email,
            mobileNo: req.body.mobileNo,
            acre: req.body.acre,
            pType: req.body.pType,
            date1: req.body.date1,
            du1: req.body.du1,
            du2: req.body.du2,
            type: req.body.type,
            mType: JSON.stringify(req.body.mType)
        });

        if (newService) {
            return res.status(201).json({
                success: true,
                msg: 'Successfully requested for harvesting',
                service: newService
            });
        } else {
            return res.status(400).json({ success: false, msg: 'Request is not accepted' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

/**
 * @route   GET /api/services
 * @desc    Get all service requests
 * @access  Private (Admin only)
 */
router.get('/api/services', auth, async (req, res) => {
    try {
        const services = await service.find();
        res.json(services);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

/**
 * @route   GET /api/services/me
 * @desc    Get service requests for the current user
 * @access  Private
 */
router.get('/api/services/me', auth, async (req, res) => {
    try {
        // Find user info to get email
        const user = await User.findById(req.user.id).select('-password');
        const company = await Company.findById(req.user.id).select('-password');
        const admin = await Admin.findById(req.user.id).select('-password');
        
        let email = '';
        if (user) email = user.email;
        else if (company) email = company.email;
        else if (admin) email = admin.email;
        
        // Get service requests for this user's email
        const services = await service.find({ email });
        res.json(services);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

/**
 * @route   GET /api/services/completed
 * @desc    Get completed service requests for the current user
 * @access  Private
 */
router.get('/api/services/completed', auth, async (req, res) => {
    try {
        // Find user info to get email
        const user = await User.findById(req.user.id).select('-password');
        const company = await Company.findById(req.user.id).select('-password');
        const admin = await Admin.findById(req.user.id).select('-password');
        
        let email = '';
        if (user) email = user.email;
        else if (company) email = company.email;
        else if (admin) email = admin.email;
        
        // Get completed service requests for this user's email
        const completedServices = await ClearedList.find({ email });
        res.json(completedServices);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

/**
 * @route   DELETE /api/services/:email
 * @desc    Delete service request and add to cleared list
 * @access  Private (Admin only)
 */
router.delete('/api/services/:email', auth, async (req, res) => {
    try {
        const serviceRequest = await service.findOne({ email: req.params.email });

        if (!serviceRequest) {
            return res.status(404).json({ msg: 'Service request not found' });
        }

        // Create record in cleared list
        const clearList = await ClearedList.create({
            email: req.params.email,
            tResidue: req.body.tResidue,
            tGrain: req.body.tGrain,
            sDate: req.body.sDate
        });

        // Remove from service requests
        await service.deleteOne({ email: req.params.email });

        if (clearList) {
            return res.json({
                success: true,
                msg: 'Request successfully removed from pending requests and added to cleared list',
                clearList
            });
        } else {
            return res.status(400).json({ success: false, msg: 'Failed to process request' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

/**
 * @route   POST /api/rooms
 * @desc    Create auction room
 * @access  Private (Admin only)
 */
router.post('/api/rooms', auth, async (req, res) => {
    try {
        const roomExists = await RoomModel.findOne({ name: req.body.name });

        if (roomExists) {
            return res.status(400).json({ success: false, msg: 'Room with that name already exists' });
        }

        // Get admin name
        const admin = await Admin.findById(req.user.id).select('-password');
        const adminName = admin ? admin.name : 'Admin';

        const room = await RoomModel.create({
            name: req.body.name,
            description: req.body.description,
            code: req.body.code,
            startBid: req.body.startBid,
            startDate: req.body.startDate,
            endDate: req.body.endDate
        });

        if (room) {
            // Create initial bid by admin with proper name
            const initialBid = await AuctionModel.create({
                bid: req.body.startBid,
                room: req.body.code,
                user: req.user.id,
                userName: adminName
            });

            return res.status(201).json({
                success: true,
                msg: 'Auction room created successfully',
                room,
                initialBid
            });
        } else {
            return res.status(400).json({ success: false, msg: 'Failed to create auction room' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

/**
 * @route   GET /api/rooms
 * @desc    Get auction rooms that the user has joined
 * @access  Private
 */
router.get('/api/rooms', auth, async (req, res) => {
    try {
        // Get current date and time
        const currentDate = new Date();
        
        // For Admin, return all active rooms
        if (req.user.type === 'Admin') {
            const rooms = await RoomModel.find({ endDate: { $gt: currentDate } });
            return res.json({ rooms });
        }
        
        // For Company and Farmer, only return rooms they've joined
        const participations = await RoomParticipation.find({ 
            userId: req.user.id,
            userType: req.user.type
        });
        
        // If no participations, return empty array
        if (!participations || participations.length === 0) {
            return res.json({ rooms: [] });
        }
        
        // Extract room codes from participations
        const roomCodes = participations.map(p => p.roomCode);
        
        // Get active rooms that the user has joined
        const rooms = await RoomModel.find({ 
            code: { $in: roomCodes },
            endDate: { $gt: currentDate } 
        });
        
        res.json({ rooms });
    } catch (err) {
        console.error("Error fetching rooms:", err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

/**
 * @route   GET /api/rooms/all
 * @desc    Get all active rooms
 * @access  Private
 */
router.get('/api/rooms/all', auth, async (req, res) => {
    try {
        const currentDate = new Date();
        const rooms = await RoomModel.find({ endDate: { $gt: currentDate } });
        res.json({ rooms });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

/**
 * @route   GET /api/rooms/available
 * @desc    Get available rooms for a company to join
 * @access  Private (Company only)
 */
router.get('/api/rooms/available', auth, async (req, res) => {
    // Only company users can join rooms
    if (req.user.type !== 'Company') {
        return res.status(403).json({ msg: 'Only companies can join auction rooms' });
    }
    
    try {
        // Get current date and time
        const currentDate = new Date();
        
        // Get rooms the user has already joined
        const participations = await RoomParticipation.find({ 
            userId: req.user.id,
            userType: req.user.type
        });
        
        // Extract room codes the user has already joined
        const joinedRoomCodes = participations.map(p => p.roomCode);
        
        // Get active rooms that the user has NOT joined yet
        const availableRooms = await RoomModel.find({ 
            code: { $nin: joinedRoomCodes },
            endDate: { $gt: currentDate } 
        });
        
        res.json({ availableRooms });
    } catch (err) {
        console.error("Error fetching available rooms:", err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

/**
 * @route   GET /api/dashboard
 * @desc    Get dashboard data (admin)
 * @access  Private (Admin only)
 */
router.get('/api/dashboard', auth, async (req, res) => {
    try {
        // Get current date and time
        const currentDate = new Date();

        // Get active rooms (end date is in the future)
        const rooms = await RoomModel.find({ endDate: { $gt: currentDate } });
        const services = await service.find();

        res.json({
            rooms,
            services
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

/**
 * @route   GET /api/rooms/joined
 * @desc    Get rooms that the user has joined
 * @access  Private
 */
router.get('/api/rooms/joined', auth, async (req, res) => {
    try {
        // Get current date
        const currentDate = new Date();

        // Get rooms the user has joined through the participation records
        const participations = await RoomParticipation.find({ 
            userId: req.user.id,
            userType: req.user.type
        });
        
        if (!participations || participations.length === 0) {
            return res.json({ rooms: [] });
        }
        
        // Extract room codes that the user has joined
        const joinedRoomCodes = participations.map(p => p.roomCode);
        
        // Find all active rooms that match these codes
        const rooms = await RoomModel.find({ 
            code: { $in: joinedRoomCodes },
            endDate: { $gt: currentDate } 
        });
        
        res.json({ rooms });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

/**
 * @route   POST /api/rooms/join
 * @desc    Join an auction room
 * @access  Private
 */
router.post('/api/rooms/join', auth, async (req, res) => {
    try {
        const { code } = req.body;
        
        if (!code) {
            return res.status(400).json({ msg: 'Room code is required' });
        }
        
        // Check if room exists
        const room = await RoomModel.findOne({ code });
        
        if (!room) {
            return res.status(404).json({ msg: 'Room not found' });
        }
        
        // Check if room is still active
        const currentDate = new Date();
        if (room.endDate < currentDate) {
            return res.status(400).json({ msg: 'This auction has ended' });
        }
        
        // Check if user has already joined this room
        const existingParticipation = await RoomParticipation.findOne({
            userId: req.user.id,
            userType: req.user.type,
            roomCode: code
        });
        
        let participantAdded = false;
        
        // If not already joined, record participation
        if (!existingParticipation) {
            await RoomParticipation.create({
                userId: req.user.id,
                userType: req.user.type,
                roomCode: code
            });
            participantAdded = true;
        }
        
        // Notify auction server about participant (if connected)
        try {
            const io = require('socket.io-client');
            const socket = io('http://localhost:8001');
            socket.emit('room_joined', { code, userId: req.user.id });
            socket.disconnect();
        } catch (socketErr) {
            console.error('Failed to notify auction server:', socketErr);
            // Non-critical error, continue anyway
        }
        
        return res.json({
            success: true,
            msg: 'Successfully joined the auction room',
            room,
            participantAdded
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

/**
 * @route   GET /api/rooms/:code/bids/highest
 * @desc    Get the highest bid for a room
 * @access  Private
 */
router.get('/api/rooms/:code/bids/highest', auth, async (req, res) => {
    try {
        const { code } = req.params;
        
        // Find the highest bid for this room
        const highestBid = await AuctionModel.findOne({ room: code })
            .sort({ bid: -1 })  // Sort by bid amount in descending order
            .limit(1);          // Get only the highest bid
        
        if (!highestBid) {
            return res.status(404).json({ msg: 'No bids found for this room' });
        }
        
        // Return bid info
        res.json({
            amount: highestBid.bid,
            bidder: highestBid.user
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// Debug endpoint for Google credential
router.post('/google-debug', async (req, res) => {
    try {
        console.log('Received Google debug request');
        const { credential } = req.body;
        
        if (!credential) {
            return res.status(400).json({ msg: 'No credential provided' });
        }
        
        // Simply log the credential and return success
        console.log('Received credential:', credential.substring(0, 20) + '...');
        
        res.json({ 
            success: true,
            msg: 'Credential received successfully',
            credentialLength: credential.length
        });
    } catch (err) {
        console.error('Debug endpoint error:', err);
        res.status(500).json({ 
            msg: 'Server Error', 
            error: err.message
        });
    }
});

// Simplified Google OAuth verification without complex validation
router.post('/google-simple', async (req, res) => {
    try {
        console.log('Received simplified Google auth request');
        const { credential } = req.body;
        
        if (!credential) {
            console.error('No credential provided');
            return res.status(400).json({ msg: 'No credential provided' });
        }

        console.log('Attempting to verify Google credential...');
        
        // Create a simple dummy user without validation
        const dummyUser = {
            id: '12345',
            name: 'Google User',
            email: 'google@example.com',
            isCompany: false,
            avatar: 'https://example.com/avatar.jpg'
        };

        // Generate JWT token
        console.log('Generating JWT token...');
        const token = jwt.sign(
            { 
                user: { 
                    id: dummyUser.id,
                    isCompany: dummyUser.isCompany
                } 
            },
            process.env.JWT_TOKEN || 'mytokenyoyoyo',
            { expiresIn: '1h' }
        );

        console.log('Authentication successful (simplified)');
        res.json({ 
            token,
            user: dummyUser
        });
    } catch (err) {
        console.error('Google auth error (simplified):', err);
        res.status(500).json({ 
            msg: 'Server Error', 
            error: err.message
        });
    }
});

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend verification email
 * @access  Public
 */
router.post('/api/auth/resend-verification', [
    check('email', 'Please include a valid email').isEmail()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    console.log(`Resend verification request for: ${email}`);

    try {
        // Check if user exists
        let user = await User.findOne({ email });
        let userType = 'Farmer';
        
        if (!user) {
            user = await Company.findOne({ email });
            userType = 'Company';
            
            if (!user) {
                // Don't reveal that the user doesn't exist for security
                return res.json({ 
                    msg: 'If your email exists in our system, a verification link has been sent.'
                });
            }
        }
        
        // Skip if already verified
        if (user.isEmailVerified) {
            return res.json({ 
                msg: 'Your email is already verified. You can log in now.',
                alreadyVerified: true
            });
        }
        
        // Generate new verification token
        const verificationToken = generateVerificationToken();
        const verificationExpires = new Date();
        verificationExpires.setHours(verificationExpires.getHours() + 24);
        
        // Update user with new token
        user.emailVerificationToken = verificationToken;
        user.emailVerificationExpires = verificationExpires;
        await user.save();
        
        // Send verification email
        try {
            const emailResult = await sendVerificationEmail(email, verificationToken, userType);
            console.log('Verification email resent:', emailResult);
            
            if (emailResult.service === 'ethereal') {
                // If using test email service
                return res.json({
                    msg: 'Verification email has been sent. Check the preview link:',
                    emailService: 'ethereal',
                    previewUrl: emailResult.previewUrl
                });
            }
            
            return res.json({ 
                msg: 'Verification email has been sent. Please check your inbox.', 
                emailService: 'gmail'
            });
        } catch (emailErr) {
            console.error('Failed to send verification email:', emailErr);
            return res.status(500).json({ 
                msg: 'Could not send verification email. Please try again later.',
                error: emailErr.message
            });
        }
    } catch (err) {
        console.error('Resend verification error:', err);
        res.status(500).json({ 
            msg: 'Server Error', 
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

/**
 * @route   GET /api/auth/check-verification
 * @desc    Check user's verification status
 * @access  Public
 */
router.get('/api/auth/check-verification', async (req, res) => {
    const { email, type } = req.query;

    if (!email || !type) {
        return res.status(400).json({ msg: 'Email and type are required' });
    }

    try {
        let user;
        
        if (type === 'Farmer') {
            user = await User.findOne({ email }).select('-password');
        } else if (type === 'Company') {
            user = await Company.findOne({ email }).select('-password');
        } else {
            return res.status(400).json({ msg: 'Invalid user type' });
        }

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Return verification details
        res.json({
            email: user.email,
            isEmailVerified: user.isEmailVerified,
            hasVerificationToken: !!user.emailVerificationToken,
            tokenExpiry: user.emailVerificationExpires,
            isTokenExpired: user.emailVerificationExpires ? user.emailVerificationExpires < new Date() : null
        });
    } catch (err) {
        console.error('Verification check error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

/**
 * @route   GET /api/auth/check-admin
 * @desc    Check if admin exists and create default admin if needed
 * @access  Public
 */
router.get('/api/auth/check-admin', async (req, res) => {
    try {
        console.log('Checking if admin exists');
        const adminExists = await Admin.findOne({ email: 'admin@example.com' });
        
        if (adminExists) {
            console.log('Admin account found');
            return res.json({ 
                exists: true, 
                message: 'Admin account exists' 
            });
        }
        
        console.log('No admin account found, creating default admin');
        
        // Create default admin account
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        
        const newAdmin = await Admin.create({
            name: 'Admin',
            email: 'admin@example.com',
            password: hashedPassword,
            mobileNo: '0000000000' // Default mobile number
        });
        
        console.log('Default admin account created');
        
        res.json({
            exists: false,
            created: true,
            message: 'Default admin account created',
            credentials: {
                email: 'admin@example.com',
                password: 'admin123'
            }
        });
    } catch (err) {
        console.error('Error checking/creating admin:', err);
        res.status(500).json({ 
            msg: 'Server Error', 
            error: err.message 
        });
    }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/api/auth/forgot-password', [
    check('email', 'Please include a valid email').isEmail(),
    check('userType', 'User type is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, userType } = req.body;

    // Only allow Farmer and Company types
    if (userType !== 'Farmer' && userType !== 'Company') {
        return res.status(400).json({ msg: 'Password reset is only available for Farmers and Companies' });
    }

    try {
        let user;
        if (userType === 'Farmer') {
            user = await User.findOne({ email });
        } else {
            user = await Company.findOne({ email });
        }

        if (!user) {
            // Don't reveal that the user doesn't exist for security
            return res.json({ 
                msg: 'If your email exists in our system, a password reset link has been sent.'
            });
        }

        // Generate reset token
        const resetToken = generateVerificationToken();
        const resetExpires = new Date();
        resetExpires.setHours(resetExpires.getHours() + 1); // Token expires in 1 hour

        // Update user with reset token
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetExpires;
        await user.save();

        // Send reset email
        try {
            const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&type=${userType}`;
            const emailText = `
                You are receiving this email because you (or someone else) has requested a password reset.
                Please click on the following link to reset your password:
                ${resetUrl}
                
                If you did not request this, please ignore this email.
                
                This link will expire in 1 hour.
            `;

            const mailOptions = {
                from: process.env.EMAIL_USER || 'managementstubble@gmail.com',
                to: email,
                subject: 'Password Reset Request',
                text: emailText
            };

            await transporter.sendMail(mailOptions);
            res.json({ msg: 'Password reset email has been sent' });
        } catch (emailErr) {
            console.error('Failed to send reset email:', emailErr);
            res.status(500).json({ msg: 'Could not send reset email' });
        }
    } catch (err) {
        console.error('Password reset request error:', err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password
 * @access  Public
 */
router.post('/api/auth/reset-password', [
    check('token', 'Reset token is required').not().isEmpty(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('userType', 'User type is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { token, password, userType } = req.body;

    try {
        let user;
        if (userType === 'Farmer') {
            user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });
        } else if (userType === 'Company') {
            user = await Company.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });
        } else {
            return res.status(400).json({ msg: 'Invalid user type' });
        }

        if (!user) {
            return res.status(400).json({ msg: 'Invalid or expired reset token' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update password and clear reset token
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ msg: 'Password has been reset successfully' });
    } catch (err) {
        console.error('Password reset error:', err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;