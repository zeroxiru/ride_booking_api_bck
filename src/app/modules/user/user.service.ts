/* eslint-disable @typescript-eslint/array-type */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {  IUser, Role, UserStatus } from "./user.interface"
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import bcryptjs from "bcryptjs"
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

// const createUser = async (payload:  Partial<IUser>):Promise<IUser> => { 
//     const { email,password, phone, role, ...rest} = payload;

//      // Validate required fields
//   const requiredFields = ['email', 'password', 'phone', 'role'];
//   const missingFields = requiredFields.filter(
//     (field): field is keyof IUser => {
//         return payload[field] === undefined || payload[field] ===null
//      });
  
//   if (missingFields.length > 0) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       `Missing required fields: ${missingFields.join(', ')}`
//     );
//   }

//     if(!email || !password || !phone || !role){ 
//         throw new AppError(httpStatus.BAD_REQUEST, "Missing requirred Fileds");
//     }
    
//    const isUserExist =  await User.findOne({email})

//    if(isUserExist){ 
//      throw new AppError(httpStatus.BAD_REQUEST, "User already Exist")
//    }
//    const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND))
  
//    const authProvider: IAuthProvider = {provider: "credentials", providerId: email!}
//     const user = await User.create({
        
//         email,
//         password: hashedPassword,
//         phone,
//         role,
//         auths: [authProvider],
//         ...rest
//     })
// return user
// }

const createUser = async (payload: Partial<IUser>): Promise<IUser> => {
  // 1. Define required fields with proper typing
  const requiredFields: Array<keyof IUser> = ['email', 'password', 'phone', 'role'];
  
  // 2. Type-safe missing fields check
  const missingFields = requiredFields.filter((field): field is keyof IUser => {
    return payload[field] === undefined || payload[field] === null;
  });

  if (missingFields.length > 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Missing required fields: ${missingFields.join(', ')}`
    );
  }

  // 3. Now TypeScript knows these fields exist
  const { email, password, phone, role } = payload as Required<Pick<IUser, 'email' | 'password' | 'phone' | 'role'>>;
  
  // Rest of your implementation...
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already exists");
  }

  const hashedPassword = await bcryptjs.hash(password, Number(envVars.BCRYPT_SALT_ROUND));

  const user = await User.create({
    email,
    password: hashedPassword,
    phone,
    role,
    auths: [{ provider: "credentials", providerId: email }],
    // Only include additional fields that are safe to include
    name: payload.name,
    picture: payload.picture,
    status: payload.status,
    isVerified: payload.isVerified,
  });

  
  return user;
};

// const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload)=> { 

//     const isUserExist = await User.findById(userId);
//     if(!isUserExist){ 
//         throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
//     }

//     // if(isUserExist.isDeleted || isUserExist.isActive === IsActive.BLOCKED){ 
//     //      throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
//     // }
//     /**
//      * email -  can not be upload
//      * name, phone, password, address
//      * password -  rehashing
//      * only admin and superAdmin -  rolw can upadte isdelete user
//      * promoting  admin to superAdmin - only authorized is SuperAdmin
//      * **/
//     if(payload.role){ 
//         if(decodedToken.role ===  Role.RIDER || decodedToken.role === Role.DRIVER){ 
//             throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
//         }

//           if(payload.role ===  Role.SUPER_ADMIN && decodedToken.role !== Role.SUPER_ADMIN){ 
//             throw new AppError(httpStatus.FORBIDDEN, "Only Super Admin can assign Super Admin role");
//         }
//     }

//     if(payload.isActive || payload.isDeleted || payload.isVerified){ 
//         if(decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE){ 
//          throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");   
//         }
//     }
//     if(payload.password){ 
//         payload.password = await bcryptjs.hash(payload.password, envVars.BCRYPT_SALT_ROUND)
//     }
//     const newUpdatedUser =  await User.findByIdAndUpdate(userId, payload, {new: true, runValidators: true})
//     console.log(newUpdatedUser);
//     return newUpdatedUser;
// }

const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => { 
    const isUserExist = await User.findById(userId);
    if (!isUserExist) { 
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
    }

    /**
     * Restrictions:
     * - email cannot be updated (not explicitly restricted here but consider adding)
     * - name, phone, password, picture can be updated
     * - password will be rehashed
     * - only admin and superAdmin can update isDeleted, status, isVerified
     * - promoting admin to superAdmin - only authorized by SuperAdmin
     **/

    // Role update authorization check
    if (payload.role) { 
        // Check if current user has permission to update roles
        if (decodedToken.role === Role.RIDER || decodedToken.role === Role.DRIVER) { 
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to update roles");
        }

        // Only SUPER_ADMIN can promote to SUPER_ADMIN
        if (payload.role === Role.SUPER_ADMIN && decodedToken.role !== Role.SUPER_ADMIN) { 
            throw new AppError(httpStatus.FORBIDDEN, "Only Super Admin can assign Super Admin role");
        }

        // ADMIN cannot promote to SUPER_ADMIN or demote SUPER_ADMIN
        if (decodedToken.role === Role.ADMIN && 
            (payload.role === Role.SUPER_ADMIN || isUserExist.role === Role.SUPER_ADMIN)) {
            throw new AppError(httpStatus.FORBIDDEN, "Admin cannot modify Super Admin roles");
        }
    }

    // Authorization check for sensitive fields
    const sensitiveFields = ['status', 'isDeleted', 'isVerified', 'blockedReason'];
    const hasSensitiveFieldUpdate = Object.keys(payload).some(field => 
        sensitiveFields.includes(field)
    );

    if (hasSensitiveFieldUpdate) {
        if (decodedToken.role === Role.RIDER || decodedToken.role === Role.DRIVER) { 
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to update sensitive fields");
        }

        // Additional check for SUPER_ADMIN specific fields
        if (payload.status === UserStatus.BLOCKED && payload.blockedReason && 
            decodedToken.role !== Role.SUPER_ADMIN && decodedToken.role !== Role.ADMIN) {
            throw new AppError(httpStatus.FORBIDDEN, "Only Admin/Super Admin can block users with reason");
        }
    }

    // Prevent users from updating their own role or status
    if (userId === decodedToken._id) {
        if (payload.role || payload.status || payload.isDeleted) {
            throw new AppError(httpStatus.FORBIDDEN, "You cannot modify your own role or status");
        }
    }

    // Hash password if provided
    if (payload.password) { 
        payload.password = await bcryptjs.hash(payload.password, envVars.BCRYPT_SALT_ROUND);
    }

    // Prevent email updates (add this restriction)
    if (payload.email) {
        throw new AppError(httpStatus.BAD_REQUEST, "Email cannot be updated");
    }

    // Check if auths field is being updated (should be restricted)
    if (payload.auths) {
        throw new AppError(httpStatus.FORBIDDEN, "Auth providers cannot be modified");
    }

    const newUpdatedUser = await User.findByIdAndUpdate(
        userId, 
        payload, 
        { new: true, runValidators: true }
    );

    if (!newUpdatedUser) {
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to update user");
    }

    return newUpdatedUser;
};

const getAllUsers =  async () => { 
    const users =  await User.find({});

    const totalUsers = await User.countDocuments()

    return {
        data: users,
        meta: {
           total: totalUsers
         }
    };
}

export const UserServices = { 
    createUser,
    getAllUsers,
    updateUser
}