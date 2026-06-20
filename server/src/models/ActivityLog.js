const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
    adminId: {
        type: String,
        required: true,
        trim: true
    },
    adminName: {
        type: String,
        required: true,
        trim: true
    },
    bookingId: {
        type: String,
        required: true,
        trim: true
    },
    actionType: {
        type: String,
        required: true,
        enum: ["Edit", "Delete"]
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
