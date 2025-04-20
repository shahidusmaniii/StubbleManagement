const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const config = require('config');
const User = require('../models/User');
const Company = require('../models/Company');
const Admin = require('../models/Admin');
const service = require('../models/Service');
const AuctionModel = require('../models/Auction');
const ClearedList = require('../models/ClearedList');
const { encryption } = require('../middleware/hasing');
const { check, validationResult } = require('express-validator/check');
const RoomModel = require('../models/AuctionRoom');

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (user) {
            return res.json({
                user,
                userType: 'Farmer'
            });
        }

        const company = await Company.findById(req.user.id).select('-password');
        if (company) {
            return res.json({
                user: company,
                userType: 'Company'
            });
        }

        const admin = await Admin.findById(req.user.id).select('-password');
        if (admin) {
            return res.json({
                user: admin,
                userType: 'Admin'
            });
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
router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
    check('userType', 'User type is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, userType } = req.body;

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
        } else {
            return res.status(400).json({ msg: 'Invalid user type' });
        }

        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = {
            user: {
                id: user.id,
                type: userType
            }
        };

        jwt.sign(
            payload,
            config.get('jwtToken'),
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
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
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

/**
 * @route   POST /api/auth/register
 * @desc    Register a user
 * @access  Public
 */
router.post('/register', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('mobileNo', 'Mobile number is required').not().isEmpty(),
    check('userType', 'User type is required').exists()
], encryption, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, mobileNo, userType } = req.body;

    try {
        // Check for existing user across all collections
        const farmerExists = await User.findOne({ email });
        const companyExists = await Company.findOne({ email });
        const adminExists = await Admin.findOne({ email });

        if (farmerExists || companyExists || adminExists) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        let newUser;

        // Create the appropriate user type
        if (userType === 'Farmer') {
            newUser = await User.create({
                name,
                mobileNo,
                email,
                password
            });
        } else if (userType === 'Company') {
            newUser = await Company.create({
                name,
                mobileNo,
                email,
                password
            });
        } else if (userType === 'Admin') {
            newUser = await Admin.create({
                name,
                mobileNo,
                email,
                password
            });
        } else {
            return res.status(400).json({ msg: 'Invalid user type' });
        }

        if (newUser) {
            const payload = {
                user: {
                    id: newUser.id,
                    type: userType
                }
            };

            jwt.sign(
                payload,
                config.get('jwtToken'),
                { expiresIn: 360000 },
                (err, token) => {
                    if (err) throw err;
                    res.json({
                        token,
                        user: {
                            id: newUser.id,
                            name: newUser.name,
                            email: newUser.email,
                            type: userType
                        }
                    });
                }
            );
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user / clear session
 * @access  Private
 */
router.post('/logout', auth, (req, res) => {
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
router.post('/services', auth, async (req, res) => {
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
router.get('/services', auth, async (req, res) => {
    try {
        const services = await service.find();
        res.json(services);
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
router.delete('/services/:email', auth, async (req, res) => {
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
router.post('/rooms', auth, async (req, res) => {
    try {
        const roomExists = await RoomModel.findOne({ name: req.body.name });

        if (roomExists) {
            return res.status(400).json({ success: false, msg: 'Room with that name already exists' });
        }

        const room = await RoomModel.create({
            name: req.body.name,
            description: req.body.description,
            code: req.body.code,
            startBid: req.body.startBid,
            startDate: req.body.startDate,
            endDate: req.body.endDate
        });

        if (room) {
            // Create initial bid by admin
            const initialBid = await AuctionModel.create({
                bid: req.body.startBid,
                room: req.body.code,
                user: "Admin"
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
 * @desc    Get all active auction rooms and service requests
 * @access  Private
 */
router.get('/rooms', auth, async (req, res) => {
    try {
        // Get current date and time
        const currentDate = new Date();

        // Get active rooms (end date is in the future)
        const rooms = await RoomModel.find({ endDate: { $gt: currentDate } });

        res.json({ rooms });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

/**
 * @route   GET /api/dashboard
 * @desc    Get dashboard data (admin)
 * @access  Private (Admin only)
 */
router.get('/dashboard', auth, async (req, res) => {
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

module.exports = router;