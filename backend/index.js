const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL,  // Frontend URL (React development server)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());

// Serve static files from the 'public' directory (including images)
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Books
const bookRoutes = require('./routes/bookRoutes');
app.use('/api/books', bookRoutes);

// Auth
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Dashboard
const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);

// User
const userRoutes = require('./routes/userRoutes');
app.use('/api/user', userRoutes);

// Start the server (for local development)
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

// Export for Vercel
module.exports = app;