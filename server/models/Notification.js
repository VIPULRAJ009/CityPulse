const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            default: 'info', // info, success, warning, error
        },
        read: {
            type: Boolean,
            default: false,
        },
        relatedId: {
            type: String, // e.g. booking ID or event ID
        }
    },
    {
        timestamps: true,
    }
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
