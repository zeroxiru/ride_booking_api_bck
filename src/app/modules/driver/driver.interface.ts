import { Types } from "mongoose";
import { IUser } from "../user/user.interface";

export interface IVehicle {
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
}

export interface IDriverProfile {
  _id?: Types.ObjectId;
  user: Types.ObjectId | IUser;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  slug: string;
  vehicle: IVehicle;
  licenseNumber: string;
  insuranceProvider: string;
  insuranceValidUntil: Date;
  isOnline: boolean;
  isAvailable: boolean;
  currentLocation?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
  };
  totalRidesCompleted: number;
  rating?: number;
  documents: {
    license: string; // URL to license image
    insurance: string; // URL to insurance image
    vehicleRegistration: string; // URL to registration
  };
  approved: boolean;
  approvedBy?: Types.ObjectId | IUser;
  approvedAt?: Date;
  rejectionReason?: string;
  averageRating: number;
  totalRatings: number;
}