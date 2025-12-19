const mongoose = require('mongoose');

const eventSchema = mongoose.Schema(
    {
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Organizer',
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
            enum: ['Music', 'Tech', 'Sports', 'Cultural', 'Workshop', 'Seminar', 'Other'],
        },
        eventType: {
            type: String,
            required: true,
            enum: ['Offline', 'Online'],
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        venue: {
            address: { type: String },
            city: { type: String, required: true },
            location: {
                lat: { type: Number },
                lng: { type: Number },
            },
            // For online events, maybe a link
            onlineLink: { type: String },
        },
        googleMapEmbed: {
            type: String, // Stores the iframe HTML string
        },
        banner: {
            type: String, // URL to image
            required: true,
        },
        ticketType: {
            type: String,
            required: true,
            enum: ['Free', 'Paid'],
        },
        price: {
            type: Number,
            default: 0,
        },
        maxAttendees: {
            type: Number,
            required: true,
        },
        soldTickets: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['Draft', 'Published', 'Cancelled', 'Completed'],
            default: 'Draft',
        },
        gallery: [
            { type: String } // Array of image URLs
        ],
        agenda: [
            {
                time: { type: String }, // e.g., "10:00 AM"
                title: { type: String },
                description: { type: String },
            }
        ]
    },
    {
        timestamps: true,
    }
);

eventSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    console.log(`Cascade deleting bookings for event ${this._id}`);
    await this.model('Booking').deleteMany({ event: this._id });
    next();
});

// For deleteMany (triggered by Organizer deletion)
eventSchema.pre('deleteMany', async function (next) {
    try {
        const filter = this.getFilter();
        const events = await this.model.find(filter);
        const eventIds = events.map(e => e._id);

        console.log(`Cascade deleting bookings for ${eventIds.length} events`);
        await mongoose.model('Booking').deleteMany({ event: { $in: eventIds } });
        next();
    } catch (error) {
        next(error);
    }
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
