const express = require("express");
const router = express.Router();
const { addPizza,
    addIngredient,
    addDiscount,
    registerWorker,
    createOrUpdateDeliveryPrice,
    bestRatedEmployees,
    mostBeneficialPizzasLastYear,
    mostGenerousClients
    } = require("../controllers/AdminController");
const validateToken = require("../middleware/validateToken");
const authorizeAdmin = require("../middleware/authorizeAdmin");

router.post("/add_pizza", validateToken, authorizeAdmin, addPizza);
router.post("/add_ingredient", validateToken, authorizeAdmin, addIngredient);
router.post("/add_discount", validateToken, authorizeAdmin, addDiscount);
router.post("/register_worker", validateToken, authorizeAdmin, registerWorker);
router.patch("/update_delivery_price", validateToken, authorizeAdmin, createOrUpdateDeliveryPrice);
router.get("/best_rated_employees", validateToken, authorizeAdmin, bestRatedEmployees);
router.get("/most_beneficial_pizzas_last_year", validateToken, authorizeAdmin, mostBeneficialPizzasLastYear);
router.get("/most_generous_clients", validateToken, authorizeAdmin, mostGenerousClients);

module.exports = router;