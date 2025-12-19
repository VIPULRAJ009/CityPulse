const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/citypulse');
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Define model just to access collection
        const User = mongoose.connection.collection('users');

        // List indexes
        const indexes = await User.indexes();
        console.log('Current Indexes:', indexes);

        try {
            await User.dropIndex('username_1');
            console.log('Successfully dropped index: username_1');
        } catch (error) {
            console.log('Index username_1 not found or error dropping:', error.message);
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();
