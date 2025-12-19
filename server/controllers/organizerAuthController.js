const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const Organizer = require('../models/Organizer');

// @desc    Register new organizer
// @route   POST /api/organizer/register
// @access  Public
const registerOrganizer = asyncHandler(async (req, res) => {
    const { name, email, password, organizationName, city, phone } = req.body;

    if (!name || !email || !password || !organizationName) {
        res.status(400);
        throw new Error('Please add all required fields');
    }

    const organizerExists = await Organizer.findOne({ email });

    if (organizerExists) {
        res.status(400);
        throw new Error('Organizer already exists');
    }

    const organizer = await Organizer.create({
        name,
        email,
        password,
        organizationName,
        city,
        phone,
    });

    if (organizer) {
        res.status(201).json({
            _id: organizer.id,
            name: organizer.name,
            email: organizer.email,
            organizationName: organizer.organizationName,
            role: organizer.role,
            token: generateToken(organizer._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid organizer data');
    }
});

// @desc    Authenticate organizer
// @route   POST /api/organizer/login
// @access  Public
const loginOrganizer = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const organizer = await Organizer.findOne({ email });

    if (organizer && (await organizer.matchPassword(password))) {
        res.json({
            _id: organizer.id,
            name: organizer.name,
            email: organizer.email,
            organizationName: organizer.organizationName,
            role: organizer.role,
            logo: organizer.logo,
            token: generateToken(organizer._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid credentials');
    }
});

// @desc    Update organizer profile
// @route   PUT /api/organizer/profile
// @access  Private
const updateOrganizerProfile = asyncHandler(async (req, res) => {
    const organizer = await Organizer.findById(req.user._id);

    if (organizer) {
        organizer.name = req.body.name || organizer.name;
        organizer.email = req.body.email || organizer.email;
        organizer.organizationName = req.body.organizationName || organizer.organizationName;
        organizer.phone = req.body.phone || organizer.phone;
        organizer.city = req.body.city || organizer.city;
        organizer.contact = req.body.contact || organizer.contact;
        organizer.logo = req.body.logo || organizer.logo;
        organizer.profileImage = req.body.profileImage || organizer.profileImage;
        organizer.socialLinks = req.body.socialLinks || organizer.socialLinks;

        if (req.body.password) {
            organizer.password = req.body.password;
        }

        const updatedOrganizer = await organizer.save();

        res.json({
            _id: updatedOrganizer._id,
            name: updatedOrganizer.name,
            email: updatedOrganizer.email,
            organizationName: updatedOrganizer.organizationName,
            role: updatedOrganizer.role,
            logo: updatedOrganizer.logo,
            profileImage: updatedOrganizer.profileImage,
            contact: updatedOrganizer.contact,
            socialLinks: updatedOrganizer.socialLinks,
            token: generateToken(updatedOrganizer._id),
        });
    } else {
        res.status(404);
        throw new Error('Organizer not found');
    }
});

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Delete organizer profile (and cascade delete events)
// @route   DELETE /api/organizer/profile
// @access  Private
const deleteOrganizerProfile = asyncHandler(async (req, res) => {
    const organizer = await Organizer.findById(req.user._id);

    if (organizer) {
        await organizer.deleteOne(); // Triggers pre('deleteOne') hook for cascade
        res.json({ message: 'Organizer removed' });
    } else {
        res.status(404);
        throw new Error('Organizer not found');
    }
});

module.exports = {
    registerOrganizer,
    loginOrganizer,
    updateOrganizerProfile,
    deleteOrganizerProfile,
};
