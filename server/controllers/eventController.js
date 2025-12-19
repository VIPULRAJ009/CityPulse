const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    // Filter logic can be expanded here
    const keyword = req.query.keyword ? {
        title: {
            $regex: req.query.keyword,
            $options: 'i',
        },
    } : {};

    // Category filter
    const category = req.query.category ? { category: req.query.category } : {};

    // Time filter
    let timeFilter = {};
    const now = new Date();

    if (req.query.time === 'past') {
        // Events that have ended
        timeFilter = { endDate: { $lt: now } };
    } else if (req.query.time === 'current') {
        // Events currently happening (Start <= now AND End >= now)
        timeFilter = {
            startDate: { $lte: now },
            endDate: { $gte: now }
        };
    } else {
        // Default: Upcoming (Start > now)
        // If you want "Available" (including current), you could use endDate > now.
        // But usually "Upcoming" implies future start. User wants explicit distinction.
        timeFilter = { startDate: { $gt: now } };
    }

    // Allow override to show ALL if needed? For now strict upcoming vs past.
    // If request has no time param, currently defaults to upcoming.

    const count = await Event.countDocuments({ status: 'Published', ...keyword, ...category, ...timeFilter });
    const events = await Event.find({ status: 'Published', ...keyword, ...category, ...timeFilter })
        .populate('organizer', 'name email logo organizationName')
        .limit(limit)
        .skip(skip)
        .sort({ startDate: req.query.time === 'past' ? -1 : 1 }); // Past: newest first, Upcoming: soonest first

    res.json({ events, page, pages: Math.ceil(count / limit) });
});

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email');

    if (event) {
        res.json(event);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Organizer)
const createEvent = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        category,
        eventType,
        startDate,
        endDate,
        venue,
        banner,
        ticketType,
        price,
        maxAttendees,
        status,
        googleMapEmbed
    } = req.body;

    const event = new Event({
        organizer: req.user._id,
        title,
        description,
        category,
        eventType,
        startDate,
        endDate,
        venue,
        banner,
        ticketType,
        price,
        maxAttendees,
        status: status || 'Draft',
        googleMapEmbed
    });

    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
});

// @desc    Get organizer events
// @route   GET /api/events/myevents
// @access  Private (Organizer)
const getMyEvents = asyncHandler(async (req, res) => {
    const events = await Event.find({ organizer: req.user._id });
    res.json(events);
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Organizer)
const updateEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event) {
        if (event.organizer.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to update this event');
        }

        event.title = req.body.title || event.title;
        event.description = req.body.description || event.description;
        event.category = req.body.category || event.category;
        event.eventType = req.body.eventType || event.eventType;
        event.startDate = req.body.startDate || event.startDate;
        event.endDate = req.body.endDate || event.endDate;
        event.venue = req.body.venue || event.venue;
        event.banner = req.body.banner || event.banner;
        event.ticketType = req.body.ticketType || event.ticketType;
        event.price = req.body.price !== undefined ? req.body.price : event.price;
        event.maxAttendees = req.body.maxAttendees || event.maxAttendees;
        event.status = req.body.status || event.status;
        event.googleMapEmbed = req.body.googleMapEmbed || event.googleMapEmbed;

        const updatedEvent = await event.save();
        res.json(updatedEvent);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Organizer)
const deleteEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event) {
        if (event.organizer.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to delete this event');
        }

        await event.deleteOne();
        res.json({ message: 'Event removed' });
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc    Cleanup orphan events (no valid organizer)
// @route   DELETE /api/events/orphans
// @access  Public (should be Admin/Private in prod, Public for fix)
const cleanupOrphanEvents = asyncHandler(async (req, res) => {
    const events = await Event.find({});
    let deletedCount = 0;
    const User = require('../models/User');

    for (const event of events) {
        // user id is stored in event.organizer
        // Check if user exists
        const user = await User.findById(event.organizer);
        if (!user) {
            await event.deleteOne();
            deletedCount++;
        }
    }

    res.json({ message: `Cleanup complete. Removed ${deletedCount} orphan events.` });
});

module.exports = {
    getEvents,
    getEventById,
    createEvent,
    getMyEvents,
    updateEvent,
    deleteEvent,
    cleanupOrphanEvents
};
