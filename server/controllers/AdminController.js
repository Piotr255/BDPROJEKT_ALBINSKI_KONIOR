const Pizza = require('../models/Pizza');
const Ingredient = require('../models/Ingredient');
const Discount = require('../models/Discount');
const User = require('../models/User');
const Worker = require('../models/Worker');
const Order = require('../models/Order');
const asyncHandler = require("express-async-handler");
const addressSchema = require("../models/Address");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const ObjectId = mongoose.Types.ObjectId;
const AdminVars = require("../models/AdminVars");

const addIngredient = asyncHandler(async (req, res, next) => {
  try {
    const {name, vegan, vegetarian, available} = req.body;
    const existingIngredient = await Ingredient.findOne({name: name});
    if (existingIngredient) {
      res.status(400);
      throw new Error("Ingredient already exists");
    }
    await Ingredient.create({
      name,
      vegan,
      vegetarian,
      available
    });

    res.status(200).json({
      message: 'Ingredient saved',
      name,
      vegan,
      vegetarian,
      available
    })
  } catch(err) {
    next(err);
  }
});


const createOrUpdateDeliveryPrice = asyncHandler(async (req, res) => {
  const { new_price } = req.body;
  await AdminVars.updateOne(null,
      { $set: { delivery_price: new_price } },
      { upsert: true, new: true }
  )
  res.status(200).json({message: `Delivery price set to ${new_price}`});
});

const addPizza = asyncHandler(async (req, res, next) => {
  try {
    const {name, ingredients, price, available} = req.body;
    const existingPizzaWithName = await Pizza.findOne({name: name});
    if (existingPizzaWithName) {
      res.status(400);
      throw new Error("There is already a pizza with this name");
    }
    const ingredients_ObjId = ingredients.map((ingredient) => new ObjectId(ingredient));
    const existingPizzaWithIngredients = await Pizza.aggregate([
      {
        $project: {
          isSameIngredients: { $setEquals: ["$ingredients", ingredients_ObjId] }
        }
      },
      {
        $match: {
          isSameIngredients: true
        }
      }
    ]);
    if (existingPizzaWithIngredients.length > 0) {
      res.status(400);
      throw new Error("There is already a pizza with this set of ingredients");
    }
    const ingredientsExist = await Ingredient.aggregate([
      {
        $match: { _id: { $in: ingredients_ObjId } }
      },
      {
        $group: {
          _id: null,
          matchedIngredientsCount: { $sum: 1 }
        }
      },
      {
        $project: {
          ingredientsExist: { $eq: ["$matchedIngredientsCount", ingredients_ObjId.length] }
        }
      },
      {
        $match: {
          ingredientsExist: true
        }
      }
    ]);
    if (ingredientsExist.length === 0) {
      throw new Error("At least one of the given ingredients doesn't exist");
    }
    const next_menu_number_query = await Pizza.aggregate([
      {
        $sort: { menu_number: -1 }
      },
      {
        $limit: 1
      }
    ]);
    const next_menu_number = next_menu_number_query.length > 0 ? next_menu_number_query[0].menu_number + 1 : 1;
    await Pizza.create({
      name,
      menu_number: next_menu_number,
      ingredients: ingredients_ObjId,
      price,
      available
    });

    res.status(200).json({
      message: "Pizza saved",
      name,
      ingredients_ObjId,
      price,
      available
    })
  } catch(err) {
    next(err);
  }
});

const addDiscount = asyncHandler(async (req, res, next) => {
  try {
    const {name, pizza_ids, value, start_date, end_date} = req.body;
    const pizza_ids_ObjId = pizza_ids.map(pizza_id => new ObjectId(pizza_id));
    const existingName = await Discount.findOne({name: name});
    if (existingName) {
      res.status(400);
      throw new Error("Discount name already exists");
    }
    const pizza_idsExist = await Pizza.aggregate([
      {
        $match: { _id: { $in: pizza_ids_ObjId } }
      },
      {
        $group: {
          _id: null,
          matchedPizzasCount: { $sum: 1 }
        }
      },
      {
        $project: {
          pizzasExist: { $eq: ["$matchedPizzasCount", pizza_ids_ObjId.length] }
        }
      },
      {
        $match: {
          pizzasExist: true
        }
      }
    ]);
    if (pizza_idsExist.length === 0) {
      res.status(400);
      throw new Error("At least one of the given pizzas doesn't exist");
    }
    if (value > 1 || value < 0) {
      res.status(400);
      throw new Error("Invalid discount value");
    }
    const start_date_DATE = new Date(start_date).toISOString();
    const end_date_DATE = new Date(end_date).toISOString();
    if (end_date_DATE < start_date_DATE) {
      res.status(400);
      throw new Error("Invalid dates");
    }
    await Discount.create({
      name,
      pizza_ids: pizza_ids_ObjId,
      value,
      start_date: start_date_DATE,
      end_date: end_date_DATE
    });
    res.status(200).json({
      message: "Discount saved",
      name,
      pizza_ids: pizza_ids_ObjId,
      value,
      start_date,
      end_date
    })
  } catch(err) {
    next(err);
  }
});

