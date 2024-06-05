const mongoose = require('mongoose');
const addressSchema = require('./Address');
const gradeSchema = require('./Grade');
const orderSchema = new mongoose.Schema({
    client_id: {
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
            _id: false,
            pizza_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Pizzas',
                required: true
            },
            current_price: {
                type: Number,
                required: true
            },
            count: {
                type: Number,
                required: true
            },
            discount: {
                type: Number,
                min: 0,
                max: 1,
                default: 0
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
    },
    status: {
        type: String,
        required: true,
        enum: ['0', '1','-1', '2', '3.1', '3.2', '4', '-4']
    },
    to_deliver: {
        type: Boolean,
        required: true
    },
    total_price: {
        with_discount: {
            type: Number,
            required: true
        },
        without_discount: {
            type: Number,
            required: true
        },
        delivery_price: {
            type: Number,
            required: true
        }
    },
    discount_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    }
}, {timestamps: true});

module.exports = mongoose.model('Orders', orderSchema);

