const bcrypt = require("bcrypt");
const { User, Booking } = require("../models");
const STATUS = require("../constants/status");
const AppError = require("../utils/appError");

class MechanicService {
    /**
     * Admin resets a mechanic's password
     */
    async resetMechanicPassword(mechanicPhone, newPassword) {
        const mechanic = await User.findOne({ phone: mechanicPhone });
        if (!mechanic) {
            throw new AppError("Mechanic not found", 404);
        }

        mechanic.password = await bcrypt.hash(newPassword, 10);
        await mechanic.save();

        return { message: `Password updated successfully for mechanic: ${mechanic.name}` };
    }

    /**
     * List all active mechanics
     */
    async getMechanics() {
        return await User.find({}, "name phone mechanicType");
    }

    /**
     * Get specific bookings assigned to a mechanic
     */
    async getMechanicBookings(mechanicPhone, requesterPhone, requesterRole) {
        // Enforce identification match check unless user is admin
        if (requesterRole !== "admin" && requesterPhone !== mechanicPhone) {
            throw new AppError("Access Denied: Identification match verification failed.", 403);
        }

        const data = await Booking.find({ assignedMechanicId: mechanicPhone }).sort({ createdAt: -1 });

        return data.map(b => {
            const activeJob = b.status === STATUS.ACCEPTED || b.status === STATUS.PRICE_SET || b.status === STATUS.COMPLETED;
            const bookingObj = b.toObject();
            bookingObj.mobileNumber = activeJob ? b.mobileNumber : "Hidden until Job Accepted";
            return bookingObj;
        });
    }
}

module.exports = new MechanicService();
