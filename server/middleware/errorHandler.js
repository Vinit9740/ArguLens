/**
 * Global error handling middleware.
 * Must be the last middleware registered in server.js.
 */
const errorHandler = (err, req, res, next) => {
    console.error('[ArguLens Error]', err.message || err);

    const status = err.status || err.statusCode || 500;
    const message =
        process.env.NODE_ENV === 'production' && status === 500
            ? 'Internal server error'
            : err.message || 'Something went wrong';

    res.status(status).json({ error: message });
};

module.exports = errorHandler;
