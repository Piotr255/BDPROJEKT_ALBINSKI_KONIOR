const express = require("express");
const router = express.Router();
const {getAllPizzas, addPizza, addIngredient, getAllIngredients, getMostBeneficialPizzas} = require("../controllers/AdminController");
const validateToken = require("../middleware/validateToken");
const authorizeAdmin = require("../middleware/authorizeAdmin");

router.get("/pizzas", getAllPizzas);
router.post("/add_pizza", addPizza);
router.post("/add_ingredient", addIngredient);
router.get("/ingredients", getAllIngredients);
router.post("/most_beneficial_pizzas", getMostBeneficialPizzas)


module.exports = router;