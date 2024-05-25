const express = require("express");
const router = express.Router();
const { getAvailablePizzas} = require("../controllers/ClientController");
const validateToken = require("../middleware/validateToken");
/*router.post("/save_order", saveOrder);
router.post("/orders", getAllClientOrders);*/
router.get("/available_pizzas", validateToken, getAvailablePizzas);
/*router.put("/edit_client_data", editClientData);*/
module.exports = router;