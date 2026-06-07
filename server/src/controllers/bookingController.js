const bookingService = require("../services/bookingService");
const ApiResponse = require("../utils/apiResponse");

class BookingController {
    /**
     * Create repair booking
     */
    async createBooking(req, res, next) {
        try {
            const booking = await bookingService.createBooking(req.body);
            return ApiResponse.success(res, "Booking generated successfully", { booking }, 200);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all bookings
     */
    async getAllBookings(req, res, next) {
        try {
            const bookings = await bookingService.getAllBookings();
            return ApiResponse.success(res, "Bookings retrieved", { bookings }, 200);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Assign mechanic to ticket
     */
    async assignBooking(req, res, next) {
        try {
            const { bookingId, mechanicName, mechanicPhone } = req.body;
            const booking = await bookingService.assignBooking(bookingId, mechanicName, mechanicPhone);
            return ApiResponse.success(res, "Mechanic assigned successfully", { booking }, 200);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Mechanic accepts ticket assignment
     */
    async acceptJob(req, res, next) {
        try {
            const { bookingId } = req.body;
            const mechanicPhone = req.user.phone;
            const booking = await bookingService.acceptJob(bookingId, mechanicPhone);
            return ApiResponse.success(res, "Job status confirmed as accepted", { booking }, 200);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Mechanic sets service estimated charges
     */
    async setPrice(req, res, next) {
        try {
            const { bookingId, price } = req.body;
            const mechanicPhone = req.user.phone;
            const booking = await bookingService.setPrice(bookingId, price, mechanicPhone);
            return ApiResponse.success(res, "Service charge saved successfully", { booking }, 200);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Mechanic confirms cash collection
     */
    async recordCashPayment(req, res, next) {
        try {
            const { bookingId } = req.body;
            const mechanicPhone = req.user.phone;
            const booking = await bookingService.recordCashPayment(bookingId, mechanicPhone);
            return ApiResponse.success(res, "Cash collection confirmation registered across panels", { booking }, 200);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Process online transactions callback log
     */
    async recordOnlinePayment(req, res, next) {
        try {
            const { bookingId, razorpayOrderId } = req.body;
            const booking = await bookingService.recordOnlinePayment(bookingId, razorpayOrderId);
            return ApiResponse.success(res, "Online payment gateway verification logged successfully", { booking }, 200);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Customer tracks bookings by email address
     */
    async trackBooking(req, res, next) {
        try {
            const { email } = req.params;
            const bookings = await bookingService.trackBooking(email);
            return ApiResponse.success(res, "Tracked logs retrieved successfully", { bookings }, 200);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Master status admin modifier override
     */
    async updateStatus(req, res, next) {
        try {
            const { bookingId, status } = req.body;
            const booking = await bookingService.updateStatus(bookingId, status);
            return ApiResponse.success(res, "Workflow state modified directly", { booking }, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new BookingController();
