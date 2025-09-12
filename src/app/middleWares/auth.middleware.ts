// import { NextFunction, Request, Response } from "express";
// import AppError from "../errorHelpers/AppError";
// import jwt, { JwtPayload } from "jsonwebtoken";
// import { envVars } from "../config/env";
// import { User } from "../modules/user/user.model";
// import httpStatus from "http-status-codes";
// import { IsActive, Role } from "../modules/user/user.interface";

// // Token types for better type safety
// type TokenType = 'access' | 'refresh';

// export interface AuthenticatedRequest extends Request {
//   user?: {
//     _id: string;
//     email: string;
//     role: Role;
//     isVerified: boolean;
//     tokenType: TokenType;
//   };
// }

// /**
//  * Main authentication middleware
//  * @param requiredRoles Array of allowed roles
//  * @param tokenType Type of token to verify (default: 'access')
//  */
// export const authenticate = (requiredRoles: Role[] = [], tokenType: TokenType = 'access') => {
//   return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
//     try {
//       // 1. Extract and verify token
//       const token = extractBearerToken(req);
//       const decoded = verifyJwt(token, tokenType);

//       // 2. Verify user exists and is active
//       const user = await findAndValidateUser(decoded.email);

//       // 3. Check role authorization
//       authorizeUser(user, requiredRoles);

//       // 4. Attach user data to request
//       req.user = {
//         _id: user._id.toString(),
//         email: user.email,
//         role: user.role as Role,
//         isVerified: user.isVerified,
//         tokenType
//       };

//       next();
//     } catch (error) {
//       next(error);
//     }
//   };
// };

// // Token verification with full env support
// const verifyJwt = (token: string, tokenType: TokenType): JwtPayload => {
//   const secret = tokenType === 'access' 
//     ? envVars.JWT_ACCESS_SECRET 
//     : envVars.JWT_REFRESH_SECRET;

//   try {
//     return jwt.verify(token, secret) as JwtPayload;
//   } catch (error) {
//     throw new AppError(
//       httpStatus.UNAUTHORIZED,
//       tokenType === 'access' 
//         ? 'Access token expired or invalid' 
//         : 'Refresh token expired or invalid'
//     );
//   }
// };

// // Token generation utilities (can be used in auth controllers)
// export const generateTokens = (payload: { email: string; role: Role; _id: string }) => {
//   const accessToken = jwt.sign(
//     payload,
//     envVars.JWT_ACCESS_SECRET,
//     { expiresIn: envVars.JWT_ACCESS_EXPIRES }
//   );

//   const refreshToken = jwt.sign(
//     payload,
//     envVars.JWT_REFRESH_SECRET,
//     { expiresIn: envVars.JWT_REFRESH_EXPIRES }
//   );

//   return { accessToken, refreshToken };
// };

// // Helper functions (extractBearerToken, findAndValidateUser, authorizeUser remain same as previous example)