const express = require("express");
const referralController = require("../controllers/referralController");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();

// Customer endpoints (called via public clients with Supabase session contexts)
router.post("/customer/sync-profile", referralController.syncCustomerProfile);
router.post("/customer/submit-referral", referralController.submitReferralCode);
router.get("/customer/referral-details/:identity", referralController.getCustomerReferralDetails);
router.post("/customer/validate-coupon", referralController.validateCoupon);

// Admin endpoints (secured by permanent session cookies/JWT tokens check)
router.get("/admin/referral-config", auth(["ADMIN", "SUPER_ADMIN"]), referralController.getReferralConfig);
router.put("/admin/referral-config", auth(["ADMIN", "SUPER_ADMIN"]), referralController.updateReferralConfig);
router.get("/admin/referral-activities", auth(["ADMIN", "SUPER_ADMIN"]), referralController.getAdminReferralActivities);
router.post("/admin/referrals/:referralId/action", auth(["ADMIN", "SUPER_ADMIN"]), referralController.adminResolveReferral);

module.exports = router;
