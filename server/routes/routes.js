const express = require("express");
const router = express.Router();

// =========================================================================
// 1. DESTRUCTURE CONTROLLERS
// =========================================================================
// Pulls all backend operational logic handlers directly from your controller file
const {
    auth, 
    adminRegister,
    adminLogin,
    register,                     // Mechanic Register
    login,                        // Mechanic Login
    adminResetMechanicPassword,
    createBooking,
    getAllBookings,
    assignBooking,
    acceptJob,
    setPrice,
    recordCashPayment,
    recordOnlinePayment,
    trackBooking,
    addReview,
    getReviews,
    getMechanicBookings,
    updateStatus,
    getMechanics
} = require("../controllers/bookingController");

// =========================================================================
// 2. PUBLIC CUSTOMER GATEWAYS
// =========================================================================
// No authentication tokens required for public customer-facing components
router.post("/customer/book-repair", createBooking);

// UPDATED: Now expects an email parameter instead of a mobile number to match Google Auth
router.get("/customer/track/:email", trackBooking); 

router.post("/customer/submit-review", addReview);

// =========================================================================
// 3. CENTRAL SYSTEM AUTHENTICATION
// =========================================================================
// Access points to authenticate credentials and issue secure session JWTs
router.post("/auth/admin-register", adminRegister);
router.post("/auth/admin-login", adminLogin);
router.post("/auth/mechanic-login", login);

// =========================================================================
// 4. ADMIN SECURED ENDPOINTS (Protected via auth("admin"))
// =========================================================================
// Enforces strict Admin role verification for platform management
router.post("/admin/create-mechanic", auth("admin"), register);
router.put("/admin/reset-mechanic-password", auth("admin"), adminResetMechanicPassword);
router.get("/admin/bookings", auth("admin"), getAllBookings);
router.put("/admin/assign-job", auth("admin"), assignBooking);
router.get("/admin/reviews", auth("admin"), getReviews); // Protected from public view
router.get("/admin/mechanics", auth("admin"), getMechanics);
router.put("/admin/update-status", auth("admin"), updateStatus);

// =========================================================================
// 5. MECHANIC SECURED ENDPOINTS (Protected via auth("mechanic"))
// =========================================================================
// Mechanics can only interact with bookings assigned to their exact identity profile
router.get("/mechanic/my-jobs/:mechanicPhone", auth("mechanic"), getMechanicBookings);
router.put("/mechanic/accept-job", auth("mechanic"), acceptJob); // Unmasks customer phone number upon firing
router.put("/mechanic/set-charge", auth("mechanic"), setPrice);
router.put("/mechanic/confirm-cash", auth("mechanic"), recordCashPayment);

// =========================================================================
// 6. ONLINE PAYMENT GATEWAY INTEGRATION
// =========================================================================
// Backend confirmation endpoint called following successful Razorpay SDK payment completion
router.post("/payment/confirm-online", recordOnlinePayment);

module.exports = router;