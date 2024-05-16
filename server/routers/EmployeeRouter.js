const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/EmployeeController");

router.post("/showCurrentOrders", employeeController.showCurrentOrders);

module.exports = router;