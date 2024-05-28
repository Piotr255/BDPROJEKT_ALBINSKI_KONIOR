const express = require("express");
const router = express.Router();
const { getAvailablePizzas,
  makeOrder,
  rateOrder} = require("../controllers/ClientController");
const validateToken = require("../middleware/validateToken");
const authorizeClient = require("../middleware/authorizeClient");
/*router.post("/save_order", saveOrder);
router.post("/orders", getAllClientOrders);*/
router.get("/available_pizzas", validateToken, authorizeClient, getAvailablePizzas);
/*router.put("/edit_client_data", editClientData);*/
router.post("/make_order", validateToken, authorizeClient, makeOrder);
router.patch("/rate_order", validateToken, authorizeClient, rateOrder);
module.exports = router;