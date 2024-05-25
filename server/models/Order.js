const mongoose = require('mongoose');
const addressSchema = require('./Address');
const gradeSchema = require('./Grade');
const orderSchema = new mongoose.Schema({
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clients',
        required: true
    },
    employee_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workers',
        required: true
    },
    deliverer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workers',
        required: false
    },
    pizzas: [
        {
            pizza_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Pizzas',
                required: true
            },
            count: {
                type: Number,
                required: true
            }
        }
    ],
    client_address: {
        type: addressSchema,
        required: true
    },
    order_notes: {
        type: String,
        required: false
    },
    order_date: {
        type: Date,
        required: true
    },
    grade : {
        type: gradeSchema,
        required: false
    }

}, {timestamps: true});

module.exports = mongoose.model('Orders', orderSchema);

