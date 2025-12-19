const asyncHandler = require('express-async-handler');
const Coupon = require('../models/Coupon');
const Event = require('../models/Event');

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private (Organizer)
const createCoupon = asyncHandler(async (req, res) => {
    const { code, discountPercentage, expiryDate, usageLimit, eventId } = req.body;

    const couponExists = await Coupon.findOne({ code, organizer: req.user._id });

    if (couponExists) {
        res.status(400);
        throw new Error('Coupon code already exists');
    }

    const coupon = await Coupon.create({
        organizer: req.user._id,
        code,
        discountPercentage,
        expiryDate,
        usageLimit,
        event: eventId || null,
    });

    res.status(201).json(coupon);
});

// @desc    Get organizer coupons
// @route   GET /api/coupons
// @access  Private (Organizer)
const getCoupons = asyncHandler(async (req, res) => {
    const coupons = await Coupon.find({ organizer: req.user._id }).sort({ createdAt: -1 });
    res.json(coupons);
});

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private (Organizer)
const deleteCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon && coupon.organizer.toString() === req.user._id.toString()) {
        await coupon.deleteOne();
        res.json({ message: 'Coupon removed' });
    } else {
        res.status(404);
        throw new Error('Coupon not found');
    }
});

// @desc    Validate coupon
// @route   POST /api/coupons/validate
// @access  Private (User)
const validateCoupon = asyncHandler(async (req, res) => {
    const { code, eventId } = req.body;
    const event = await Event.findById(eventId);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Find coupon (match code and organizer)
    const coupon = await Coupon.findOne({
        code: code.toUpperCase(),
        organizer: event.organizer,
        isActive: true
    });

    if (!coupon) {
        res.status(404);
        throw new Error('Invalid coupon code');
    }

    // Checks
    if (new Date() > new Date(coupon.expiryDate)) {
        res.status(400);
        throw new Error('Coupon has expired');
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
        res.status(400);
        throw new Error('Coupon usage limit reached');
    }

    // Check if linked to specific event
    if (coupon.event && coupon.event.toString() !== eventId) {
        res.status(400);
        throw new Error('Coupon not valid for this event');
    }

    res.json({
        valid: true,
        discountPercentage: coupon.discountPercentage,
        code: coupon.code
    });
});

module.exports = {
    createCoupon,
    getCoupons,
    deleteCoupon,
    validateCoupon
};
