const authService = require("../services/authService");
const ApiResponse = require("../utils/apiResponse");

class AuthController {
    /**
     * Admin register endpoint
     */
    async adminRegister(req, res, next) {
        try {
            const { name, phone, password } = req.body;
            const result = await authService.registerAdmin(name, phone, password);
            return ApiResponse.success(res, result.message, {}, 200);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Admin login endpoint
     */
    async adminLogin(req, res, next) {
        try {
            const { phone, password } = req.body;
            const result = await authService.loginAdmin(phone, password);
            return ApiResponse.success(res, result.message, { token: result.token }, 200);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Mechanic register endpoint (by Admin)
     */
    async registerMechanic(req, res, next) {
        try {
            const { name, phone, password, mechanicType } = req.body;
            const result = await authService.registerMechanic(name, phone, password, mechanicType);
            return ApiResponse.success(res, result.message, {}, 200);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Mechanic login endpoint
     */
    async loginMechanic(req, res, next) {
        try {
            const { phone, password } = req.body;
            const result = await authService.loginMechanic(phone, password);
            return ApiResponse.success(res, result.message, {
                token: result.token,
                mechanicType: result.mechanicType
            }, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
