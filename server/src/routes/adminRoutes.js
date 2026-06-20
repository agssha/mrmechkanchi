const express = require("express");
const auth = require("../middlewares/authMiddleware");
const authController = require("../controllers/authController");
const mechanicController = require("../controllers/mechanicController");
const bookingController = require("../controllers/bookingController");
const reviewController = require("../controllers/reviewController");
const AuthValidator = require("../validators/authValidator");
const BookingValidator = require("../validators/bookingValidator");

const router = express.Router();

// Enforce strict Admin role verification across all routes in this sub-router
router.use(auth(["admin", "super_admin"]));

// Platform management secured actions
router.post("/create-mechanic", AuthValidator.validateMechanicRegister, authController.registerMechanic);
router.put("/reset-mechanic-password", AuthValidator.validateResetPassword, mechanicController.resetMechanicPassword);
router.get("/bookings", bookingController.getAllBookings);
router.put("/assign-job", BookingValidator.validateAssign, bookingController.assignBooking);
router.get("/reviews", reviewController.getReviews);
router.get("/mechanics", mechanicController.getMechanics);
router.put("/update-status", bookingController.updateStatus);

// Edit and Delete Booking Endpoints (secured and payload validated)
router.put("/bookings/:bookingId", BookingValidator.validateEdit, bookingController.editBooking);
router.delete("/bookings/:bookingId", BookingValidator.validateDelete, bookingController.deleteBooking);

module.exports = router;
