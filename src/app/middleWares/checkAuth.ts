/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import { User } from "../modules/user/user.model";
import httpStatus from "http-status-codes";
import { UserStatus, Role } from "../modules/user/user.interface";
import AppError from "../errorHelpers/AppError";
import { generateToken } from "../utils/jwt";

export const checkAuth = (...requiredRoles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = extractTokenFromHeader(req);
      const decoded = verifyJwtToken(token);

      // Ensure the token has _id
      if (!decoded._id) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token format");
      }

      // Find user by _id only
      const user = await User.findById(decoded._id).select(
        "+isActive +isDeleted"
      );

      attachUserToRequest(req, user);

      if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
      }

      // Check user status
      if (user.isDeleted) {
        throw new AppError(httpStatus.GONE, "Account deleted");
      }

      switch (user.status) {
        case UserStatus.BLOCKED:
          throw new AppError(httpStatus.FORBIDDEN, "Account blocked");
        case UserStatus.INACTIVE:
          throw new AppError(httpStatus.FORBIDDEN, "Account inactive");
      }

      checkUserAuthorization(user, requiredRoles);
      // Attach complete user object
      req.user = {
        _id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        name: user.name, // Add other fields you might need
        phone: user.phone,
      };

      next();
    } catch (error) {
      handleAuthError(error, next);
    }
  };
};

export const generateAuthTokens = (
  userId: string,
  email: string,
  role: Role
) => {
  return {
    accessToken: generateToken(
      { _id: userId, email, role },
      envVars.JWT_ACCESS_SECRET,
      envVars.JWT_ACCESS_EXPIRES
    ),
    refreshToken: generateToken(
      { _id: userId, email, role },
      envVars.JWT_REFRESH_SECRET,
      envVars.JWT_REFRESH_EXPIRES
    ),
  };
};

// Helper Functions
const extractTokenFromHeader = (req: Request): string => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Authorization header missing");
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Token not provided");
  }

  return token;
};

const verifyJwtToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, envVars.JWT_ACCESS_SECRET) as JwtPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Token expired");
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token");
    }
    throw new AppError(httpStatus.UNAUTHORIZED, "Authentication failed");
  }
};

// const findAndValidateUser = async (identifier: string) => {
//   const user = await User.findOne({
//     $or: [{ _id: identifier }, { email: identifier }]
//   }).select('+isActive +isDeleted');

//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, 'User not found');
//   }

//   if (user.isDeleted) {
//     throw new AppError(httpStatus.GONE, 'Account deleted');
//   }

//   switch (user.status) {
//     case UserStatus.BLOCKED:
//       throw new AppError(httpStatus.FORBIDDEN, 'Account blocked');
//     case UserStatus.INACTIVE:
//       throw new AppError(httpStatus.FORBIDDEN, 'Account inactive');
//   }

//   return user;
// };

const checkUserAuthorization = (user: any, requiredRoles: Role[]) => {
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `Access denied.Required roles: ${requiredRoles.join(", ")}. Your role: ${
        user.role
      }`
    );
  }
};

const attachUserToRequest = (req: Request, user: any) => {
  req.user = {
    _id: user._id.toString(),
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    name: user.name, // Add other fields you might need
    phone: user.phone,
  };
};

const handleAuthError = (error: any, next: NextFunction) => {
  if (error instanceof AppError) {
    next(error);
  } else {
    next(
      new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        error.message || "Authentication failed"
      )
    );
  }
};
