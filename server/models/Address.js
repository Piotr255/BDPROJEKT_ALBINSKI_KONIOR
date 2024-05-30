const mongoose = require('mongoose');
const addressSchema = new mongoose.Schema({
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
        required: false
    },
    zip_code: {
        type: String,
        required: true
    }
});

module.exports = addressSchema;