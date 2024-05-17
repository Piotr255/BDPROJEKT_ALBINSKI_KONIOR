const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/EmployeeController");

router.post("/showCurrentOrders", employeeController.showCurrentOrders);
router.post("/changeIngredientsStatus", employeeController.changeIngredientsStatus);
router.get("/getIngredients", employeeController.getIngredients);

module.exports = router;