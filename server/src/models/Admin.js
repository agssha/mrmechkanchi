const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["ADMIN", "SUPER_ADMIN"],
        default: "ADMIN"
    },
    permissions: {
        bookingEdit: { type: Boolean, default: false },
        bookingDelete: { type: Boolean, default: false },
        reviewAccess: { type: Boolean, default: false }
    },
    temporaryPermissions: [{
        permission: { type: String, enum: ["bookingEdit", "bookingDelete", "reviewAccess"] },
        expiresAt: { type: Date }
    }],
    lastLogin: {
        type: Date
    }
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
