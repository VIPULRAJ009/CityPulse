const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, city, organizationName, phone } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role: role || 'user',
        city,
        phone,
        organizationName: role === 'organizer' ? organizationName : undefined,
    });

    if (user) {
        // Mock SMS
        if (phone) {
            console.log(`[SMS-STUB] Sending confirmation to ${phone}: Thank you for visiting CityPulse!`);
        }

        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            city: user.city,
            phone: user.phone,
            profileImage: user.profileImage,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            city: user.city,
            phone: user.phone,
            role: user.role,
            profileImage: user.profileImage,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid credentials');
    }
});

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.city = req.body.city || user.city;
        user.phone = req.body.phone || user.phone;

        if (req.body.password) {
            user.password = req.body.password;
        }
        user.organizationName = req.body.organizationName || user.organizationName;
        user.contact = req.body.contact || user.contact;
        user.socialLinks = req.body.socialLinks || user.socialLinks;
        user.socialLinks = req.body.socialLinks || user.socialLinks;
        user.logo = req.body.logo || user.logo;
        user.profileImage = req.body.profileImage || user.profileImage;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            city: updatedUser.city,
            phone: updatedUser.phone,
            organizationName: updatedUser.organizationName,
            contact: updatedUser.contact,
            socialLinks: updatedUser.socialLinks,
            socialLinks: updatedUser.socialLinks,
            logo: updatedUser.logo,
            profileImage: updatedUser.profileImage,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Delete user profile (and cascade delete events if organizer)
// @route   DELETE /api/auth/profile
// @access  Private
const deleteUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        await user.deleteOne(); // Triggers pre('deleteOne') hook for cascade
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
    registerUser,
    loginUser,
    updateUserProfile,
    deleteUserProfile
};
