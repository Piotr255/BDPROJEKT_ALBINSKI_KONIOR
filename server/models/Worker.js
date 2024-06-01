const mongoose = require('mongoose');
const addressSchema = require('./Address');
const workerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    worker_type: {
        type: String,
        required: true,
        enum: ["employee", "deliverer"]
    },
    salary: {
        type: Number,
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
    status: {
        type: String,
        required: true,
        enum: ["active", "inactive"]
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

workerSchema.index({current_orders: 1});
workerSchema.index({orders_history: 1});

module.exports = mongoose.model('Workers', workerSchema);