const express = require("express");
const router = express.Router();
const { updateIngredientStatus, changeOrderStatus} = require("../controllers/EmployeeController");
const validateToken = require("../middleware/validateToken");
const {authorizeWorker} = require("../middleware/authorizeWorker");
/*router.post("/showCurrentOrders", employeeController.showCurrentOrders);
router.post("/changeIngredientsStatus", employeeController.changeIngredientsStatus);
router.get("/getIngredients", employeeController.getIngredients);*/
router.patch("/update_ingredient_status", validateToken, authorizeWorker, updateIngredientStatus);
router.patch("/change_order_status", validateToken, authorizeWorker, changeOrderStatus);

module.exports = router;