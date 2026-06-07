const express = require("express");
const auth = require("../middlewares/authMiddleware");
const mechanicController = require("../controllers/mechanicController");
const bookingController = require("../controllers/bookingController");
const BookingValidator = require("../validators/bookingValidator");

const router = express.Router();

// Enforce strict Mechanic role verification across all routes in this sub-router
router.use(auth("mechanic"));

// Mechanics operations on assigned tickets
router.get("/my-jobs/:mechanicPhone", mechanicController.getMechanicBookings);
router.put("/accept-job", BookingValidator.validateAccept, bookingController.acceptJob);
router.put("/set-charge", BookingValidator.validateSetPrice, bookingController.setPrice);
router.put("/confirm-cash", BookingValidator.validateConfirmPayment, bookingController.recordCashPayment);

module.exports = router;
