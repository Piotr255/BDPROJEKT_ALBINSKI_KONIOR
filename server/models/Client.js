const mongoose = require('mongoose');
const addressSchema = require('./Address');

const clientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: addressSchema,
        required: true
    },
    order_count: {
        type: Number,
        default: 0
    },
    discount_saved: {
        type: Number,
        default: 0
    },
    grades: {
        _id: false,
        type: [{ pizza_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Pizzas',
                    required: true
                },
                stars: {
                    type: Number,
                    required: true,
                    min: 1,
                    max: 6}}],
        default: []
    },
    current_orders: {
        type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Orders'}],
        default: []
    },
    orders_history: {
        type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Orders'}],
        default: []
    }
});

module.exports = mongoose.model('Clients', clientSchema);