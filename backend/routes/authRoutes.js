const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Register route
router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password, gender, dob, city } = req.body;
    if (!firstName || !lastName || !email || !password || !gender || !dob || !city) {
        return res.status(400).json({ error: 'Please fill out all fields.' });
    }
    try {
        // Check for duplicate email
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Email already exists.' });

        const user = new User({ firstName, lastName, email, password, gender, dob, city });
        await user.save();
        res.json({ message: 'User registered successfully!' });
    } catch (err) {
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // You may want to send some user info to the frontend:
        const userInfo = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            city: user.city,
            gender: user.gender
        };
        const token = jwt.sign({ id: user._id, ...userInfo }, JWT_SECRET, { expiresIn: '2h' });
        res.json({ token, user: userInfo });
    } catch (err) {
        res.status(500).json({ error: 'Login failed' });
    }
});


module.exports = router;
