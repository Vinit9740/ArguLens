const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');

/**
 * Session Middleware – auto-creates anonymous user sessions via JWT.
 * On first request: creates a User doc, signs a JWT, sends it back in X-Auth-Token header.
 * On subsequent requests: validates JWT and attaches req.userId.
 */
const sessionMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers['x-session-token'];

        if (authHeader) {
            // Validate existing session
            try {
                const decoded = jwt.verify(authHeader, process.env.JWT_SECRET);
                req.userId = decoded.userId;
                return next();
            } catch (_) {
                // Invalid/expired — fall through to create new session
            }
        }

        // Create a new anonymous user
        const identifier = `anon_${uuidv4()}`;
        const user = await User.create({ identifier });

        const sessionToken = jwt.sign(
            { userId: user._id, identifier },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Return token so frontend can store it
        res.setHeader('X-Auth-Token', sessionToken);
        req.userId = user._id;
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = sessionMiddleware;
