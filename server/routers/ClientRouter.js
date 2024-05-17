const express = require("express");
const router = express.Router();
const clientController = require("../controllers/ClientController");

router.post("/save_order", clientController.saveOrder);
router.post("/orders", clientController.getAllClientOrders);
router.get("/available_pizzas", clientController.getAvailablePizzas);
module.exports = router;