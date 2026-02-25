const mongoose = require('mongoose');

// Disable buffering so we get real errors immediately instead of 10s timeouts
mongoose.set('bufferCommands', false);

let cachedPromise = null;

async function connectToDatabase() {
    if (cachedPromise) {
        return cachedPromise;
    }

    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('📡 Attempting new MongoDB connection...');

    cachedPromise = mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000, // Fail fast if IP is not whitelisted
    }).then((m) => {
        console.log('✅ MongoDB connected successfully');
        return m;
    }).catch((err) => {
        console.error('❌ MongoDB Connection Error:', err.message);
        cachedPromise = null; // Reset on failure so next request can retry
        throw err;
    });

    return cachedPromise;
}

module.exports = connectToDatabase;
