const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Store under: backend/public/images/avatars
const AVATAR_DIR = path.join(__dirname, '..', 'public', 'images', 'avatars');

// Ensure the folder exists at runtime
if (!fs.existsSync(AVATAR_DIR)) {
    fs.mkdirSync(AVATAR_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, AVATAR_DIR),
    filename: (req, file, cb) => {
        const rawExt = path.extname(file.originalname || '').toLowerCase();
        const ext = ['.png', '.jpg', '.jpeg', '.webp'].includes(rawExt) ? rawExt : '.png';
        cb(null, `${req.user.id}-${Date.now()}${ext}`);
    }
});

const fileFilter = (_req, file, cb) => {
    // Only allow images
    const ok = ['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype);
    if (!ok) return cb(new Error('Only PNG, JPG, or WEBP images allowed'));
    cb(null, true);
};

// 2MB limit; adjust if needed
const limits = { fileSize: 2 * 1024 * 1024 };

module.exports = multer({ storage, fileFilter, limits });
