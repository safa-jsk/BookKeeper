const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const errorHandler = require('./middleware/error');
const { connectDB } = require('./config/db');
const env = require('./config/env');

connectDB();

const app = express();

// CORS configuration for both development and production
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            'http://localhost:3000',
            'https://book-keeper-470.vercel.app',
            'https://bookkeeper-0zi9.onrender.com'
        ];

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

// static files (same as before, but path relative to src/)
app.use(express.static(path.join(__dirname, '..', 'public')));

// health
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// mount /api routes
app.use('/api', routes);

// last: centralized error handler
app.use(errorHandler);

module.exports = app;
