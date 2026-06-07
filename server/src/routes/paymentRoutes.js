const express = require("express");
const bookingController = require("../controllers/bookingController");
const BookingValidator = require("../validators/bookingValidator");

const router = express.Router();

// Razorpay SDK successful transactions callback logger
router.post("/confirm-online", BookingValidator.validateOnlinePayment, bookingController.recordOnlinePayment);

module.exports = router;
