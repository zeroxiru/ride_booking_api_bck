"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const user_interface_1 = require("./user.interface");
const AuthProviderSchema = new mongoose_1.Schema({
    provider: { type: String, required: true },
    providerId: { type: String, required: true }
}, {
    versionKey: false,
    _id: false
});
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    phone: { type: String, required: false },
    picture: { type: String },
    status: {
        type: String,
        enum: Object.values(user_interface_1.UserStatus),
        default: user_interface_1.UserStatus.ACTIVE,
    },
    role: {
        type: String,
        enum: Object.values(user_interface_1.Role),
        required: true,
        default: user_interface_1.Role.RIDER
    },
    isDeleted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    auths: [AuthProviderSchema],
    blockedReason: String,
    // Add driverProfile and riderProfile fields
    driverProfile: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'DriverProfile',
        required: false
    },
    riderProfile: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'RiderProfile',
        required: false
    }
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Pre-save middleware to auto-verify riders
userSchema.pre('save', function (next) {
    // auto-verify if user is a rider
    if (this.role === user_interface_1.Role.RIDER && !this.isVerified) {
        this.isVerified = true;
    }
    next();
});
// // Virtual populate for driver and rider profiles
// userSchema.virtual('riderProfile', {
//     ref: 'RiderProfile',
//     localField: '_id',
//     foreignField: 'user',
//     justOne: true
// });
// userSchema.virtual('driverProfile', {
//     ref: 'DriverProfile',
//     localField: '_id',
//     foreignField: 'user',
//     justOne: true
// });
exports.User = (0, mongoose_1.model)("User", userSchema);
