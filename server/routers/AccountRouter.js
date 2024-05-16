const express = require("express");
const router = express.Router();
const accountController = require("../controllers/AccountController");

router.post("/register", accountController.register);
router.post("/login", accountController.login);

module.exports = router;