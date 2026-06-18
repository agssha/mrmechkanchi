const { Review } = require("../models");
const AppError = require("../utils/appError");

class ReviewService {
    /**
     * Submit customer review
     */
    async addReview(data) {
        const { bookingId, customerName, userEmail, mechanicName, rating, review } = data;

        // Prevent duplicate database entries for review
        const duplicate = await Review.findOne({ bookingId });
        if (duplicate) {
            throw new AppError("A review for this service booking has already been submitted.", 400);
        }

        const newReview = await Review.create({
            bookingId,
            customerName,
            userEmail,
            mechanicName: mechanicName || "Not Assigned",
            rating,
            review,
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
