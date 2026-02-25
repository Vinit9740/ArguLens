const mongoose = require('mongoose');

let cachedConnection = null;

async function connectToDatabase() {
    if (cachedConnection) {
        return cachedConnection;
    }

    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Connect if no cached connection exists
    try {
        const opts = {
            bufferCommands: true, // Keep buffering enabled but handle it via await
            serverSelectionTimeoutMS: 15000,
        };

        cachedConnection = await mongoose.connect(process.env.MONGODB_URI, opts);
        console.log('✅ MongoDB connected successfully');
        return cachedConnection;
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        cachedConnection = null;
        throw err;
    }
}

module.exports = connectToDatabase;
