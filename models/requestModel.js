const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institute',
        required: [true, 'Request must belong to an institute']
    },
    items: [
        {
            name: {
                type: String,
                required: [true, 'Item name is required']
            },
            quantity: {
                type: Number,
                required: [true, 'Item quantity is required']
            },
            unit: {
                type: String,
                required: [true, 'Item unit is required']
            }
        }
    ],
    status: {
        type: String,
        enum: ['pending', 'partially fulfilled', 'fulfilled'],
        default: 'pending'
    },
    fulfillmentDetails: {
        shops: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Shop'
            }
        ],
        donors: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Donor'
            }
        ]
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    comments: String,
    category: {
        type: String,
        required: [true, 'Category is required']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent automatic _id generation for items
requestSchema.path('items').schema.set('_id', false);

const Request = mongoose.model('Request', requestSchema);

module.exports = Request;