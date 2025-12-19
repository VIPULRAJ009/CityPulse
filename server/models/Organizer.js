const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const organizerSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        organizationName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            default: 'organizer', // Fixed role
        },
        phone: {
            type: String,
        },
        city: {
            type: String,
        },
        contact: {
            type: String,
        },
        socialLinks: {
            website: String,
            twitter: String,
            linkedin: String,
            instagram: String,
        },
        logo: {
            type: String,
        },
        profileImage: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

organizerSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

organizerSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Cascade delete events when organizer is deleted
organizerSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    console.log(`Cascade deleting events for organizer ${this._id}`);
    await mongoose.model('Event').deleteMany({ organizer: this._id });
    next();
});

const Organizer = mongoose.model('Organizer', organizerSchema);

module.exports = Organizer;
