const ActivityLog = require('../models/ActivityLog');

/**
 * Helper to create an activity log entry.
 * @param {string} adminPhone - Phone of the admin performing the action.
 * @param {string} action - Short action name, e.g., 'Login', 'Logout', 'Permission Usage'.
 * @param {string} details - Additional details or context.
 */
async function logActivity(adminPhone, action, details) {
  try {
    await ActivityLog.create({
      adminId: adminPhone,
      action: action,
      details: details,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

module.exports = { logActivity };
