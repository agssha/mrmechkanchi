const { Review } = require("../models");

class ReviewService {
    /**
     * Submit customer review
     */
    async addReview(data) {
        const { bookingId, customerName, userEmail, mechanicName, rating, review } = data;

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
