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
        type:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ingredients'
        }],
        default: []
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
            default: 0
        }
    }
});

module.exports = mongoose.model("Pizzas", pizzaSchema);