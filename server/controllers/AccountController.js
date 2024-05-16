const Customer = require('../models/Customer');
const asyncHandler = require("express-async-handler");

exports.register = asyncHandler(async (req, res) => {
  try {
    const existingCustomer = await Customer.findOne({ email: req.body.email });
    if (existingCustomer) {
      throw new Error("Email already exists");
    }

    const customer = new Customer({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      phone: req.body.phone,
      address: req.body.address,
      order_history: []
    });

    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

exports.login = asyncHandler(async (req, res) => {
  try {
    const userData = await Customer.findOne(req.body);
    if (userData) {
      res.status(200).json(userData);
    } else {
      res.status(409).json({error: "Nie znaleziono użytkownika"});
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});