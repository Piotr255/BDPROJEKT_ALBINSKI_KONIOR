const mongoose  = require('mongoose');
const discountSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    pizza_id: {
        type: [Number],
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    used_count: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Discounts', discountSchema);