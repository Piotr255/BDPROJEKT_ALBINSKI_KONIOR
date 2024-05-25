const express = require("express");
const router = express.Router();
const { addPizza,
    addIngredient,
    addDiscount,
    registerEmployee} = require("../controllers/AdminController");
const validateToken = require("../middleware/validateToken");
const authorizeAdmin = require("../middleware/authorizeAdmin");

/*router.get("/pizzas", getAllPizzas);
router.post("/add_pizza", addPizza);
router.post("/add_ingredient", addIngredient);
router.get("/ingredients", getAllIngredients);
router.post("/most_beneficial_pizzas", getMostBeneficialPizzas)*/
router.post("/add_pizza", validateToken, authorizeAdmin, addPizza);
router.post("/add_ingredient", validateToken, authorizeAdmin, addIngredient);
router.post("/add_discount", validateToken, authorizeAdmin, addDiscount);
router.post("/register_employee", validateToken, authorizeAdmin, registerEmployee);

module.exports = router;