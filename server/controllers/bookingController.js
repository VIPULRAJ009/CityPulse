const asyncHandler = require('express-async-handler');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const generateTicketPDF = require('../utils/generateTicketPDF');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
    const { eventId, numberOfTickets, paymentMethod, couponCode } = req.body;
    const Coupon = require('../models/Coupon');

    const event = await Event.findById(eventId).populate('organizer', 'name email');

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // 1. Check Availability
    // Note: This is a simple check. For high concurrency, use findOneAndUpdate with condition.
    const currentSold = event.soldTickets || 0;
    if (currentSold + numberOfTickets > event.maxAttendees) {
        res.status(400);
        throw new Error(`Only ${event.maxAttendees - currentSold} seats available`);
    }

    // 2. Calculate Pricing
    let originalAmount = event.price * numberOfTickets;
    let totalAmount = originalAmount;
    let discountAmount = 0;
    let couponId = null;

    // 3. Apply Coupon if provided
    if (couponCode) {
        const coupon = await Coupon.findOne({
            code: couponCode.toUpperCase(),
            organizer: event.organizer,
            isActive: true
        });

        if (coupon) {
            // Validate Coupon (Expiry, Usage, Event Specific)
            const isValidDate = new Date() <= new Date(coupon.expiryDate);
            const isUsageLeft = coupon.usageLimit > 0 ? coupon.usedCount < coupon.usageLimit : true;
            const isEventValid = coupon.event ? coupon.event.toString() === eventId : true;

            if (isValidDate && isUsageLeft && isEventValid) {
                discountAmount = (totalAmount * coupon.discountPercentage) / 100;
                totalAmount = totalAmount - discountAmount;
                couponId = coupon._id;

                // Increment coupon usage
                coupon.usedCount += 1;
                await coupon.save();
            }
        }
    }

    // 4. Create Booking
    const paymentStatus = 'paid'; // Mock success
    const qrCode = `${event._id}-${req.user._id}-${Date.now()}`; // Base QR string

    const booking = await Booking.create({
        user: req.user._id,
        event: eventId,
        numberOfTickets,
        originalAmount,
        discountAmount,
        totalAmount,
        coupon: couponId,
        paymentStatus,
        paymentId: `mock-pid-${Date.now()}`,
        status: 'confirmed',
        qrCode,
    });

    // 5. Update Event Sold Tickets
    event.soldTickets = currentSold + numberOfTickets;
    await event.save();

    // Create Notification for Organizer
    const Notification = require('../models/Notification');
    await Notification.create({
        recipient: event.organizer,
        message: `New Booking! ${numberOfTickets} ticket(s) sold for ${event.title}. Revenue: $${totalAmount}`,
        type: 'success',
        relatedId: booking._id
    });

    // Send Emails
    const sendEmail = require('../utils/sendEmail');

    // 1. Email to User
    // 1. Email to User
    const userMessage = `
        <h1>Booking Confirmed!</h1>
        <p>Dear User,</p>
        <p>Your tickets for <strong>${event.title}</strong> have been successfully booked.</p>
        <p>Your official ticket is attached to this email.</p>
        <ul>
            <li><strong>Event:</strong> ${event.title}</li>
            <li><strong>Date:</strong> ${new Date(event.startDate).toDateString()} at ${new Date(event.startDate).toLocaleTimeString()}</li>
            <li><strong>Venue:</strong> ${event.venue.city}</li>
            <li><strong>Tickets:</strong> ${numberOfTickets}</li>
            <li><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</li>
            <li><strong>Booking ID:</strong> ${booking._id}</li>
        </ul>
        <p>Please show the attached ticket QR code at the entrance.</p>
        <p>Enjoy the event!</p>
    `;

    try {
        const pdfBuffer = await generateTicketPDF(booking, event, req.user);

        await sendEmail({
            email: req.user.email,
            subject: `Ticket Confirmation for ${event.title}`,
            message: userMessage,
            attachments: [
                {
                    filename: `CityPulse-Ticket-${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        });
    } catch (error) {
        console.error("Email to user failed:", error);
    }

    // 2. Email to Organizer
    const organizerMessage = `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h1 style="color: #4ade80;">New Registration!</h1>
            <p>Hello <strong>${event.organizer.name}</strong>,</p>
            <p><strong>${req.user.name}</strong> has successfully registered into your event <strong>"${event.title}"</strong>.</p>
            <p><strong>Tickets Sold:</strong> ${numberOfTickets}</p>
            <p><strong>Total Revenue:</strong> $${totalAmount}</p>
            <hr />
            <p>Check your dashboard for full details.</p>
        </div>
    `;

    try {
        await sendEmail({
            email: event.organizer.email,
            subject: `New Registration: ${event.title}`,
            message: organizerMessage
        });
    } catch (error) {
        console.error('Organizer email failed:', error);
        // Don't fail the request if email fails
    }
    // Need to get organizer email - event.organizer is just ID unless populated, or we fetch user
    // In step 1 we just did findById, so organizer is ID. Fetch organizer user.
    const User = require('../models/User');
    const organizer = await User.findById(event.organizer);

    if (organizer) {
        const organizerMessage = `
            <h1>New Registration</h1>
            <p>Hello ${organizer.name},</p>
            <p>User <strong>${req.user.name}</strong> has registered into your event <strong>${event.title}</strong> successfully.</p>
        `;

        try {
            await sendEmail({
                email: organizer.email,
                subject: `New Registration - ${event.title}`,
                message: organizerMessage
            });
        } catch (error) {
            console.error("Email to organizer failed:", error);
        }
    }

    res.status(201).json(booking);
});

// @desc    Get logged in user bookings
// @route   GET /api/bookings/mybookings
// @access  Private
const getMyBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id }).populate('event');
    res.json(bookings);
});

// @desc    Get bookings for an event (Organizer)
// @route   GET /api/bookings/event/:eventId
// @access  Private (Organizer)
const getEventBookings = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    if (event.organizer.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to view bookings for this event');
    }

    const bookings = await Booking.find({ event: req.params.eventId }).populate('user', 'name email');
    res.json(bookings);
});

// @desc    Get dashboard stats for organizer
// @route   GET /api/bookings/stats
// @access  Private (Organizer)
const getDashboardStats = asyncHandler(async (req, res) => {
    // 1. Get all events by this organizer
    const events = await Event.find({ organizer: req.user._id });
    const eventIds = events.map(e => e._id);

    // 2. Get all bookings for these events
    const bookings = await Booking.find({ event: { $in: eventIds } });

    // 3. Calculate stats
    const totalEvents = events.length;
    const upcomingEvents = events.filter(e => new Date(e.startDate) > new Date()).length;

    let totalSales = 0;
    let totalAttendees = 0;

    bookings.forEach(booking => {
        if (booking.status === 'confirmed') {
            totalSales += booking.totalAmount;
            totalAttendees += booking.numberOfTickets;
        }
    });

    res.json({
        totalEvents,
        totalSales,
        totalAttendees,
        upcomingEvents
    });
});

// @desc    Get ALL bookings for organizer's events
// @route   GET /api/bookings/organizer
// @access  Private (Organizer)
const getAllOrganizerBookings = asyncHandler(async (req, res) => {
    const events = await Event.find({ organizer: req.user._id });
    const eventIds = events.map(e => e._id);

    const bookings = await Booking.find({ event: { $in: eventIds } })
        .populate('user', 'name email')
        .populate('event', 'title startDate')
        .populate('coupon', 'code discountPercentage')
        .sort({ createdAt: -1 });

    res.json(bookings);
});

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id).populate('event');

    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }

    // Check user ownership
    if (booking.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to cancel this booking');
    }

    // Check if trainable
    if (booking.status === 'cancelled') {
        res.status(400);
        throw new Error('Booking is already cancelled');
    }

    // Check if event has already started (simple policy)
    if (new Date(booking.event.startDate) < new Date()) {
        res.status(400);
        throw new Error('Cannot cancel past events');
    }

    // Update Booking Status
    booking.status = 'cancelled';
    await booking.save();

    // Decrease sold tickets count for the event
    const event = await Event.findById(booking.event._id);
    if (event) {
        event.soldTickets = Math.max(0, event.soldTickets - booking.numberOfTickets);
        await event.save();
    }

    // Create notification for organizer
    const Notification = require('../models/Notification');
    await Notification.create({
        recipient: event.organizer,
        message: `Booking Cancelled for ${event.title}. User: ${req.user.name}`,
        type: 'info', // or warning
        relatedId: booking._id
    });

    // Send Email to Organizer
    try {
        const User = require('../models/User');
        // event.organizer is an ID because we only populated 'event' in the booking find, 
        // and event's organizer field is an ObjectId ref.
        const organizer = await User.findById(event.organizer);

        if (organizer) {
            const sendEmail = require('../utils/sendEmail');
            const message = `
                <h1>Booking Cancelled</h1>
                <p>Hello ${organizer.name},</p>
                <p>A user has cancelled their booking for your event <strong>${event.title}</strong>.</p>
                <ul>
                     <li><strong>User:</strong> ${req.user.name} (${req.user.email})</li>
                     <li><strong>Tickets Cancelled:</strong> ${booking.numberOfTickets}</li>
                     <li><strong>Refund Amount (if applicable):</strong> $${booking.totalAmount.toFixed(2)}</li>
                </ul>
            `;

            await sendEmail({
                email: organizer.email,
                subject: `Ticket Cancellation - ${event.title}`,
                message
            });
        }
    } catch (error) {
        console.error("Failed to send cancellation email to organizer:", error);
        // Continue execution, don't fail the request just because email failed
    }

    res.json(booking);
});

// @desc    Delete a booking (User only if cancelled)
// @route   DELETE /api/bookings/:id
// @access  Private
const deleteBooking = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }

    // Check user ownership
    if (booking.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to delete this booking');
    }

    // Check if cancelled
    if (booking.status !== 'cancelled') {
        res.status(400);
        throw new Error('Only cancelled bookings can be deleted');
    }

    await booking.deleteOne();

    res.json({ message: 'Booking removed' });
});

module.exports = {
    createBooking,
    getMyBookings,
    getEventBookings,
    getDashboardStats,
    getAllOrganizerBookings,
    cancelBooking,
    deleteBooking
};
