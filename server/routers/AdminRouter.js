const express = require("express");
const router = express.Router();
const {getAllPizzas, addPizza, addIngredient, getAllIngredients, getMostBeneficialPizzas} = require("../controllers/AdminController");
const validateToken = require("../middleware/validateToken");
const authorizeAdmin = require("../middleware/authorizeAdmin");

router.get("/pizzas", validateToken, authorizeAdmin,  getAllPizzas);
router.post("/add_pizza", validateToken, authorizeAdmin, addPizza);
router.post("/add_ingredient", validateToken, authorizeAdmin, addIngredient);
router.get("/ingredients", validateToken, authorizeAdmin, getAllIngredients);
router.post("/most_beneficial_pizzas", validateToken, authorizeAdmin, getMostBeneficialPizzas)


module.exports = router;