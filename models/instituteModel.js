const mongoose = require('mongoose');

const instituteSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    institute_name: { type: String, required: [true, 'Institute name is required'] },
    institute_type: { type: String, required: true, enum: ['ORPHANAGE', 'ELDERLY_HOME', 'FOOD_PROVIDER'] },
    verification_status: { type: Boolean, default: true },
    verification_documents: { type: String }, 
    description: { type: String },
    geolocation: {
      type: { type: String, default: "Point", enum: ["Point"] },
      coordinates: {
        type: [Number], 
        required: [true, "Coordinates are required"],
      },
    },
});

// Add index for geospatial queries
instituteSchema.index({ geolocation: '2dsphere' });

// Export with consistent name
module.exports = mongoose.model('Institute', instituteSchema); 