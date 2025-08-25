// Flexible Joi validator middleware.
// Usage:
//   validate(schema)                      -> validates req.body
//   validate(schema, 'query')             -> validates req.query
//   validate(schema, 'params')            -> validates req.params
//   validate({ body, query, params })     -> validates multiple at once
//
// Optional 3rd arg = Joi options override, e.g. { stripUnknown: false }
module.exports = (schema, source = 'body', options = {}) => {
    const defaultOpts = { abortEarly: false, stripUnknown: true, convert: true };

    // Multi-source mode: schema is an object like { body, query, params }
    if (typeof schema === 'object' && (schema.body || schema.query || schema.params) && source === 'body') {
        return async (req, res, next) => {
            try {
                if (schema.body) req.body = await schema.body.validateAsync(req.body, { ...defaultOpts, ...options });
                if (schema.query) req.query = await schema.query.validateAsync(req.query, { ...defaultOpts, ...options });
                if (schema.params) req.params = await schema.params.validateAsync(req.params, { ...defaultOpts, ...options });
                return next();
            } catch (err) {
                return res.status(400).json({
                    message: 'Validation failed',
                    details: err.details?.map(d => ({ message: d.message, path: d.path })) || []
                });
            }
        };
    }

    // Single-source mode
    return async (req, res, next) => {
        try {
            const data =
                source === 'query' ? req.query :
                    source === 'params' ? req.params :
                        req.body;

            const value = await schema.validateAsync(data, { ...defaultOpts, ...options });

            if (source === 'query') req.query = value;
            else if (source === 'params') req.params = value;
            else req.body = value;

            return next();
        } catch (err) {
            return res.status(400).json({
                message: 'Validation failed',
                details: err.details?.map(d => ({ message: d.message, path: d.path })) || []
            });
        }
    };
};
