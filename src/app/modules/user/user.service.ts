/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { response } from "express";
import { IAuthProvider, IUser } from "./user.interface"
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";

const createUser = async (payload:  Partial<IUser>) => { 
    const { email, ...rest} = payload;
    
   const isUserExist =  await User.findOne({email})

   if(isUserExist){ 
     throw new AppError(httpStatus.BAD_REQUEST, "User already Exist")
   }

   const authProvider: IAuthProvider = {provider: "credentials", providerId: email!}
    const user = await User.create({
        
        email,
        auths: [authProvider],
        ...rest
    })
return user
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
    getAllUsers
}