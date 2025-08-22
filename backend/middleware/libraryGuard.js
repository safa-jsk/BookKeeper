// middleware/libraryGuard.js
const Library = require('../models/Library');
const { requireAuth } = require('./auth'); // your existing auth

// Ensure the current user can manage this library (owner or manager)
function canManageLibrary() {
    return async (req, res, next) => {
        try {
            const libraryId = req.params.libraryId || req.body.libraryId || req.query.libraryId;
            if (!libraryId) return res.status(400).json({ message: 'libraryId is required' });

            const lib = await Library.findById(libraryId).select('owner managers');
            if (!lib) return res.status(404).json({ message: 'Library not found' });

            const uid = req.user.id;
            const isManager = lib.owner.toString() === uid || lib.managers.some(m => m.toString() === uid);
            if (!isManager) return res.status(403).json({ message: 'Not allowed to manage this library' });

            req.library = lib;
            next();
        } catch (e) {
            return res.status(500).json({ message: 'Guard failed' });
        }
    };
}

module.exports = { requireAuth, canManageLibrary };
