import { Types } from "mongoose";
import { IRiderProfile } from "../rider/rider.interface";
import { IDriverProfile } from "../driver/driver.interface";

export enum Role { 
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    RIDER = "RIDER",
    DRIVER = "DRIVER",
    SYSTEM = "SYSTEM"
}

// auth providers
/**
 * email password credentials
 * google authentication
 * **/
export interface IAuthProvider { 

    provider: "google" | "credentials";
    providerId: string;
}
export enum UserStatus  { 
    ACTIVE = "ACTIVE",
    INACTIVE= "INACTIVE",
    BLOCKED = "BLOCKED",
    PENDING_APPROVAL = "PENDING_APPROVAL"
}

export interface IUser { 
    _id ?: Types.ObjectId; 
    name : string;
    email : string;
    password ?: string;
    phone ?: string;
    picture ?: string;
    status ?: UserStatus;
    isVerified ?: boolean;
    auths ?: IAuthProvider[];
    role : Role;
    isDeleted ?: string;
    blockedReason?: string;
        // Rider specific fields (optional)
    riderProfile?: Types.ObjectId | IRiderProfile;
    driverProfile?: Types.ObjectId | IDriverProfile
    
    // Driver specific fields (optional)
    // driverProfile?: Types.ObjectId | IDriverProfile;
}