const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const sessionMiddleware = require('../middleware/sessionMiddleware');
const { getHistory, getStats } = require('../controllers/historyController');

// GET /api/history
router.get('/history', authMiddleware, sessionMiddleware, getHistory);

// GET /api/stats
router.get('/stats', authMiddleware, sessionMiddleware, getStats);

module.exports = router;
