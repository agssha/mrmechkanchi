const express = require('express');
const superAdminController = require('../controllers/superAdminController');
const auth = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes require SUPER_ADMIN role
router.use(auth(['SUPER_ADMIN']));

// Admin CRUD
router.post('/create-admin', superAdminController.createAdmin);
router.get('/admins', superAdminController.getAdmins);
router.put('/admin/:id', superAdminController.updateAdmin);
router.delete('/admin/:id', superAdminController.deleteAdmin);

// Permission handling
router.post('/grant-permission', superAdminController.grantPermission);
router.post('/revoke-permission', superAdminController.revokePermission);

// Activity & Review endpoints
router.get('/activity-logs', superAdminController.getActivityLogs);
router.get('/reviews', superAdminController.getReviews);

module.exports = router;
