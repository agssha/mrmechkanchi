const referralService = require("../services/referralService");
const ApiResponse = require("../utils/apiResponse");
const AppError = require("../utils/appError");
const { Customer, Referral, Coupon, RewardLog, ReferralConfig } = require("../models");

class ReferralController {
    /**
     * Sync Customer Profile (Supabase Auth callback)
     */
    async syncCustomerProfile(req, res, next) {
        try {
            const clientIp = req.ip || req.headers["x-forwarded-for"] || "";
            const userAgent = req.headers["user-agent"] || "";
            const customer = await referralService.syncCustomerProfile(req.body, clientIp, userAgent);
            return ApiResponse.success(res, "Customer synced successfully", { customer }, 200);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Submit Referral Code
     */
    async submitReferralCode(req, res, next) {
        try {
            const { customerEmail, referralCode } = req.body;
            const clientIp = req.ip || req.headers["x-forwarded-for"] || "";
            const userAgent = req.headers["user-agent"] || "";

            if (!customerEmail) {
                throw new AppError("Customer email is required", 400);
            }

            const customer = await Customer.findOne({ email: customerEmail.toLowerCase() });
            if (!customer) {
                throw new AppError("Customer profile not found. Please log in first.", 404);
            }

            const referral = await referralService.submitReferralCode(customer._id, referralCode, clientIp, userAgent);
            return ApiResponse.success(res, "Referral code applied successfully!", { referral }, 200);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get Customer Referral details (dashboard stats)
     */
    async getCustomerReferralDetails(req, res, next) {
        try {
            const { identity } = req.params;
            const details = await referralService.getCustomerReferralDetails(identity);
            return ApiResponse.success(res, "Referral details retrieved successfully", details, 200);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Validate Coupon
     */
    async validateCoupon(req, res, next) {
        try {
            const { code, email, serviceCharge } = req.body;
            const charge = Number(serviceCharge) || 0;
            const result = await referralService.validateCoupon(code, email, charge);
            return ApiResponse.success(res, "Coupon validation success", result, 200);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Admin: Get Referral Config
     */
    async getReferralConfig(req, res, next) {
        try {
            let config = await ReferralConfig.findOne();
            if (!config) {
                config = await ReferralConfig.create({
                    referralTarget: 3,
                    rewardPercentage: 25,
                    couponExpiryDays: 90,
                    maxDiscountAmount: 500
                });
            }
            return ApiResponse.success(res, "Referral configurations retrieved", { config }, 200);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Admin: Update Referral Config
     */
    async updateReferralConfig(req, res, next) {
        try {
            const { referralTarget, rewardPercentage, couponExpiryDays, maxDiscountAmount } = req.body;
            let config = await ReferralConfig.findOne();
            if (!config) {
                config = new ReferralConfig();
            }

            if (referralTarget !== undefined) config.referralTarget = Number(referralTarget);
            if (rewardPercentage !== undefined) config.rewardPercentage = Number(rewardPercentage);
            if (couponExpiryDays !== undefined) config.couponExpiryDays = Number(couponExpiryDays);
            if (maxDiscountAmount !== undefined) config.maxDiscountAmount = Number(maxDiscountAmount);

            await config.save();
            return ApiResponse.success(res, "Referral configuration updated successfully", { config }, 200);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Admin: Get Referral Activities
     */
    async getAdminReferralActivities(req, res, next) {
        try {
            const referrals = await Referral.find()
                .populate("referrerId", "name email phone")
                .populate("referredId", "name email phone")
                .sort({ createdAt: -1 });

            const coupons = await Coupon.find()
                .populate("customerId", "name email phone")
                .sort({ createdAt: -1 });

            const rewardLogs = await RewardLog.find()
                .populate("customerId", "name email phone")
                .sort({ createdAt: -1 });

            return ApiResponse.success(res, "Admin referral activities retrieved", { referrals, coupons, rewardLogs }, 200);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Admin: Approve/Reject Referral manually
     */
    async adminResolveReferral(req, res, next) {
        try {
            const { referralId } = req.params;
            const { action, rejectionReason } = req.body;
            const adminPhone = req.user?.phone || "ADMIN";

            const referral = await Referral.findById(referralId);
            if (!referral) {
                throw new AppError("Referral not found", 404);
            }

            const referrer = await Customer.findById(referral.referrerId);
            const referred = await Customer.findById(referral.referredId);

            if (action === "approve") {
                referral.status = "Completed";
                referral.completedAt = new Date();
                referral.adminActionBy = adminPhone;
                referral.rejectionReason = null;
                await referral.save();

                await RewardLog.create({
                    customerId: referral.referrerId,
                    type: "REFERRAL_COMPLETED",
                    details: `Referral of ${referred ? referred.name : "Friend"} manually approved by Admin: ${adminPhone}`
                });

                // Trigger coupon check
                await referralService.checkAndGenerateReward(referral.referrerId);
            } else if (action === "reject") {
                referral.status = "Rejected";
                referral.rejectionReason = rejectionReason || "Manually rejected by Admin";
                referral.adminActionBy = adminPhone;
                await referral.save();
            } else {
                throw new AppError("Invalid action profile. Select 'approve' or 'reject'.", 400);
            }

            return ApiResponse.success(res, `Referral manually resolved: ${action}`, { referral }, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ReferralController();
