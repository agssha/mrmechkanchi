const reviewService = require("../services/reviewService");
const ApiResponse = require("../utils/apiResponse");

class ReviewController {
    /**
     * Submit quality scores / review audit
     */
    async addReview(req, res, next) {
        try {
            const review = await reviewService.addReview(req.body);
            return ApiResponse.success(res, "Thank you for submitting feedback details!", { review }, 200);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get reviews log
     */
    async getReviews(req, res, next) {
        try {
            const reviews = await reviewService.getReviews();
            return ApiResponse.success(res, "Reviews retrieved successfully", { reviews }, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ReviewController();
