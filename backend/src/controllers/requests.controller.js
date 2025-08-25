const mongoose = require('mongoose');
const Request = require('../models/Request');
const Inventory = require('../models/Inventory');

/** POST /api/requests
 * body: { libraryId, items: [{ bookId, quantity }] }
 */
exports.create = async (req, res, next) => {
    try {
        const { libraryId, items } = req.body;

        const doc = await Request.create({
            user: req.user.id,
            library: libraryId,
            items: items.map(x => ({ book: x.bookId, quantity: Number(x.quantity) })),
            status: 'pending',
        });

        res.status(201).json(doc);
    } catch (e) { next(e); }
};

/** GET /api/requests/librarian/:libraryId/requests?status=... */
exports.listForLibrary = async (req, res, next) => {
    try {
        const { status = 'pending' } = req.query;
        const list = await Request.find({ library: req.params.libraryId, status })
            .populate('user', 'firstName lastName email')
            .populate('items.book', 'title author isbn');
        res.json(list);
    } catch (e) { next(e); }
};

/** PATCH /api/requests/librarian/:libraryId/requests/:id/approve
 * - decrements stock atomically in a transaction
 */
exports.approve = async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            const reqDoc = await Request.findOne({
                _id: req.params.id,
                library: req.params.libraryId,
            }).session(session);

            if (!reqDoc) throw Object.assign(new Error('Request not found'), { status: 404 });
            if (reqDoc.status !== 'pending') {
                throw Object.assign(new Error(`Request already ${reqDoc.status}`), { status: 400 });
            }

            // Validate stock for all items first
            for (const item of reqDoc.items) {
                const inv = await Inventory.findOne({
                    library: reqDoc.library,
                    book: item.book,
                }).session(session);

                if (!inv || inv.stock < item.quantity) {
                    throw Object.assign(new Error('Insufficient stock for one or more items'), { status: 400 });
                }
            }

            // Decrement stock
            for (const item of reqDoc.items) {
                const inv = await Inventory.findOne({
                    library: reqDoc.library,
                    book: item.book,
                }).session(session);

                inv.stock -= item.quantity;
                inv.lastUpdatedAt = new Date();
                await inv.save({ session });
            }

            // Finalize request
            reqDoc.status = 'approved';
            reqDoc.decidedBy = req.user.id;
            reqDoc.decidedAt = new Date();
            await reqDoc.save({ session });

            res.json(reqDoc);
        });
    } catch (e) {
        // If we threw with a status above, send that; otherwise 500
        if (e.status) return res.status(e.status).json({ message: e.message });
        next(e);
    } finally {
        session.endSession();
    }
};

/** PATCH /api/requests/librarian/:libraryId/requests/:id/reject */
exports.reject = async (req, res, next) => {
    try {
        const reqDoc = await Request.findOne({
            _id: req.params.id,
            library: req.params.libraryId,
        });

        if (!reqDoc) return res.status(404).json({ message: 'Request not found' });
        if (reqDoc.status !== 'pending') {
            return res.status(400).json({ message: `Request already ${reqDoc.status}` });
        }

        reqDoc.status = 'rejected';
        reqDoc.decidedBy = req.user.id;
        reqDoc.decidedAt = new Date();
        reqDoc.note = req.body.note || reqDoc.note;
        await reqDoc.save();

        res.json(reqDoc);
    } catch (e) { next(e); }
};
