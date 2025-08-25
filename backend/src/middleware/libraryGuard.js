const mongoose = require('mongoose');
const Library = require('../models/Library');

// Middleware: ensure the current user can manage this library
function canManageLibrary() {
    return async (req, res, next) => {
        try {
            const libraryId = req.params.libraryId; // safer: only from params
            if (!libraryId || !mongoose.Types.ObjectId.isValid(libraryId)) {
                return res.status(400).json({ message: 'Valid libraryId is required' });
            }

            const lib = await Library.findById(libraryId).select('owner managers');
            if (!lib) return res.status(404).json({ message: 'Library not found' });

            const uid = req.user.id;
            const isManager =
                lib.owner.toString() === uid ||
                lib.managers.some(m => m.toString() === uid);

            if (!isManager) {
                return res.status(403).json({ message: 'Not allowed to manage this library' });
            }

            req.library = lib; // attach for downstream use
            next();
        } catch (err) {
            console.error('libraryGuard error:', err);
            res.status(500).json({ message: 'Authorization guard failed' });
        }
    };
}

module.exports = { canManageLibrary };
