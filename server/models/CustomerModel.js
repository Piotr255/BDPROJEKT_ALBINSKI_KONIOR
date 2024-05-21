const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  address: {
    city: String,
    street: String
  },
  phone: String,
  order_history: [
    {
      customer_order_nr: Number,
      pizzas: [
        {
          menu_number: Number,
          count: Number
        }
      ],
      order_date: Date,
      status: String,
      grade: {
        stars_for_food: Number,
        stars_for_service: Number,
        comment: String
      },
      auth_code: String
    }
  ]
});

module.exports = mongoose.model('Customers', customerSchema);