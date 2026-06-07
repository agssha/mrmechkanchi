const express = require("express");
const authRoutes = require("./authRoutes");
const adminRoutes = require("./adminRoutes");
const mechanicRoutes = require("./mechanicRoutes");
const customerRoutes = require("./customerRoutes");
const paymentRoutes = require("./paymentRoutes");

const router = express.Router();

// Mount segregated sub-routers under standard namespaces
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/mechanic", mechanicRoutes);
router.use("/customer", customerRoutes);
router.use("/payment", paymentRoutes);

module.exports = router;
