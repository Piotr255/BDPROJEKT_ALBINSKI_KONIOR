const mongoose = require("mongoose");
const pizzaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    menu_number: {
        type: Number,
        required: true
    },
    ingredients: {
        type: [Number],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    available: {
        type: Boolean,
        required: true
    },
    grades: {
        points_sum: {
            type: Number,
            default: 0
        },
        grade_count: {
            type: Number,
            required: true
        }
    }
});

module.exports = mongoose.model("Pizzas", pizzaSchema);