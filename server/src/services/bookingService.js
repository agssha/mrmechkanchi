const { Booking, ActivityLog } = require("../models");
const STATUS = require("../constants/status");
const AppError = require("../utils/appError");

class BookingService {
    /**
     * Create a new booking
     */
    async createBooking(data) {
        const { name, mobileNumber, userEmail, userId, serviceAddress, serviceType, problemDescription } = data;
        
        // Prevent duplicate database entries within a short time window (e.g. 10 seconds)
        const tenSecondsAgo = new Date(Date.now() - 10000);
        const duplicate = await Booking.findOne({
            mobileNumber,
            serviceType,
            serviceAddress,
            createdAt: { $gte: tenSecondsAgo }
        });

        if (duplicate) {
            throw new AppError("A matching booking was already submitted successfully. Please check your active bookings.", 400);
        }

        const newBooking = await Booking.create({
            name,
            mobileNumber,
            userEmail,
            userId,
            serviceAddress,
            serviceType,
            problemDescription,
            status: STATUS.PENDING,
            createdAt: new Date()
        });

        return newBooking;
    }

    /**
     * Get all bookings sorted by creation
     */
    async getAllBookings() {
        return await Booking.find().sort({ createdAt: -1 });
    }

    /**
     * Assign booking to a specific mechanic
     */
    async assignBooking(bookingId, mechanicName, mechanicPhone) {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            throw new AppError("Booking not found", 404);
        }

        booking.mechanicName = mechanicName;
        booking.assignedMechanicId = mechanicPhone;
        booking.status = STATUS.ASSIGNED;

        await booking.save();
        return booking;
    }

    /**
     * Mechanic accepts assigned job
     */
    async acceptJob(bookingId, mechanicPhone) {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            throw new AppError("Booking not found", 404);
        }

        if (booking.status !== STATUS.ASSIGNED) {
            throw new AppError("Job state is no longer open for assignment updates.", 400);
        }

        if (booking.assignedMechanicId !== mechanicPhone) {
            throw new AppError("Access Denied: Job profile mismatch.", 403);
        }

        booking.status = STATUS.ACCEPTED;
        booking.acceptedBy = mechanicPhone;

        await booking.save();
        return booking;
    }

    /**
     * Mechanic sets service charges
     */
    async setPrice(bookingId, price, mechanicPhone) {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            throw new AppError("Booking reference missing", 404);
        }

        if (booking.acceptedBy !== mechanicPhone) {
            throw new AppError("Unauthorized access verification failed.", 403);
        }

        booking.estimatedPrice = Number(price);
        booking.status = STATUS.PRICE_SET;

        await booking.save();
        return booking;
    }

    /**
     * Mechanic confirms cash payment collection
     */
    async recordCashPayment(bookingId, mechanicPhone) {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            throw new AppError("Booking record validation error", 404);
        }

        if (booking.acceptedBy !== mechanicPhone) {
            throw new AppError("Action unauthorized", 403);
        }

        booking.paymentMode = "Cash";
        booking.paymentStatus = "Paid";
        booking.status = STATUS.COMPLETED;
        booking.updatedAt = new Date();

        await booking.save();
        return booking;
    }

    /**
     * Confirm online Razorpay transactions
     */
    async recordOnlinePayment(bookingId, razorpayOrderId) {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            throw new AppError("Booking reference verified invalid", 404);
        }

        booking.paymentMode = "Online";
        booking.paymentStatus = "Paid";
        booking.razorpayOrderId = razorpayOrderId;
        booking.status = STATUS.COMPLETED;
        booking.updatedAt = new Date();

        await booking.save();
        return booking;
    }

    /**
     * Customer tracks bookings via email, masking phone depending on status
     */
    async trackBooking(email) {
        const data = await Booking.find({ userEmail: email }).sort({ createdAt: -1 });

        return data.map(b => {
            const canSeeNumber = b.status === STATUS.ACCEPTED || b.status === STATUS.PRICE_SET || b.status === STATUS.COMPLETED;
            const bookingObj = b.toObject();
            bookingObj.mobileNumber = canSeeNumber ? b.mobileNumber : "********";
            return bookingObj;
        });
    }

    /**
     * Admin modifies booking status directly
     */
    async updateStatus(bookingId, status) {
        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            { status },
            { new: true }
        );

        if (!booking) {
            throw new AppError("Booking entry error", 404);
        }

        return booking;
    }

    /**
     * Edit booking details
     */
    async editBooking(bookingId, data, adminUser) {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            throw new AppError("Booking not found", 404);
        }

        const oldData = booking.toObject();

        // Update fields: status, date (createdAt), mechanic assignment, customer details, vehicle details, and service details.
        if (data.name !== undefined) booking.name = data.name;
        if (data.mobileNumber !== undefined) booking.mobileNumber = data.mobileNumber;
        if (data.userEmail !== undefined) booking.userEmail = data.userEmail;
        if (data.serviceAddress !== undefined) booking.serviceAddress = data.serviceAddress;
        if (data.serviceType !== undefined) booking.serviceType = data.serviceType;
        if (data.problemDescription !== undefined) booking.problemDescription = data.problemDescription;
        if (data.status !== undefined) booking.status = data.status;
        if (data.estimatedPrice !== undefined) booking.estimatedPrice = Number(data.estimatedPrice);
        if (data.vehicleName !== undefined) booking.vehicleName = data.vehicleName;
        if (data.vehicleNumber !== undefined) booking.vehicleNumber = data.vehicleNumber;
        if (data.createdAt !== undefined) booking.createdAt = new Date(data.createdAt);

        // Update mechanic assignment
        if (data.assignedMechanicId !== undefined) {
            booking.assignedMechanicId = data.assignedMechanicId;
        }
        if (data.mechanicName !== undefined) {
            booking.mechanicName = data.mechanicName;
        }

        // Store updated timestamp and admin who modified the booking
        booking.updatedAt = new Date();
        booking.modifiedByAdminId = adminUser.phone; // phone is unique login ID
        booking.modifiedByAdminName = adminUser.name;

        await booking.save();

        const newData = booking.toObject();

        // Create Activity Log
        await ActivityLog.create({
            adminId: adminUser.phone,
            adminName: adminUser.name,
            bookingId: booking._id.toString(),
            actionType: "Edit",
            oldData,
            newData
        });

        return booking;
    }

    /**
     * Delete booking details
     */
    async deleteBooking(bookingId, adminUser) {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            throw new AppError("Booking not found", 404);
        }

        const oldData = booking.toObject();

        await Booking.findByIdAndDelete(bookingId);

        // Create Activity Log
        await ActivityLog.create({
            adminId: adminUser.phone,
            adminName: adminUser.name,
            bookingId: bookingId,
            actionType: "Delete",
            oldData,
            newData: null
        });

        // Send audit email to admin
        const emailService = require("./emailService");
        emailService.sendDeletedBookingEmail(oldData).catch(err => {
            console.error(`❌ Error in async delete email triggering: ${err.message}`);
        });

        return { message: "Booking removed and deletion logged successfully" };
    }
}

module.exports = new BookingService();
