/* eslint-disable @typescript-eslint/array-type */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { response } from "express";
import { IAuthProvider, IsActive, IUser, Role } from "./user.interface"
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

const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload)=> { 

    const isUserExist = await User.findById(userId);
    if(!isUserExist){ 
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
    }

    // if(isUserExist.isDeleted || isUserExist.isActive === IsActive.BLOCKED){ 
    //      throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
    // }
    /**
     * email -  can not be upload
     * name, phone, password, address
     * password -  rehashing
     * only admin and superAdmin -  rolw can upadte isdelete user
     * promoting  admin to superAdmin - only authorized is SuperAdmin
     * **/
    if(payload.role){ 
        if(decodedToken.role ===  Role.USER || decodedToken.role === Role.GUIDE){ 
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
        }

          if(payload.role ===  Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN){ 
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
        }
    }

    if(payload.isActive || payload.isDeleted || payload.isVerified){ 
        if(decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE){ 
         throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");   
        }
    }
    if(payload.password){ 
        payload.password = await bcryptjs.hash(payload.password, envVars.BCRYPT_SALT_ROUND)
    }
    const newUpdatedUser =  await User.findByIdAndUpdate(userId, payload, {new: true, runValidators: true})
    console.log(newUpdatedUser);
    return newUpdatedUser;
}

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