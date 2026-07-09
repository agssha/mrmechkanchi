const express = require('express');
const superAdminController = require('../controllers/superAdminController');
const auth = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes require SUPER_ADMIN role
router.use(auth(['SUPER_ADMIN']));

// Admin CRUD
router.post('/create-admin', superAdminController.createAdmin);
router.post('/create-coupon', superAdminController.createCoupon);
router.delete('/coupons/:id', superAdminController.deleteCoupon);
router.get('/admins', superAdminController.getAdmins);
router.put('/admin/:id', superAdminController.updateAdmin);
router.delete('/admin/:id', superAdminController.deleteAdmin);

// Permission handling
router.post('/grant-permission', superAdminController.grantPermission);
router.post('/revoke-permission', superAdminController.revokePermission);

// Activity & Review endpoints
router.get('/activity-logs', superAdminController.getActivityLogs);
router.delete('/activity-logs/:id', superAdminController.deleteActivityLog);
router.post('/activity-logs/bulk-delete', superAdminController.bulkDeleteActivityLogs);

router.get('/reviews', superAdminController.getReviews);
router.delete('/reviews/:id', superAdminController.deleteReview);
router.post('/reviews/bulk-delete', superAdminController.bulkDeleteReviews);

module.exports = router;
