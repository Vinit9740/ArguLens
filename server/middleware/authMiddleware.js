/**
 * Auth Middleware – validates static Bearer token from Authorization header.
 * No login required; token is pre-configured in .env and attached by frontend.
 */
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized. Missing or malformed Authorization header.' });
    }

    const token = authHeader.split(' ')[1];

    if (token !== process.env.ACCESS_TOKEN) {
        return res.status(401).json({
            error: 'Unauthorized. Invalid access token.',
            details: 'The token provided by the frontend does not match the server-side ACCESS_TOKEN. Please check your Vercel Environment Variables.'
        });
    }

    next();
};

module.exports = authMiddleware;
