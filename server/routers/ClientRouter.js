const express = require("express");
const router = express.Router();

const { getAvailablePizzas,
  makeOrder,
  rateOrder,
  getOrderHistory } = require("../controllers/ClientController");

const validateToken = require("../middleware/validateToken");
const authorizeClient = require("../middleware/authorizeClient");

router.get("/available_pizzas", validateToken, authorizeClient, getAvailablePizzas);
router.post("/make_order", validateToken, authorizeClient, makeOrder);
router.patch("/rate_order", validateToken, authorizeClient, rateOrder);
router.get("/order_history", validateToken, authorizeClient, getOrderHistory);

module.exports = router;