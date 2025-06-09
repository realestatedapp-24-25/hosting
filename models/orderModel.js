const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', required: true },
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
    items: [{
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, required: true }
    }],
    status: { type: String, enum: ['pending', 'shipped', 'delivered'], default: 'pending' },
    totalAmount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);