/**
 * Global error handling middleware.
 * Must be the last middleware registered in server.js.
 */
const errorHandler = (err, req, res, next) => {
    // ALWAYS log the full error stack to the server console in production/dev
    console.error(`[ArguLens Error] ${req.method} ${req.url}`);
    console.error(err.stack || err);

    const status = err.status || err.statusCode || 500;
    const message =
        process.env.NODE_ENV === 'production' && status === 500
            ? 'Internal server error. Check Vercel logs for details.'
            : err.message || 'Something went wrong';

    res.status(status).json({ error: message });
};

module.exports = errorHandler;
