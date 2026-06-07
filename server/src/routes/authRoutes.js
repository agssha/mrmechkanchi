const express = require("express");
const authController = require("../controllers/authController");
const AuthValidator = require("../validators/authValidator");

const router = express.Router();

// Central access points to authenticate credentials
router.post("/admin-register", AuthValidator.validateRegister, authController.adminRegister);
router.post("/admin-login", AuthValidator.validateLogin, authController.adminLogin);
router.post("/mechanic-login", AuthValidator.validateLogin, authController.loginMechanic);

module.exports = router;
