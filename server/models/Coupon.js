const mongoose = require('mongoose');

const couponSchema = mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },
        discountPercentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Organizer',
        },
        // Optional: Link to specific event, if null applies to all organizer's events
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            default: null
        },
        expiryDate: {
            type: Date,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        usageLimit: {
            type: Number,
            default: 100, // Max times this coupon can be used
        },
        usedCount: {
            type: Number,
            default: 0,
        }
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure unique codes per organizer
couponSchema.index({ code: 1, organizer: 1 }, { unique: true });

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;
