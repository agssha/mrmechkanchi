const AppError = require("../utils/appError");

class BookingValidator {
    static validateCreate(req, res, next) {
        const { name, mobileNumber, serviceAddress, serviceType, problemDescription, userEmail, couponCode } = req.body;
        if (!name || !mobileNumber || !serviceAddress || !serviceType) {
            return next(new AppError("All fields required (name, mobileNumber, serviceAddress, serviceType)", 400));
        }

        if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
            return next(new AppError("Customer name must be between 2 and 100 characters", 400));
        }

        const phoneRegex = /^[+]?[\d\s-]{10,15}$/;
        if (typeof mobileNumber !== "string" || !phoneRegex.test(mobileNumber.trim())) {
            return next(new AppError("Please provide a valid 10-15 digit mobile number", 400));
        }

        if (typeof serviceAddress !== "string" || serviceAddress.trim().length < 5 || serviceAddress.trim().length > 300) {
            return next(new AppError("Service address must be between 5 and 300 characters", 400));
        }

        if (typeof serviceType !== "string" || serviceType.trim().length > 100) {
            return next(new AppError("Invalid service type specified", 400));
        }

        if (problemDescription && (typeof problemDescription !== "string" || problemDescription.length > 500)) {
            return next(new AppError("Problem description cannot exceed 500 characters", 400));
        }

        if (userEmail && (typeof userEmail !== "string" || userEmail.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.trim()))) {
            return next(new AppError("Invalid email address format", 400));
        }

        if (couponCode && (typeof couponCode !== "string" || couponCode.length > 30)) {
            return next(new AppError("Invalid coupon code format", 400));
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

    static validateApplyDiscount(req, res, next) {
        const { bookingId, discountAmount } = req.body;
        if (!bookingId || discountAmount === undefined) {
            return next(new AppError("Missing inputs (bookingId, discountAmount)", 400));
        }
        const numDiscount = Number(discountAmount);
        if (isNaN(numDiscount) || numDiscount < 0) {
            return next(new AppError("Invalid discount amount", 400));
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
        const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
        if (!bookingId || !razorpayOrderId) {
            return next(new AppError("Missing required online transaction parameters (bookingId, razorpayOrderId)", 400));
        }

        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (secret) {
            if (!razorpayPaymentId || !razorpaySignature) {
                return next(new AppError("Missing Razorpay verification tokens (razorpayPaymentId, razorpaySignature)", 400));
            }
            const crypto = require("crypto");
            const expectedSignature = crypto
                .createHmac("sha256", secret)
                .update(`${razorpayOrderId}|${razorpayPaymentId}`)
                .digest("hex");

            if (expectedSignature !== razorpaySignature) {
                return next(new AppError("Invalid payment signature verification failed", 400));
            }
        }
        next();
    }


    static validateReview(req, res, next) {
        const { bookingId, customerName, rating, review } = req.body;
        if (!bookingId || !customerName || rating === undefined || !review) {
            return next(new AppError("All required tracking variables must be present (bookingId, customerName, rating, review)", 400));
        }

        if (typeof bookingId !== "string" || !/^[0-9a-fA-F]{24}$/.test(bookingId.trim())) {
            return next(new AppError("Invalid booking reference ID format", 400));
        }

        if (typeof customerName !== "string" || customerName.trim().length < 2 || customerName.trim().length > 100) {
            return next(new AppError("Customer name must be between 2 and 100 characters", 400));
        }

        const numRating = Number(rating);
        if (isNaN(numRating) || numRating < 1 || numRating > 5 || !Number.isInteger(numRating)) {
            return next(new AppError("Rating must be an integer between 1 and 5", 400));
        }

        if (typeof review !== "string" || review.trim().length < 3 || review.trim().length > 1000) {
            return next(new AppError("Review must be between 3 and 1000 characters", 400));
        }

        next();
    }

    static validateEdit(req, res, next) {
        const { bookingId } = req.params;
        if (!bookingId) {
            return next(new AppError("Booking ID is required", 400));
        }

        const { name, mobileNumber, serviceAddress, serviceType, status, estimatedPrice, userEmail, createdAt } = req.body;

        if (!name || !name.trim()) {
            return next(new AppError("Customer name is required", 400));
        }
        if (!mobileNumber || !mobileNumber.trim()) {
            return next(new AppError("Mobile number is required", 400));
        }
        if (!serviceAddress || !serviceAddress.trim()) {
            return next(new AppError("Service address is required", 400));
        }
        if (!serviceType || !serviceType.trim()) {
            return next(new AppError("Service type is required", 400));
        }
        if (!status || !status.trim()) {
            return next(new AppError("Booking status is required", 400));
        }

        const STATUS = require("../constants/status");
        const validStatuses = Object.values(STATUS);
        if (!validStatuses.includes(status)) {
            return next(new AppError(`Invalid status value. Allowed: ${validStatuses.join(", ")}`, 400));
        }

        if (userEmail && userEmail.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userEmail)) {
                return next(new AppError("Invalid email address format", 400));
            }
        }

        if (estimatedPrice !== undefined) {
            const numPrice = Number(estimatedPrice);
            if (isNaN(numPrice) || numPrice < 0) {
                return next(new AppError("Estimated price must be a non-negative number", 400));
            }
        }

        if (createdAt && isNaN(Date.parse(createdAt))) {
            return next(new AppError("Invalid date format", 400));
        }

        next();
    }

    static validateDelete(req, res, next) {
        const { bookingId } = req.params;
        if (!bookingId) {
            return next(new AppError("Booking ID is required", 400));
        }
        
        const { confirm } = req.body;
        if (confirm !== true) {
            return next(new AppError("Deletion confirmation is required", 400));
        }
        next();
    }
}

module.exports = BookingValidator;
