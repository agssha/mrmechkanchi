const mongoose = require('mongoose');

const temporaryPermissionSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true,
    },
    permission: {
        type: String,
        enum: ['bookingEdit', 'bookingDelete', 'reviewAccess','custo'],
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('TemporaryPermission', temporaryPermissionSchema);
