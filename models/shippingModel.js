// models/shippingModel.js
const mongoose = require('mongoose');
const geolib = require('geolib');

const shippingSchema = new mongoose.Schema({
  donation: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Donation', 
    required: true 
  },
  qrCode: {
    type: String,
    unique: true,
    required: true
  },
  status: {
    type: String,
    enum: ['preparing', 'in-transit', 'delivered'],
    default: 'preparing'
  },
  deliveryProof: {
    photo: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
    timestamp: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add 2dsphere index for geospatial queries
shippingSchema.index({ 'deliveryProof.coordinates': '2dsphere' });

shippingSchema.methods.verifyLocation = function(instituteCoords) {
  return geolib.isPointWithinRadius(
    { latitude: this.deliveryProof.coordinates[1], longitude: this.deliveryProof.coordinates[0] },
    { latitude: instituteCoords[1], longitude: instituteCoords[0] },
    120
  );
};

module.exports = mongoose.model('Shipping', shippingSchema);