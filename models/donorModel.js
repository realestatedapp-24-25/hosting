const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    total_donations: { type: Number, default: 0 },
    last_donation_date: { type: Date },
});

module.exports = mongoose.model('Donor', donorSchema); 