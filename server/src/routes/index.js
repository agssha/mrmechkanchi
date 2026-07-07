const express = require("express");
const authRoutes = require("./authRoutes");
const adminRoutes = require("./adminRoutes");
const mechanicRoutes = require("./mechanicRoutes");
const customerRoutes = require("./customerRoutes");
const paymentRoutes = require("./paymentRoutes");
const superAdminRoutes = require("./superAdminRoutes");
const referralRoutes = require("./referralRoutes");
const auth = require("../middlewares/authMiddleware");
const authController = require("../controllers/authController");

const router = express.Router();

// Mount segregated sub-routers under standard namespaces
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/mechanic", mechanicRoutes);
router.use("/customer", customerRoutes);
router.use("/payment", paymentRoutes);
router.use("/super-admin", superAdminRoutes);
router.use("/", referralRoutes);

// Compatibility alias for dashboard logout requests
router.post("/admin-logout", auth(["ADMIN", "SUPER_ADMIN"]), authController.adminLogout);

module.exports = router;


