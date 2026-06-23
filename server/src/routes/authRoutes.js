const express = require("express");
const authController = require("../controllers/authController");
const AuthValidator = require("../validators/authValidator");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();

// Central access points to authenticate credentials
router.post("/admin-register", AuthValidator.validateRegister, authController.adminRegister);
router.post("/admin-login", AuthValidator.validateLogin, authController.adminLogin);
router.post("/mechanic-login", AuthValidator.validateLogin, authController.loginMechanic);

router.get("/admin-profile", auth(["ADMIN", "SUPER_ADMIN"]), authController.adminProfile);
router.post("/admin-logout", auth(["ADMIN", "SUPER_ADMIN"]), authController.adminLogout);

module.exports = router;
