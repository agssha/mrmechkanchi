const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
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
        enum: ["admin", "super_admin"],
        default: "admin"
    }
}, {
    timestamps: true
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
