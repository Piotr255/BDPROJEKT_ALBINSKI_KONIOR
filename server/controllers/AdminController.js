const Pizza = require('../models/Pizza');
const Ingredient = require('../models/Ingredient');
const Discount = require('../models/Discount');
const User = require('../models/User');
const Worker = require('../models/Worker');
const asyncHandler = require("express-async-handler");
const addressSchema = require("../models/Address");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const ObjectId = mongoose.Types.ObjectId;


/*
exports.getAllPizzas = asyncHandler(async (req, res) => {
  try {
    const pizzas = await Pizza.aggregate([
      {
        $lookup: {
          from: "ingredients",
          localField: "ingredients",
          foreignField: "id",
          as: "ingredients"
        }
      },
      {
        $project: {
          has_been_ordered_count: 1,
          "ingredients.name": 1,
          name: 1,
          price: 1,
          menu_number: 1
        }
      }
    ]);
    res.status(200).json(pizzas);
  } catch (err) {
    res.status(500).json({error: 'An error occurred while fetching products'});
  }
});

exports.addIngredient = asyncHandler(async (req, res) => {
  let nextId;
  try {
    const existingIngredient = await Ingredient.findOne({name: req.body.name});
    if (existingIngredient) {
      return res.status(409).json({error: "Ingredient already exists"});
    }
    const result = await Ingredient.aggregate([
      {
        $sort: { id: 1 }
      },
      {
        $group: {
          "_id": null,
          last_id: { $last: "$id" }
        }
      },
      {
        $project: {
          _id: 0,
          last_id: 1
        }
      }
    ]);
    if (result.length > 0) {
      nextId = result[0].last_id + 1;
    } else {
      nextId = 1;
    }
    const ingredient = new Ingredient({
      id: nextId,
      name: req.body.name,
      onStock: false
    });
    await ingredient.save();
    res.status(200).json({message: "Dodano składnik"});
  } catch (err) {
    res.status(500).json({error: 'An error occurred while adding ingredient'});
  }
})

exports.getAllIngredients = asyncHandler(async (req, res) => {
  try {
    const ingredients = await Ingredient.find();
    res.status(200).json(ingredients);
  } catch (err) {
    res.status(500).json({error: 'An error occurred while fetching ingredients' });
  }
})

exports.addPizza = asyncHandler(async (req, res) => {
  let next_menu_number;
  try {
    const existingPizza = await Pizza.findOne({name: req.body.name});
    if (existingPizza) {
      return res.status(409).json({ error: "Istnieje już pizza o tej nazwie" });
    }
    const existingSetOfIngredients = await Pizza.findOne({ingredients: req.body.ingredients});
    if (existingSetOfIngredients) {
      return res.status(409).json({error: "Istnieje już pizza o tym zestawie składników"});
    }
    const result = await Pizza.aggregate([
      {
        $sort: { menu_number: 1 }
      },
      {
        $group: {
          "_id": null,
          last_menu_number: { $last: "$menu_number" }
        }
      },
      {
        $project: {
          _id: 0,
          last_menu_number: 1
        }
      }
    ]);
    if (result.length > 0) {
      next_menu_number = result[0].last_menu_number + 1;
    } else {
      next_menu_number = 1;
    }
    const pizza = new Pizza({
      name: req.body.name,
      ingredients: req.body.ingredients,
      price: req.body.price,
      menu_number: next_menu_number,
      has_been_ordered_count: 0
    });
    await pizza.save();
    res.status(200).json({message: "Dodano pizzę"});
  } catch (error) {
    console.log(error);
    res.status(500).json({error: error.message});
  }
})

exports.getMostBeneficialPizzas = asyncHandler(async (req, res) => {
  try {
    const pizzas = await Pizza.aggregate([
      {
        $addFields: {
          total_benefit: { $multiply: ["$price", "$has_been_ordered_count"] }
        }
      },
      {
        $sort: {
          total_benefit: -1
        }
      },
      {
        $limit: req.body.show_pizzas_no
      }
    ]);
    console.log(pizzas);
    res.status(200).json(pizzas);
  } catch (error) {
    console.log(error);
    res.status(500).json({error: error.message});
  }
});*/

// name: {
//   type: String,
//     required: true
// },
// menu_number: {
//   type: Number,
//     required: true
// },
// ingredients: {
//   type: [Number],
//     required: true
// },
// price: {
//   type: Number,
//     required: true
// },
// available: {
//   type: Boolean,
//     required: true
// },
// grades: {
//   points_sum: {
//     type: Number,
//   default: 0
//   },
//   grade_count: {
//     type: Number,
//       required: true
//   }
// }

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

// name: {
//   type: String,
//     required: true
// },
// pizza_ids: {
//   type: [Number],
//     required: true
// },
// value: {
//   type: Number,
//     required: true
// },
// start_date: {
//   type: Date,
//     required: true
// },
// end_date: {
//   type: Date,
//     required: true
// },
// used_count: {
//   type: Number,
// default: 0
// }

const addDiscount = asyncHandler(async (req, res, next) => {
  try {
    const {name, pizza_ids, value, start_date, end_date} = req.body;
    const existingName = await Discount.findOne({name: name});
    if (existingName) {
      res.status(400);
      throw new Error("Discount name already exists");
    }
    const pizza_idsExist = await Pizza.aggregate([
      {
        $match: { menu_number: { $in: pizza_ids } }
      },
      {
        $group: {
          _id: null,
          matchedPizzasCount: { $sum: 1 }
        }
      },
      {
        $project: {
          pizzasExist: { $eq: ["$matchedPizzasCount", pizza_ids.length] }
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
      pizza_ids,
      value,
      start_date: start_date_DATE,
      end_date: end_date_DATE
    });
    res.status(200).json({
      message: "Discount saved",
      name,
      pizza_ids,
      value,
      start_date,
      end_date
    })
  } catch(err) {
    next(err);
  }
});

// name: {
//   type: String,
//     required: true
// },
// salary: {
//   type: Number,
//     required: true
// },
// phone: {
//   type: String,
//     required: true
// },
// address: {
//   type: addressSchema,
//     required: true
// },
// status: {
//   type: String,
//     required: true
// },
// current_orders: {
//   type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Orders'}],
// default: []
// },
// order_history: {
//   type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Orders'}],
// default: []
// }

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
      status
    });
    await session.commitTransaction();
  } catch(err) {
    await session.abortTransaction();
    next(err);
  } finally {
    await session.endSession();
  }
});

module.exports = { addPizza, addIngredient, addDiscount, registerWorker};
