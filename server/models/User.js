const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: {
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
            enum: ['user', 'organizer'],
            default: 'user',
        },
        phone: {
            type: String,
        },
        city: {
            type: String,
        },
        // For organizers: store business info if needed
        organizationName: {
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
            type: String, // URL to logo
        },
        profileImage: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Method to verify password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const Event = require('./Event');

// Middleware to remove events when organizer is deleted
// Note: This middleware triggers on document.remove() or document.deleteOne() if called on an instance.
// It DOES NOT trigger on User.deleteOne() or User.findByIdAndDelete() unless we use query middleware or explicitly find then remove.
// Assuming the delete controller finds user then calls user.deleteOne().
userSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    if (this.role === 'organizer') {
        await Event.deleteMany({ organizer: this._id });
    }
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
