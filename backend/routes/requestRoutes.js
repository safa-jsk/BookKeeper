// routes/requestRoutes.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { canManageLibrary } = require('../middleware/libraryGuard');
const Request = require('../models/Request');
const Inventory = require('../models/Inventory');

// User creates a request to a specific library (subset of their cart items)
// POST /api/requests
// body: { libraryId, items: [{ bookId, quantity }] }
router.post('/', requireAuth, async (req, res) => {
    const { libraryId, items } = req.body;
    if (!libraryId || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'libraryId and items are required' });
    }
    for (const it of items) {
        if (!it.bookId || !it.quantity || it.quantity <= 0) {
            return res.status(400).json({ message: 'Each item needs bookId and quantity > 0' });
        }
    }

    const doc = await Request.create({
        user: req.user.id,
        library: libraryId,
        items: items.map(x => ({ book: x.bookId, quantity: Number(x.quantity) })),
        status: 'pending'
    });

    res.status(201).json(doc);
});

// Librarian sees requests for their library
// GET /api/librarian/:libraryId/requests?status=pending
router.get('/librarian/:libraryId/requests', requireAuth, requireRole('librarian', 'admin'), canManageLibrary(), async (req, res) => {
    const { status = 'pending' } = req.query;
    const list = await Request.find({ library: req.params.libraryId, status })
        .populate('user', 'firstName lastName email')
        .populate('items.book', 'title author isbn');
    res.json(list);
});

// Approve a request: decrement stock atomically (transaction)
// PATCH /api/librarian/:libraryId/requests/:id/approve
router.patch('/librarian/:libraryId/requests/:id/approve', requireAuth, requireRole('librarian', 'admin'), canManageLibrary(), async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const reqDoc = await Request.findOne({ _id: req.params.id, library: req.params.libraryId }).session(session);
        if (!reqDoc) {
            await session.abortTransaction(); session.endSession();
            return res.status(404).json({ message: 'Request not found' });
        }
        if (reqDoc.status !== 'pending') {
            await session.abortTransaction(); session.endSession();
            return res.status(400).json({ message: `Request already ${reqDoc.status}` });
        }

        // Check and decrement stock for each item
        for (const item of reqDoc.items) {
            const inv = await Inventory.findOne({ library: reqDoc.library, book: item.book }).session(session);
            if (!inv || inv.stock < item.quantity) {
                await session.abortTransaction(); session.endSession();
                return res.status(400).json({ message: 'Insufficient stock for one or more items' });
            }
        }
        for (const item of reqDoc.items) {
            const inv = await Inventory.findOne({ library: reqDoc.library, book: item.book }).session(session);
            inv.stock -= item.quantity;
            inv.lastUpdatedAt = new Date();
            await inv.save({ session });
        }

        reqDoc.status = 'approved';
        reqDoc.decidedBy = req.user.id;
        reqDoc.decidedAt = new Date();
        await reqDoc.save({ session });

        await session.commitTransaction(); session.endSession();
        res.json(reqDoc);
    } catch (e) {
        await session.abortTransaction(); session.endSession();
        res.status(500).json({ message: 'Approval failed' });
    }
});

// Reject request
// PATCH /api/librarian/:libraryId/requests/:id/reject
router.patch('/librarian/:libraryId/requests/:id/reject', requireAuth, requireRole('librarian', 'admin'), canManageLibrary(), async (req, res) => {
    const reqDoc = await Request.findOne({ _id: req.params.id, library: req.params.libraryId });
    if (!reqDoc) return res.status(404).json({ message: 'Request not found' });
    if (reqDoc.status !== 'pending') return res.status(400).json({ message: `Request already ${reqDoc.status}` });

    reqDoc.status = 'rejected';
    reqDoc.decidedBy = req.user.id;
    reqDoc.decidedAt = new Date();
    reqDoc.note = req.body.note || reqDoc.note;
    await reqDoc.save();

    res.json(reqDoc);
});

module.exports = router;
