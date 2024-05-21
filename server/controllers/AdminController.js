const Pizza = require('../models/PizzaModel');
const Ingredient = require('../models/IngredientModel');
const asyncHandler = require("express-async-handler");


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
});