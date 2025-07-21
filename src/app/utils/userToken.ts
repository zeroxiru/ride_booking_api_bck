import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { IsActive, IUser } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { generateToken, verifyToken } from "./jwt";
import httpStatus from "http-status-codes"
import { JwtPayload } from "jsonwebtoken";

export const createUserTokens = (user: Partial<IUser>)=> { 

    const jwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role
  }
  const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES
  )

  const refreshToken =  generateToken(jwtPayload, envVars.JWT_REFRESH_SECRET,  envVars.JWT_REFRESH_EXPIRES)
   

  return { 
   accessToken,
   refreshToken  
}

}

export const createNewAccessTokenWithRefreshToken = async(refreshToken: string)=> { 
const verifyRefreshToken =  verifyToken(refreshToken, envVars.JWT_REFRESH_SECRET) as JwtPayload
 


  const isUserExist = await User.findOne({ email: verifyRefreshToken.email});

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not Exist");
  }

  if(isUserExist.isActive === IsActive.BLOCKED){ 
    throw new AppError(httpStatus.BAD_REQUEST, "User is Blocked");
  }
   if(isUserExist.isDeleted ){ 
    throw new AppError(httpStatus.BAD_REQUEST, "User is not Exist");
  }

   if(isUserExist.isActive === IsActive.INACTIVE){ 
    throw new AppError(httpStatus.BAD_REQUEST, "User is Inactive");
  }
 

  // const userTokens = createUserTokens(isUserExist)

  const JwtPayload = { 
    userId: isUserExist._id,
    email: isUserExist.email,
    role: isUserExist.role
  }
  const accessToken =  generateToken(JwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES)
  

  return accessToken


 
}