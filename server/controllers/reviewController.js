const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Event = require('../models/Event');
const Booking = require('../models/Booking');

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
    const { eventId, rating, comment } = req.body;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Check if user already reviewed - REMOVED to allow multiple reviews
    // const alreadyReviewed = await Review.findOne({
    //     user: req.user._id,
    //     event: eventId
    // });
    // if (alreadyReviewed) {
    //     res.status(400);
    //     throw new Error('Event already reviewed');
    // }

    // Create review
    const review = await Review.create({
        user: req.user._id,
        event: eventId,
        rating: Number(rating),
        comment
    });

    res.status(201).json(review);
});

// @desc    Update existing review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (review) {
        // Check if user owns the review
        if (review.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('User not authorized');
        }

        review.rating = rating || review.rating;
        review.comment = comment || review.comment;

        const updatedReview = await review.save();
        res.json(updatedReview);
    } else {
        res.status(404);
        throw new Error('Review not found');
    }
});

// @desc    Get reviews for an event (Public)
// @route   GET /api/reviews/event/:eventId
// @access  Public
const getEventReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ event: req.params.eventId }).populate('user', 'name');
    res.json(reviews);
});

// @desc    Get reviews for organizer (Private)
// @route   GET /api/reviews/organizer
// @access  Private (Organizer)
const getOrganizerReviews = asyncHandler(async (req, res) => {
    // Find all events by organizer
    const events = await Event.find({ organizer: req.user._id });
    const eventIds = events.map(e => e._id);

    // Find reviews for these events
    const reviews = await Review.find({ event: { $in: eventIds } })
        .populate('user', 'name')
        .populate('event', 'title');

    res.json(reviews);
});

// @desc    Get all reviews (Public)
// @route   GET /api/reviews
// @access  Public
const getAllReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({})
        .populate('user', 'name')
        .populate('event', 'title banner')
        .sort({ createdAt: -1 });
    res.json(reviews);
});

module.exports = {
    createReview,
    getEventReviews,
    getOrganizerReviews,
    updateReview,
    getAllReviews
};
