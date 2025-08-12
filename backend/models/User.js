const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, enum: ['Male', 'Female'], required: true },
    dob: { type: Date, required: true },
    city: { type: String, required: true },
    wantToRead: [{ type: Schema.Types.ObjectId, ref: 'Book' }],
    finished: [{ type: Schema.Types.ObjectId, ref: 'Book' }],
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Book' }],
    currentlyReading: [{ type: Schema.Types.ObjectId, ref: 'Book' }],
    avatar: { type: String, default: null }
});

// Hash the password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Add a method to compare password
userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