const registerWorker = asyncHandler(async (req, res, next) => {
  const session = await mongoose.startSession();
  await session.startTransaction();
  try {
    const { email, password, name, salary, phone, address, status, worker_type } = req.body;
    if (!email || !password || !name || !salary || !phone || !address || !status || !worker_type) {
      res.status(400);
      throw new Error("Please fill in all fields");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create([{
      email,
      password: hashedPassword,
      role: "worker"
    }], {session});
    await Worker.create([{
      name,
      worker_type,
      salary,
      phone,
      address,
      status
    }], {session});
    res.status(200).json({
      message: 'Worker registered',
      name,
      email,
      salary,
      phone,
      address,
      status,
      worker_type
    });
    await session.commitTransaction();
  } catch(err) {
    await session.abortTransaction();
    next(err);
  } finally {
    await session.endSession();
  }
});

const bestRatedEmployees = asyncHandler(async (req, res, next) => {
  try {
    let {limit, date_from, date_to} = req.body;
    if (!limit) {
      throw new Error("Please provide a limit");
    }
    if (!date_from) {
      date_from = new Date(0);
    }
    if (!date_to) {
      date_to = new Date();
    }

    const result = await Order.aggregate([
      {
        $match: {
          "grade": { $exists: true },
          order_date: {
            $gte: date_from,
            $lte: date_to
          }
        }
      },
      {
        $group: {
          _id: {
            employee_id: "$employee_id"
          },
          avg_grade_for_food: { $avg: "$grade.grade_food" }
        }
      },
      {
        $lookup: {
          from: "workers",
          localField: "_id.employee_id",
          foreignField: "_id",
          as: "employee_details"
        }
      },
      {
        $unwind: "$employee_details"
      },
      {
        $project: {
          _id: 0,
          employee_name: "$employee_details.name",
          avg_grade_for_food: 1,
        }
      },
      {
        $sort: { avg_grade_for_food: -1 }
      },
      {
        $limit: limit
      }
    ]);
    res.status(200).json(result);
  } catch(error) {
    next(error);
  }
});

const mostBeneficialPizzasLastYear = asyncHandler(async (req, res, next) => {
  try {
    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const result = await Order.aggregate([
      {
        $match: {
          order_date: {
            $gte: oneYearAgo,
            $lte: now
          }
        }
      },
      {
        $project: {
          pizzas: 1,
          order_date: 1
        }
      },
      {
        $unwind: "$pizzas"
      },
      {
        $group: {
          _id: {
            month: { $month: "$order_date" },
            pizza_id: "$pizzas.pizza_id"
          },
          total_profit: {
            $sum: {
              $multiply: [
                "$pizzas.current_price",
                "$pizzas.count",
                { $subtract: [1, "$pizzas.discount"] }
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "pizzas",
          localField: "_id.pizza_id",
          foreignField: "_id",
          as: "pizza_details"
        }
      },
      {
        $unwind: "$pizza_details"
      },
      {
        $group: {
          _id: {
            month: "$_id.month"
          },
          pizzas: {
            $push: {
              pizza_name: "$pizza_details.name",
              total_profit: "$total_profit"
            }
          },
          total_profit_this_month: { $sum: "$total_profit" }
        }
      },
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          pizzas: 1,
          total_profit_this_month: 1
        }
      },
      {
        $sort: {
          total_profit_this_month: -1
        }
      }
    ]);
    res.status(200).json(result);
  } catch(error) {
    next(error);
  }
});

const mostGenerousClients = asyncHandler(async (req, res, next) => {
  try {
    let {limit, date_from, date_to} = req.body;
    if (!limit) {
      throw new Error("Provide the limit");
    }
    if (!date_from) {
      date_from = new Date(0);
    }
    if (!date_to) {
      date_to = new Date();
    }
    const result = await Order.aggregate([
      {
        $match: {
          status: {$in: ['3.2', '4']},
          order_date: {
            $gte: date_from,
            $lte: date_to
          }
        }
      },
      {
        $group: {
          _id: "$client_id",
          total_profit_from_client: {$sum: "$total_price.with_discount"}
        }
      },
      {
        $sort: {total_profit_from_client: -1}
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: "clients",
          localField: "_id",
          foreignField: "_id",
          as: "client_details"
        }
      },
      {
        $unwind: "$client_details"
      },
      {
        $project: {
          name: "$client_details.name",
          address: {
            city: "$client_details.address.city",
            street: "$client_details.address.street",
            zip_code: "$client_details.address.zip_code"
          },
          order_count: "$client_details.order_count",
          total_profit_from_client: 1
        }
      }
    ]);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = { addPizza, addIngredient, addDiscount, registerWorker, createOrUpdateDeliveryPrice,
bestRatedEmployees, mostBeneficialPizzasLastYear, mostGenerousClients };
