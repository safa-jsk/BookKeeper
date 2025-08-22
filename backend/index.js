const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const ensureAdmin = require('./bootstrap/ensureAdmin');
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL,  // Frontend URL (React development server)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
}));
app.use(express.json());

// Serve static files from the 'public' directory (including images)
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    await ensureAdmin();
    app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
  })
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

// User (Reader)
const userRoutes = require('./routes/userRoutes');
app.use('/api/user', userRoutes);

// Librarian
const librarianRoutes = require('./routes/librarianApply');
app.use('/api/librarian', librarianRoutes);

// Admin
const adminLibrarianReview = require('./routes/adminLibrarianReview');
app.use('/api/admin', adminLibrarianReview);

// Inventory
const librarianInventoryRoutes = require('./routes/librarianInventory');
app.use('/api/librarian', librarianInventoryRoutes);

// Cart
const cartRoutes = require('./routes/cartRoutes');
app.use('/api/cart', cartRoutes);

// Requests
const requestRoutes = require('./routes/requestRoutes');
app.use('/api/requests', requestRoutes);

// Start the server (for local development)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

// Export for Vercel
module.exports = app;