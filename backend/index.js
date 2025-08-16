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
const bookRoutes = require('./api/bookRoutes');
app.use('/api/books', bookRoutes);

// Auth
const authRoutes = require('./api/authRoutes');
app.use('/api/auth', authRoutes);

// Dashboard
const dashboardRoutes = require('./api/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);

// User
const userRoutes = require('./api/userRoutes');
app.use('/api/user', userRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));