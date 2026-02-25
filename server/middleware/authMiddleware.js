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
    const expectedToken = process.env.ACCESS_TOKEN || process.env.VITE_ACCESS_TOKEN;

    if (token !== expectedToken) {
        console.warn(`[Auth] Token mismatch! 
            Expected Snippet: ${String(expectedToken).substring(0, 5)}...
            Received Snippet: ${String(token).substring(0, 5)}...
            Expected Length: ${expectedToken?.length}
            Received Length: ${token?.length}
            Expected Key Source: ${process.env.ACCESS_TOKEN ? 'ACCESS_TOKEN' : (process.env.VITE_ACCESS_TOKEN ? 'VITE_ACCESS_TOKEN' : 'NONE')}
        `);
        return res.status(401).json({
            error: 'Unauthorized. Invalid access token.',
            details: 'The token provided by the frontend does not match the server-side ACCESS_TOKEN. Please ensure BOTH ACCESS_TOKEN and VITE_ACCESS_TOKEN are set and identical in Vercel.'
        });
    }

    next();
};

module.exports = authMiddleware;
