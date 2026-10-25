const { Review, Booking } = require("../models");
const AppError = require("../utils/appError");

class ReviewService {
    /**
     * Submit customer review
     */
    async addReview(data) {
        const { bookingId, customerName, userEmail, rating, review } = data;

        // Verify booking exists
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            throw new AppError("Associated service booking reference not found.", 404);
        }

        // Prevent duplicate database entries for review
        const duplicate = await Review.findOne({ bookingId });
        if (duplicate) {
            throw new AppError("A review for this service booking has already been submitted.", 400);
        }

        const newReview = await Review.create({
            bookingId,
            customerName: customerName.trim(),
            userEmail: userEmail ? userEmail.trim().toLowerCase() : (booking.userEmail || ""),
            mechanicName: booking.mechanicName || "Not Assigned",
            rating: Number(rating),
            review: review.trim(),
            createdAt: new Date()
        });

        return newReview;
    }


    /**
     * Get all reviews sorted by creation date
     */
    async getReviews() {
        return await Review.find().sort({ createdAt: -1 });
    }
}

module.exports = new ReviewService();
