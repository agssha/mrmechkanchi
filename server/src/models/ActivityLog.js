const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
    adminId: {
        type: String,
        required: true,
        trim: true
    },
    adminName: {
        type: String,
        trim: true,
        default: ""
    },
    bookingId: {
        type: String,
        trim: true,
        default: null
    },
    actionType: {
        type: String,
        default: null
    },
    action: {
        type: String,
        default: null
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    oldData: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    newData: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    }
}, {
    timestamps: true
});

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

module.exports = ActivityLog;

