const dotenv = require('dotenv');
const Joi = require('joi');

// Load .env
dotenv.config();

// Define schema for all env vars you care about
const envSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
    PORT: Joi.number().default(5000),
    MONGO_URI: Joi.string().uri().required(),
    FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
    JWT_SECRET: Joi.string().min(10).required(),
    // Add any others: e.g. CLOUDINARY_URL, STRIPE_SECRET_KEY, etc.
}).unknown(true); // allow extra vars

// Validate process.env
const { value: env, error } = envSchema.validate(process.env);
if (error) {
    throw new Error(`❌ Env validation error: ${error.message}`);
}

// Export normalized env object
module.exports = env;
