const express = require("express");
const router = express.Router();
const {saveOrder, getAllClientOrders, getAvailablePizzas, editClientData} = require("../controllers/ClientController");

router.post("/save_order", saveOrder);
router.post("/orders", getAllClientOrders);
router.get("/available_pizzas", getAvailablePizzas);
router.put("/edit_client_data", editClientData);
module.exports = router;