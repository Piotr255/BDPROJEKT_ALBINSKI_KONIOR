const express = require("express");
const router = express.Router();
const { updateIngredientStatus } = require("../controllers/EmployeeController");
const validateToken = require("../middleware/validateToken");
const authorizeEmployee = require("../middleware/authorizeEmployee");
/*router.post("/showCurrentOrders", employeeController.showCurrentOrders);
router.post("/changeIngredientsStatus", employeeController.changeIngredientsStatus);
router.get("/getIngredients", employeeController.getIngredients);*/
router.patch("/update_ingredient_status", validateToken, authorizeEmployee, updateIngredientStatus);

module.exports = router;