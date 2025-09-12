import { Schema } from "mongoose";
import { IRiderProfile } from "./rider.interface";
import { model } from "mongoose";

const riderProfileSchema = new Schema<IRiderProfile>({ 
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    paymentMethods: [{ 
        type: { type: String, enum: ['cash', 'card', 'mobile_money'], required: true },
        details: Schema.Types.Mixed,
        isDefault: { type: Boolean, default: false }
    }],
    favoriteLocations: [{
        name: String,
        address: String,
        coordinates: { type: [Number], index: '2dsphere' }
    }],
     totalRides: { type: Number, default: 0 },
    rating: Number
}, { timestamps: true, versionKey: false });


export const RiderProfile = model<IRiderProfile>('RiderProfile', riderProfileSchema);