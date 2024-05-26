const express = require("express");
const router = express.Router();
const { getAvailablePizzas,
  makeOrder,
  rateOrder} = require("../controllers/ClientController");
const validateToken = require("../middleware/validateToken");
/*router.post("/save_order", saveOrder);
router.post("/orders", getAllClientOrders);*/
router.get("/available_pizzas", validateToken, getAvailablePizzas);
/*router.put("/edit_client_data", editClientData);*/
router.post("/make_order", validateToken, makeOrder);
router.patch("/rate_order", validateToken, rateOrder);
module.exports = router;