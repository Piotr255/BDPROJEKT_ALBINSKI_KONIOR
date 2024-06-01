const express = require("express");
const router = express.Router();

const { updateIngredientStatus,
  changeOrderStatus, getCurrentOrders} = require("../controllers/EmployeeController");

const validateToken = require("../middleware/validateToken");
const authorizeWorker = require("../middleware/authorizeWorker");

router.patch("/update_ingredient_status", validateToken, authorizeWorker, updateIngredientStatus);
router.patch("/change_order_status", validateToken, authorizeWorker, changeOrderStatus);
router.get("/get_current_orders", validateToken, authorizeWorker, getCurrentOrders);
module.exports = router;