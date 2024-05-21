const Customer = require('../models/ClientModel');
const mongoose = require('mongoose');
const asyncHandler = require("express-async-handler");
const Pizza = require("../models/PizzaModel");
const ObjectId = mongoose.Types.ObjectId;

function generateId(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


exports.saveOrder = asyncHandler(async (req, res) => {
  let customer_next_order_nr;
  try {
    const order_history = await Customer.aggregate([
      {
        $match: {_id: new ObjectId(req.body.userId)}
      },
      {
        $unwind: '$order_history',
      },
      {
        $project: {
          _id: 0,
          order_history: 1
        }
      }
    ]);
    console.log(order_history);
    if (order_history.length === 0) {
      customer_next_order_nr = 1;
    } else {
      const getLastOrderNr = await Customer.aggregate([
        {
          $match: {_id: new ObjectId(req.body.userId)}
        },
        {
          $project: {
            _id: 0,
            order_history: 1
          }
        },
        {
          $unwind: "$order_history"
        },
        {
          $project: {
            "order_history": 1
          }
        },
        {
          $sort: {"order_history.customer_order_nr": 1}
        },
        {
          $group: {
            _id: null,
            last_order_nr: { $last: "$order_history.customer_order_nr" }
          }
        },
        {
          $project: {
            _id: 0,
            last_order_nr: 1
          }
        }
      ]);
      customer_next_order_nr = getLastOrderNr[0].last_order_nr + 1;
    }
    let date = new Date();
    date.setHours(date.getHours() + 2);
    const new_order = {
      customer_order_nr: customer_next_order_nr,
      pizzas: req.body.pizzasInBasket,
      order_date: date.toJSON(),
      status: "0",
      grade: {
        stars_for_food: null,
        stars_for_service: null,
        comment: null
      },
      auth_code: generateId(8)
    };

    await Customer.updateOne(
      {_id: req.body.userId},
      { $push: { order_history: new_order } });
    res.status(200).json({message: "Dokonano zamówienia. Sprawdź panel 'MyOrders'."});
  } catch (error) {
    console.log(error);
    res.status(500).json({error: error.message});
  }
  try {
    for (const pizza of req.body.pizzasInBasket) {
      await Pizza.updateOne({menu_number: pizza.menu_number},
        { $inc: { has_been_ordered_count: pizza.count } });
    }
  } catch(error) {
    console.log(error);
  }

});

exports.getAllClientOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Customer.aggregate([
      {
        $match: { _id: new ObjectId(req.body.userId) }
      },
      {
        $project: {
          order_history: 1
        }
      },
      {
        $unwind: "$order_history"
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
        $project: {
          "order_history.customer_order_nr": 1,
          "order_history.status": 1,
          "order_history.order_date": 1,
          "order_history.pizzas": 1,
          "pizza_details.name": 1,
          "pizza_details.price": 1,
          "pizza_price_total": { $multiply: ["$pizza_details.price", "$order_history.pizzas.count"] },
          "ingredients_names": "$ingredient_details.name"
        }
      },
      {
        $group: {
          _id: "$order_history.customer_order_nr",
          status: { $first: "$order_history.status" },
          customer_order_nr: { $first: "$order_history.customer_order_nr" },
          order_date: { $first: "$order_history.order_date" },
          total_price: { $sum: "$pizza_price_total" },
          pizzas: {
            $push: {
              menu_number: "$order_history.pizzas.menu_number",
              count: "$order_history.pizzas.count",
              name: "$pizza_details.name",
              ingredients: "$ingredients_names",
              price: "$pizza_details.price"
            }
          }
        }
      },
      {
        $sort: { "_id": -1 }
      }
    ]);
    res.status(200).json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({error: error.message});
  }
})

exports.getAvailablePizzas = asyncHandler(async (req, res) => {
  try {
    const pizzas = await Pizza.aggregate([
      {
        $lookup: {
          from: "ingredients",
          localField: "ingredients",
          foreignField: "id",
          as: "ingredientsDetails"
        }
      },
      {
        $addFields: {
          availableIngredients: {
            $filter: {
              input: "$ingredientsDetails",
              as: "ingredient",
              cond: { $eq: ["$$ingredient.onStock", true] }
            }
          }
        }
      },
      {
        $match: {
          $expr: { $eq: [{ $size: "$availableIngredients" }, { $size: "$ingredientsDetails" }] }
        }
      },
      {
        $project: {
          has_been_ordered_count: 1,
          availableIngredients: 1,
          name: 1,
          price: 1,
          menu_number: 1
        }
      }
    ]);
    res.status(200).json(pizzas);
  } catch (error) {
    console.log(error);
    res.status(500).json({error: error.message});
  }
});