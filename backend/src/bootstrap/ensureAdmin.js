// bootstrap/ensureAdmin.js
const User = require('../models/User');

/**
 * Idempotent: creates the admin if not present; otherwise ensures role is 'admin'.
 * Assumes your User model hashes `password` in a pre('save') hook and has comparePassword().
 */
async function ensureAdmin() {
    const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        console.warn('⚠️  ADMIN_EMAIL/ADMIN_PASSWORD not set; skipping admin bootstrap.');
        return;
    }

    let user = await User.findOne({ email: ADMIN_EMAIL });

    if (!user) {
        // Create brand-new admin (pre-save will hash password)
        user = new User({
            firstName: 'System',
            lastName: 'Admin',
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            gender: 'Male',
            dob: new Date('2000-01-01'), // arbitrary date
            city: 'N/A',
            role: 'admin',
            librarianApplicationStatus: 'approved'
        });
        await user.save();
        console.log(`✅ Admin created: ${ADMIN_EMAIL}`);
        return;
    }

    // If exists but not admin, promote (optional safety check)
    if (user.role !== 'admin') {
        user.role = 'admin';
        user.librarianApplicationStatus = 'approved';
        await user.save();
        console.log(`🔼 Existing user promoted to admin: ${ADMIN_EMAIL}`);
    } else {
        console.log(`ℹ️  Admin already present: ${ADMIN_EMAIL}`);
    }
}

module.exports = ensureAdmin;
