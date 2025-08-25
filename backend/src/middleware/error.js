// Centralized error-handling middleware
module.exports = (err, req, res, _next) => {
    // Log in dev, lighter in prod
    if (process.env.NODE_ENV !== 'test') {
        console.error(err.stack || err);
    }

    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    // Handle Joi validation errors
    if (err.isJoi || err.details) {
        return res.status(400).json({
            message: 'Validation failed',
            details: err.details?.map(d => ({
                message: d.message,
                path: d.path,
            })) || []
        });
    }

    // Default error response
    const payload = { message };

    // Show stack in dev only
    if (process.env.NODE_ENV === 'development') {
        payload.stack = err.stack;
    }

    res.status(status).json(payload);
};
