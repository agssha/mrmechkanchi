const bcrypt = require('bcrypt');
const { Admin, TemporaryPermission, ActivityLog, Review } = require('../models');
const AppError = require('../utils/appError');
const { logActivity } = require('../middlewares/activityLogger');

/** Create a new ADMIN (created by SUPER_ADMIN) */
exports.createAdmin = async (req, res, next) => {
  try {
    const { name, email, phone, password, role = 'ADMIN' } = req.body;
    if (!name || !email || !phone || !password) {
      throw new AppError('Missing required fields', 400);
    }
    const existing = await Admin.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      throw new AppError('Admin with given email or phone already exists', 409);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await Admin.create({ 
      name, 
      email, 
      phone, 
      password: hashedPassword, 
      role: role.toUpperCase() 
    });
    
    await logActivity(req.user.phone, 'Create Admin', `Created admin ${email}`);
    res.status(201).json({ message: 'Admin created successfully', admin: { id: newAdmin._id, name: newAdmin.name, email: newAdmin.email, phone: newAdmin.phone, role: newAdmin.role } });
  } catch (err) {
    next(err);
  }
};

/** List all admins (excluding passwords) */
exports.getAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.find().select('-password');
    res.json({ admins });
  } catch (err) {
    next(err);
  }
};

/** Update admin details (including permissions) */
exports.updateAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, password, role, permissions } = req.body;
    
    const admin = await Admin.findById(id);
    if (!admin) throw new AppError('Admin not found', 404);

    if (name) admin.name = name;
    if (email) admin.email = email;
    if (phone) admin.phone = phone;
    if (role) admin.role = role.toUpperCase();
    if (permissions) admin.permissions = { ...admin.permissions, ...permissions };
    
    if (password) {
      admin.password = await bcrypt.hash(password, 10);
    }
    
    await admin.save();
    await logActivity(req.user.phone, 'Update Admin', `Updated admin ${admin.email}`);
    res.json({ message: 'Admin updated successfully', admin });
  } catch (err) {
    next(err);
  }
};

/** Delete an admin */
exports.deleteAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findByIdAndDelete(id);
    if (!admin) throw new AppError('Admin not found', 404);
    
    // Also clean up any temporary permissions
    await TemporaryPermission.deleteMany({ adminId: id });
    
    await logActivity(req.user.phone, 'Delete Admin', `Deleted admin ${admin.email}`);
    res.json({ message: 'Admin deleted successfully' });
  } catch (err) {
    next(err);
  }
};

/** Grant temporary or permanent permission */
exports.grantPermission = async (req, res, next) => {
  try {
    const { adminId, permission, durationType, durationValue } = req.body;
    if (!adminId || !permission || !durationType) {
      throw new AppError('Missing required fields: adminId, permission, durationType', 400);
    }

    const admin = await Admin.findById(adminId);
    if (!admin) throw new AppError('Admin not found', 404);

    if (durationType === 'permanent') {
      admin.permissions = admin.permissions || {};
      admin.permissions[permission] = true;
      await admin.save();
      await logActivity(req.user.phone, 'Grant Permission', `Granted permanent ${permission} to ${admin.phone}`);
      return res.json({ message: `Permanent permission ${permission} granted successfully.` });
    } else if (durationType === 'temporary') {
      const minutes = parseInt(durationValue, 10) || 60; // default 60 minutes
      const expiresAt = new Date(Date.now() + minutes * 60 * 1000);
      
      // Update or create TemporaryPermission record
      await TemporaryPermission.findOneAndUpdate(
        { adminId: admin._id, permission },
        { expiresAt },
        { upsert: true, new: true }
      );

      await logActivity(req.user.phone, 'Grant Permission', `Granted temporary ${permission} to ${admin.phone} for ${minutes} mins`);
      return res.json({ message: `Temporary permission ${permission} granted successfully for ${minutes} minutes.` });
    } else {
      throw new AppError('Invalid durationType. Use "permanent" or "temporary"', 400);
    }
  } catch (err) {
    next(err);
  }
};

/** Revoke permission */
exports.revokePermission = async (req, res, next) => {
  try {
    const { adminId, permission, permissionType } = req.body; // permissionType: 'permanent' or 'temporary'
    if (!adminId || !permission || !permissionType) {
      throw new AppError('Missing required fields: adminId, permission, permissionType', 400);
    }

    const admin = await Admin.findById(adminId);
    if (!admin) throw new AppError('Admin not found', 404);

    if (permissionType === 'permanent') {
      admin.permissions = admin.permissions || {};
      admin.permissions[permission] = false;
      await admin.save();
      await logActivity(req.user.phone, 'Revoke Permission', `Revoked permanent ${permission} from ${admin.phone}`);
      return res.json({ message: `Permanent permission ${permission} revoked successfully.` });
    } else {
      await TemporaryPermission.deleteOne({ adminId: admin._id, permission });
      await logActivity(req.user.phone, 'Revoke Permission', `Revoked temporary ${permission} from ${admin.phone}`);
      return res.json({ message: `Temporary permission ${permission} revoked successfully.` });
    }
  } catch (err) {
    next(err);
  }
};

/** Fetch activity logs */
exports.getActivityLogs = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find().sort({ timestamp: -1 });
    res.json({ logs });
  } catch (err) {
    next(err);
  }
};

/** Fetch all reviews */
exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
};