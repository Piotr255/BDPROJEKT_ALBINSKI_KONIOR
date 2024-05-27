const mongoose  = require('mongoose');
const discountSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    pizza_ids: {
        type: [mongoose.Types.ObjectId],
        ref: 'Pizzas',
        minLength: 1
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