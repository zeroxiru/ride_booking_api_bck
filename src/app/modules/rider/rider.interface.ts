/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";
import { IUser } from "../user/user.interface";


export interface IRiderProfile {
    _id?: Types.ObjectId;
    user: Types.ObjectId | IUser;
    slug: string; // Added slug field
    paymentMethods: {
        type: 'cash' | 'card' | 'mobile_money';
        details?: any;
        isDefault: boolean;
    }[];
    favoriteLocations?: {
        name: string;
        address: string;
        coordinates: [number, number]; // [longitude, latitude]
        slug?: string; // Slug for favorite locations
    }[];
    totalRides: number;
    rating?: number;
}