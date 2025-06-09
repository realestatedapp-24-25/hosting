const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    verificationStatus: { type: Boolean, default: true },
    contactInfo: {
        email: { type: String, required: true },
        phone: { type: String, required: true },
        address: String
    },
    shopName: { type: String, required: true },
    location: {
        type: {
            type: String,
            default: "Point",
            enum: ["Point"]
        },
        coordinates: {
            type: [Number],
            required: [true, "Coordinates are required"]
        }
    },
    inventory: [{
        itemName: { type: String, required: true },
        category: { type: String, required: true, enum: ['Grocery', 'Electronics', 'Clothing', 'Other'] },
        quantity: { type: Number, required: true },
        unit: { type: String, required: true, enum: ['kg', 'liters', 'pieces', 'packs'] },
        pricePerUnit: { type: Number, required: true }
    }],
    rating: { type: Number, min: 0, max: 5, default: 0 }
});

shopSchema.index({ location: "2dsphere" });

module.exports = mongoose.model('Shop', shopSchema);