const mongoose = require('mongoose');
const addressSchema = new mongoose.Schema({
    _id: false,
    city: {
        type: String,
        required: true
    },
    street: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    zip_code: {
        type: String,
        required: true
    }
});

module.exports = addressSchema;