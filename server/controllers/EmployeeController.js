const Customer = require('../models/CustomerModel');
const mongoose = require('mongoose');
const asyncHandler = require("express-async-handler");
const Ingredient = require("../models/IngredientModel");
const ObjectId = mongoose.Types.ObjectId;

exports.showCurrentOrders = asyncHandler(async (req, res) => {
  try {
    const current_orders = Customer.aggregate([
      {
        $unwind: "$order_history"
      },
      {
        $match: { "order_history.status": { $in: ["0", "1", "2a"] } }
      },
      {
        $unwind: "$order_history.pizzas"
      },
      {
        $lookup: {
          from: "pizzas",
          localField: "order_history.pizzas.menu_number",
          foreignField: "menu_number",
          as: "pizza_details"
        }
      },
      {
        $unwind: "$pizza_details"
      },
      {
        $lookup: {
          from: "ingredients",
          localField: "pizza_details.ingredients",
          foreignField: "id",
          as: "ingredient_details"
        }
      },
      {
        $unwind: {
          path: "$ingredient_details",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: {
            orderID: "$order_history._id",
            pizzaID: "$pizza_details._id"
          },
          address: { $first: "$address" },
          email: { $first: "$email" },
          name: { $first: "$name" },
          phone: { $first: "$phone" },
          status: { $first: "$order_history.status" },
          customer_order_nr: { $first: "$order_history.customer_order_nr" },
          order_date: { $first: "$order_history.order_date" },
          pizza_name: { $first: "$pizza_details.name" },
          pizza_price: { $first: "$pizza_details.price" },
          pizza_count: { $first: "$order_history.pizzas.count" },  // Dodanie liczby pizz
          ingredients: { $push: "$ingredient_details.name" },
          pizza_price_total: { $sum: { $multiply: ["$pizza_details.price", "$order_history.pizzas.count"] } }
        }
      },
      {
        $group: {
          _id: "$_id.orderID",
          address: { $first: "$address" },
          email: { $first: "$email" },
          name: { $first: "$name" },
          phone: { $first: "$phone" },
          status: { $first: "$status" },
          customer_order_nr: { $first: "$customer_order_nr" },
          order_date: { $first: "$order_date" },
          total_price: { $first: "$pizza_price_total" },
          pizzas: {
            $push: {
              name: "$pizza_name",
              price: "$pizza_price",
              count: "$pizza_count",  // Dodanie ilości do wyników
              ingredients: "$ingredients"
            }
          }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);
    res.status(200).json(current_orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({error: error.message});
  }
});

exports.getIngredients = asyncHandler(async (req, res) => {
  try {
    const ingredients = await Ingredient.find();
    res.status(200).json(ingredients);
  } catch (err) {
    res.status(500).json({error: 'An error occurred while fetching ingredients' });
  }
});

exports.changeIngredientsStatus = asyncHandler(async (req, res) => {
  try {
    await Ingredient.updateOne({id: req.body.id},
      {onStock: req.body.new_status});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});