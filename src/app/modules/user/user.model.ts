import { model, Schema } from "mongoose";
import { IAuthProvider, IUser, Role, UserStatus } from "./user.interface";

const AuthProviderSchema =  new Schema<IAuthProvider>({
    provider: {type: String, required: true},
    providerId: {type: String, required: true}
}, { 
    versionKey:false,
    _id:false
})

const userSchema = new Schema<IUser>({
    name : {type: String, required: true},
    email : { type: String, required: true, unique: true},
    password : {type: String},
    phone: {type: String, required: false},
    picture: {type: String},
    status: { 
        type: String,
        enum: Object.values(UserStatus),
        default: UserStatus.ACTIVE,
    },
    role : {
        type : String,
        enum : Object.values(Role),
        required : true,
        default : Role.RIDER
    },
    isDeleted: {type: Boolean, default: false},
    isVerified: {type: Boolean, default: false},
    auths: [AuthProviderSchema],
    blockedReason: String,

    // Add driverProfile and riderProfile fields
    driverProfile: {
        type: Schema.Types.ObjectId,
        ref: 'DriverProfile',
        required: false
    },
    riderProfile: {
        type: Schema.Types.ObjectId,
        ref: 'RiderProfile', 
        required: false
    }
  
}, { 

    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
    
})

// Pre-save middleware to auto-verify riders
userSchema.pre('save', function(next) { 
// auto-verify if user is a rider
if(this.role === Role.RIDER && !this.isVerified){ 
    this.isVerified = true;
}
next()
})
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

export const User =  model<IUser>("User", userSchema)