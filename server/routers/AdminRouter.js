const express = require("express");
const router = express.Router();
const adminController = require("../controllers/AdminController");

router.get("/pizzas", adminController.getAllPizzas);
router.post("/add_pizza", adminController.addPizza);
router.post("/add_ingredient", adminController.addIngredient);
router.get("/ingredients", adminController.getAllIngredients);


module.exports = router;