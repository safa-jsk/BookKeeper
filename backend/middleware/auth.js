// middleware/auth.js
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User'); // adjust path if needed

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Role ranking (reader < librarian < admin)
const ROLE_ORDER = { reader: 1, librarian: 2, admin: 3 };

/**
 * Verify JWT and attach the fresh user object to req.user
 * - Accepts tokens signed with a payload containing { id } or { _id }
 * - Re-hydrates the user from DB to get the latest role/status
 */
async function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id || decoded._id;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({ error: 'Invalid token payload' });
        }

        const user = await User.findById(userId).select('_id name email role librarianApplicationStatus');
        if (!user) return res.status(401).json({ error: 'User not found' });

        req.user = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role, // 'reader' | 'librarian' | 'admin'
            librarianApplicationStatus: user.librarianApplicationStatus, // 'none' | 'pending' | 'approved' | 'rejected'
            libraryId: user.libraryId,
        };

        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

/**
 * Allow only specific roles.
 * Usage: router.post('/books', requireAuth, requireRole('librarian', 'admin'), handler)
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
 * Usage: router.get('/admin/..', requireAuth, rolesAtLeast('admin'), handler)
 *        router.post('/librarian/..', requireAuth, rolesAtLeast('librarian'), handler)
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
