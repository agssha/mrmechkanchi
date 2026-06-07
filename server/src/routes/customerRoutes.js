const express = require("express");
const bookingController = require("../controllers/bookingController");
const reviewController = require("../controllers/reviewController");
const BookingValidator = require("../validators/bookingValidator");

const router = express.Router();

// Public customer gateways
router.post("/book-repair", BookingValidator.validateCreate, bookingController.createBooking);
router.get("/track/:email", bookingController.trackBooking);
router.post("/submit-review", BookingValidator.validateReview, reviewController.addReview);

module.exports = router;
