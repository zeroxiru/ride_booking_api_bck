// import jwt, { JwtPayload, SignOptions } from "jsonwebtoken"
// export const generateToken = (payload: JwtPayload, secret: string, expiresIn: string)=>{
// const token = jwt.sign(payload, secret, { 
//     expiresIn
// } as SignOptions)
// return token
// }

// export const verifyToken = (token: string, secret: string)=> { 
    
//     const verifiedToken = jwt.verify(token, secret);

//     return verifiedToken;
// }

import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import httpStatus from "http-status-codes";

// Define the standard token payload structure
export interface StandardJwtPayload extends JwtPayload {
  _id?: string;
  email?: string;
  role?: string;
  // Add other standard claims as needed
}

export const generateToken = (
  payload: StandardJwtPayload,
  secret: string,
  expiresIn: string
): string => {
  // Validate required fields
  if (!payload._id && !payload.email) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Token payload must contain _id"
    );
  }

  return jwt.sign(payload, secret, { expiresIn } as SignOptions);
};

export const verifyToken = (token: string, secret: string): StandardJwtPayload => {
  try {
    const verifiedToken = jwt.verify(token, secret);

    if (typeof verifiedToken !== "object" || verifiedToken === null) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token structure");
    }

    // Convert to StandardJwtPayload
    const payload = verifiedToken as StandardJwtPayload;
    
    // For newly issued tokens
    if (payload._id) {
      return payload;
    }
    
    // For legacy tokens (temporary backward compatibility)
    if (payload.email) {
      console.warn("Using email-based token - please migrate to _id-based tokens");
      return payload;
    }

    throw new AppError(httpStatus.UNAUTHORIZED, "Token missing required claims");
  } catch (error) {
    // Existing error handling...
  }
};
