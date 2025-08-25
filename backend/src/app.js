const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const errorHandler = require('./middleware/error');
const { connectDB } = require('./config/db');
const env = require('./config/env');

connectDB();

const app = express();

app.use(cors({
    origin: env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

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
