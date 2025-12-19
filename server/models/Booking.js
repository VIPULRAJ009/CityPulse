const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        event: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Event',
        },
        numberOfTickets: {
            type: Number,
            required: true,
            default: 1,
        },
        totalAmount: {
            type: Number,
            required: true,
            default: 0.0,
        },
        originalAmount: {
            type: Number,
        },
        discountAmount: {
            type: Number,
            default: 0,
        },
        coupon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Coupon',
        },
        paymentStatus: {
            type: String,
            // 'pending' if we implement real payment flow separately, 'paid' for mock
            enum: ['pending', 'paid', 'failed'],
            default: 'pending',
        },
        paymentId: {
            type: String,
        },
        status: {
            type: String,
            enum: ['confirmed', 'cancelled'],
            default: 'confirmed',
        },
        qrCode: {
            type: String, // could be a data URI or a unique string code
        },
    },
    {
        timestamps: true,
    }
);

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
