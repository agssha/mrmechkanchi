const AppError = require("../utils/appError");

class BookingValidator {
    static validateCreate(req, res, next) {
        const { name, mobileNumber, serviceAddress, serviceType } = req.body;
        if (!name || !mobileNumber || !serviceAddress || !serviceType) {
            return next(new AppError("All fields required (name, mobileNumber, serviceAddress, serviceType)", 400));
        }
        next();
    }

    static validateAssign(req, res, next) {
        const { bookingId, mechanicName, mechanicPhone } = req.body;
        if (!bookingId || !mechanicName || !mechanicPhone) {
            return next(new AppError("Missing assignment inputs (bookingId, mechanicName, mechanicPhone)", 400));
        }
        next();
    }

    static validateAccept(req, res, next) {
        const { bookingId } = req.body;
        if (!bookingId) {
            return next(new AppError("Missing bookingId in request body.", 400));
        }
        next();
    }

    static validateSetPrice(req, res, next) {
        const { bookingId, price } = req.body;
        if (!bookingId || price === undefined) {
            return next(new AppError("Missing price inputs (bookingId, price)", 400));
        }
        const numPrice = Number(price);
        if (isNaN(numPrice) || numPrice <= 0) {
            return next(new AppError("Invalid pricing amount configuration", 400));
        }
        next();
    }

    static validateConfirmPayment(req, res, next) {
        const { bookingId } = req.body;
        if (!bookingId) {
            return next(new AppError("Missing bookingId reference", 400));
        }
        next();
    }

    static validateOnlinePayment(req, res, next) {
        const { bookingId, razorpayOrderId } = req.body;
        if (!bookingId) {
            return next(new AppError("Booking reference verified invalid", 400));
        }
        next();
    }

    static validateReview(req, res, next) {
        const { bookingId, customerName, rating, review } = req.body;
        if (!bookingId || !customerName || rating === undefined || !review) {
            return next(new AppError("All required tracking variables must be present (bookingId, customerName, rating, review)", 400));
        }
        const numRating = Number(rating);
        if (isNaN(numRating) || numRating < 1 || numRating > 5) {
            return next(new AppError("Rating context scale constraints: 1-5", 400));
        }
        next();
    }
}

module.exports = BookingValidator;
