/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
import AppError from "../../errorHelpers/AppError";
import {  IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import httpStatus, { INSUFFICIENT_STORAGE } from "http-status-codes";
import bcryptjs from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { generateToken, verifyToken } from "../../utils/jwt";
import { envVars } from "../../config/env";
import { createNewAccessTokenWithRefreshToken, createUserTokens } from "../../utils/userToken";

// const credentialsLogin = async (payload: Partial<IUser>) => {
//   const { email, password } = payload;

//   const isUserExist = await User.findOne({ email });

//   if (!isUserExist) {
//     throw new AppError(httpStatus.BAD_REQUEST, "Email does not Exist");
//   }
//   const isPasswordMatched = await bcryptjs.compare(
//     password as string,
//     isUserExist.password as string
//   );

//   if (!isPasswordMatched) {
//     throw new AppError(httpStatus.BAD_REQUEST, "Incorrect password");
//   }

//   const userTokens = createUserTokens(isUserExist)

//   const { password: pass, ...rest } = isUserExist.toObject();
//   return {
//     accessToken : userTokens.accessToken,
//     refreshToken :userTokens.refreshToken,
//     user: rest,
//   };
// };

const getNewAccessToken = async (refreshToken: string) => {
  const   newAccessToken = await  createNewAccessTokenWithRefreshToken(refreshToken)
  return {
    accessToken : newAccessToken
  };
};

const resetPassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {
 
   // Add null checking for decodedToken
  if (!decodedToken || !decodedToken._id) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token');
  }
  const user = await User.findById(decodedToken._id)

  if(!user){ 
    throw new AppError(httpStatus.NOT_FOUND, "User not Found")
  }
  const isOldPasswordMatch =  await bcryptjs.compare(oldPassword, user!.password as string)
  
  if(!isOldPasswordMatch) { 
 throw new AppError(httpStatus.UNAUTHORIZED, "Old password does not match")
  }
   user!.password = await bcryptjs.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUND))
   user!.save();
   
};


// const resetPassword = async (oldPassword: string, newPassword: string, decodedToken: any) => {
//   // More flexible check
//   if (!decodedToken || decodedToken._id) {
//     throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token');
//   }
  
//   const userId = decodedToken.userId || decodedToken.id || decodedToken.sub;
//   if (!userId) {
//     throw new AppError(httpStatus.UNAUTHORIZED, 'User ID not found in token');
//   }
  
//   const user = await User.findById(userId);
//   // ... rest of your code
// };


export const AuthServices = {
  // credentialsLogin,
  getNewAccessToken,
  resetPassword
};
