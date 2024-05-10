const mongoose = require('mongoose');

const pizzaSchema = new mongoose.Schema({
  name: String,
  ingredients: String,
  price: Number
});

module.exports = mongoose.model('Pizzas', pizzaSchema);