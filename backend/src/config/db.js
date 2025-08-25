const mongoose = require('mongoose');
const ensureAdmin = require('../bootstrap/ensureAdmin');

exports.connectDB = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI missing in .env');

    mongoose.set('strictQuery', true);
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');

    // seed/create admin if needed
    await ensureAdmin();
};
