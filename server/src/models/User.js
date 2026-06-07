const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
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
    mechanicType: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatic timers
});

const User = mongoose.model("User", userSchema);

module.exports = User;
