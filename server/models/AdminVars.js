const mongoose = require('mongoose');
const AdminVarsSchema = new mongoose.Schema({
    delivery_price: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('AdminVars', AdminVarsSchema);