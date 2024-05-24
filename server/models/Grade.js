const mongoose = require('mongoose');
const gradeSchema = new mongoose.Schema({
    grade_for_food: {
        type: Number,
        min: 1,
        max: 6,
        required: true
    },
    grade_for_service: {
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