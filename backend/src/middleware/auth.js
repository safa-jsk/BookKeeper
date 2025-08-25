// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const env = require('../config/env');
const User = require('../models/User');

// Role ranking (reader < librarian < admin)
const ROLE_ORDER = { reader: 1, librarian: 2, admin: 3 };

// Extract bearer token from header or x-access-token
function getToken(req) {
    const h = req.headers.authorization || '';
    if (h.startsWith('Bearer ')) return h.slice(7);
    return req.headers['x-access-token'] || null;
}

/**
 * Verify JWT and attach a fresh user snapshot to req.user.
 * Token payload must contain { id } (or legacy { _id }).
 */
async function requireAuth(req, res, next) {
    const token = getToken(req);
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        const userId = decoded.id || decoded._id;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({ error: 'Invalid token payload' });
        }

        const user = await User.findById(userId)
            .select('_id firstName lastName email role librarianApplicationStatus')
            .lean();

        if (!user) return res.status(401).json({ error: 'User not found' });

        // Attach only what downstream needs
        req.user = {
            id: user._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role, // 'reader' | 'librarian' | 'admin'
            librarianApplicationStatus: user.librarianApplicationStatus, // 'none' | 'pending' | 'approved' | 'rejected'
        };

        return next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

/**
 * Allow only specific roles.
 * Usage: router.post(..., requireAuth, requireRole('librarian','admin'), handler)
 */
function requireRole(...allowed) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        if (!allowed.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        next();
    };
}

/**
 * Allow roles at or above a minimum rank.
 * Usage: router.get(..., requireAuth, rolesAtLeast('admin'), handler)
 */
function rolesAtLeast(minRole) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const userRank = ROLE_ORDER[req.user.role] ?? 0;
        const minRank = ROLE_ORDER[minRole] ?? Infinity;
        if (userRank < minRank) return res.status(403).json({ error: 'Forbidden' });
        next();
    };
}

// Convenience alias
const requireAdmin = rolesAtLeast('admin');

module.exports = {
    requireAuth,
    requireRole,
    rolesAtLeast,
    requireAdmin,
};
