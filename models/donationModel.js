   // models/donationModel.js
   const mongoose = require('mongoose');

   const donationSchema = new mongoose.Schema({
       donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
       institute: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
       shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
       items: [
           {
               name: { type: String, required: true },
               quantity: { type: Number, required: true },
               unit: { type: String, required: true }
           }
       ],
       totalAmount: { type: Number, required: true },
       status: {
           type: String,
           enum: ['pending', 'processing', 'shipping', 'completed', 'cancelled'], // Add 'processing' here
           default: 'pending'
       },
       createdAt: { type: Date, default: Date.now }
   });

   module.exports = mongoose.model('Donation', donationSchema);