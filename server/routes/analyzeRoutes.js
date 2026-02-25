const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');
const sessionMiddleware = require('../middleware/sessionMiddleware');
const { analyze } = require('../controllers/analysisController');

// Multer config for voice uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('audio/')) cb(null, true);
        else cb(new Error('Only audio files are allowed'), false);
    }
});

// POST /api/analyze (Supports text in body or audio file)
router.post('/', authMiddleware, sessionMiddleware, upload.single('audio'), analyze);

module.exports = router;
