const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Organizer = require('../models/Organizer');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                res.status(401);
                // Don't throw error to avoid stack trace spam
                res.json({ message: 'Not authorized, user not found' });
                return;
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            if (error.message === 'Not authorized, user not found') {
                throw error;
            }
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

const organizer = (req, res, next) => {
    if (req.user && req.user.role === 'organizer') {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an organizer');
    }
};

const protectOrganizer = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await Organizer.findById(decoded.id).select('-password');

            if (!req.user) {
                res.status(401);
                res.json({ message: 'Not authorized, organizer not found' });
                return;
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

const protectUserOrOrganizer = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Try User first
            let entity = await User.findById(decoded.id).select('-password');
            if (entity) {
                req.user = entity;
                req.userType = 'user'; // Optional helper
                return next();
            }

            // Try Organizer
            entity = await Organizer.findById(decoded.id).select('-password');
            if (entity) {
                req.user = entity;
                req.userType = 'organizer';
                return next();
            }

            res.status(401);
            throw new Error('Not authorized, user/organizer not found');

        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

module.exports = { protect, organizer, protectOrganizer, protectUserOrOrganizer };
