const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
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
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent user from reviewing same event twice - REMOVED to allow multiple reviews
// reviewSchema.index({ event: 1, user: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
