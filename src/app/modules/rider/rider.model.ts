import { Schema, model } from "mongoose";
import { IRiderProfile } from "./rider.interface";

const riderProfileSchema = new Schema<IRiderProfile>({ 
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, 
        unique: true 
    },
    paymentMethods: [{ 
        methodType: { 
            type: String, 
            enum: ['cash', 'card', 'mobile_money'], 
            required: true 
        },
        details: Schema.Types.Mixed,
        isDefault: { type: Boolean, default: false }
    }],
    favoriteLocations: [{
        name: String,
        address: String,
        coordinates: { 
            type: [Number], 
            index: '2dsphere' 
        }
    }],
    totalRides: { 
        type: Number, 
        default: 0 
    },
    rating: { 
        type: Number, 
        min: 0, 
        max: 5, 
        default: 0 
    }
}, { 
    timestamps: true, 
    versionKey: false 
});

// Add indexes for better performance
riderProfileSchema.index({ user: 1 });
riderProfileSchema.index({ 'favoriteLocations.coordinates': '2dsphere' });

export const RiderProfile = model<IRiderProfile>('RiderProfile', riderProfileSchema);