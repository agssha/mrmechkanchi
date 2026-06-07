const mechanicService = require("../services/mechanicService");
const ApiResponse = require("../utils/apiResponse");

class MechanicController {
    /**
     * Admin resets a mechanic's password
     */
    async resetMechanicPassword(req, res, next) {
        try {
            const { mechanicPhone, newPassword } = req.body;
            const result = await mechanicService.resetMechanicPassword(mechanicPhone, newPassword);
            return ApiResponse.success(res, result.message, {}, 200);
        } catch (error) {
            next(error);
        }
    }

    /**
     * List all active mechanics
     */
    async getMechanics(req, res, next) {
        try {
            const mechanics = await mechanicService.getMechanics();
            return ApiResponse.success(res, "Mechanics retrieved", { mechanics }, 200);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get specific mechanic's assigned jobs list
     */
    async getMechanicBookings(req, res, next) {
        try {
            const { mechanicPhone } = req.params;
            const requesterPhone = req.user.phone;
            const requesterRole = req.user.role;
            const bookings = await mechanicService.getMechanicBookings(mechanicPhone, requesterPhone, requesterRole);
            return ApiResponse.success(res, "Bookings retrieved", { bookings }, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new MechanicController();
