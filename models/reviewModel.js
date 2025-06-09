const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institute',
        required: [true, 'Review must belong to an institute']
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: [true, 'Review must belong to a shop']
    },
    rating: {
        type: Number,
        required: [true, 'Review must have a rating'],
        min: 1,
        max: 5
    },
    verdict: {
        type: String,
        enum: ['Positive', 'Neutral', 'Negative'],
        default: 'Neutral'
    },
    comment: {
        type: String,
        required: [true, 'Review must have a comment'],
        trim: true,
        maxLength: [500, 'Review comment cannot exceed 500 characters']
    },
    donation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donation',
        required: [true, 'Review must be associated with a donation']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Prevent duplicate reviews (one review per institute per donation)
reviewSchema.index({ institute: 1, donation: 1 }, { unique: true });

// Static method to calculate average rating
reviewSchema.statics.calcAverageRating = async function(shopId) {
    const stats = await this.aggregate([
        {
            $match: { shop: shopId }
        },
        {
            $group: {
                _id: '$shop',
                avgRating: { $avg: '$rating' },
                numReviews: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        await mongoose.model('Shop').findByIdAndUpdate(shopId, {
            rating: Math.round(stats[0].avgRating * 10) / 10,
            numberOfReviews: stats[0].numReviews
        });
    }
};

// Call calcAverageRating after save
reviewSchema.post('save', function() {
    this.constructor.calcAverageRating(this.shop);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review; 