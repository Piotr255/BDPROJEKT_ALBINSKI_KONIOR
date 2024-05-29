const mongoose = require('mongoose');
const gradeSchema = new mongoose.Schema({
    grade_food: {
        type: Number,
        min: 1,
        max: 6,
        required: true
    },
    grade_delivery: {
        type: Number,
        min: 1,
        max: 6,
        required: true
    },
    comment: {
        type: String,
        required: false,
        maxlength: 255
    }
});

module.exports = gradeSchema;