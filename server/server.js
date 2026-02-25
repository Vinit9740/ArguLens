require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const path = require('path');
const analyzeRoutes = require('./routes/analyzeRoutes');
const historyRoutes = require('./routes/historyRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security & parsing middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for demo/local dev ease, enable for prod
}));
app.use(cors({
  origin: true, // Allow all origins for the unified build or specify production domain
  credentials: true,
  exposedHeaders: ['X-Auth-Token'],
}));
app.use(express.json({ limit: '20kb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased for typical browsing session
  message: { error: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

// Basic environment check
if (process.env.NODE_ENV === 'production') {
  const missing = [];
  if (!process.env.ACCESS_TOKEN && !process.env.VITE_ACCESS_TOKEN) missing.push('ACCESS_TOKEN');
  if (!process.env.MONGODB_URI) missing.push('MONGODB_URI');
  if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');

  if (missing.length > 0) {
    console.error(`🚨 CRITICAL: Missing production variables: ${missing.join(', ')}`);
  } else if (process.env.MONGODB_URI.includes('localhost')) {
    console.error('⚠️ WARNING: MONGODB_URI is still pointing to localhost in production! This will cause errors.');
  } else {
    console.log(`✅ Production environment configured (Auth: ${process.env.ACCESS_TOKEN ? 'Standard' : 'VITE-only'})`);
  }
}

// API Routes
app.use('/api/analyze', analyzeRoutes);
app.use('/api', historyRoutes);

// SERVE FRONTEND (Production only)
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'ArguLens API' }));

// SPA Catch-all (Must be after API routes)
app.get('*', (req, res) => {
  if (req.url.startsWith('/api')) return res.status(404).json({ error: 'Endpoint not found' });
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Error handler (must be last)
app.use(errorHandler);

// Export app for serverless environments (like Vercel)
module.exports = app;

// Only start the server if not running in a serverless environment
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('✅ Connected to MongoDB');
      app.listen(PORT, () => console.log(`🚀 ArguLens server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err.message);
      process.exit(1);
    });
} else {
  // On Vercel, we still need to initiate the MongoDB connection
  // Express handles the request lifecycle, but we connect once
  mongoose.connect(process.env.MONGODB_URI).catch(err => console.error('MongoDB Serverless Connect Error:', err));
}
