import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { UserStatus, IUser } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { generateToken, verifyToken } from "./jwt";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";

export const createUserTokens = (user: Partial<IUser>) => {
  if (!user._id) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "User ID is required for token generation"
    );
  }

  const jwtPayload = {
    _id: user._id.toString(),  // Changed from userId to _id for consistency
    email: user.email,
    role: user.role
  };

  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES
  );

  const refreshToken = generateToken(
    jwtPayload,
    envVars.JWT_REFRESH_SECRET,
    envVars.JWT_REFRESH_EXPIRES
  );

  return {
    accessToken,
    refreshToken
  };
};

export const createNewAccessTokenWithRefreshToken = async (refreshToken: string) => {
  const verifyRefreshToken = verifyToken(refreshToken, envVars.JWT_REFRESH_SECRET) as JwtPayload;

  // Validate token has required fields
  if (!verifyRefreshToken._id) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid refresh token format");
  }

  // Find user by _id instead of email
  const isUserExist = await User.findById(verifyRefreshToken._id).select('+isActive +isDeleted');

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
  }

  // Validate user status
  if (isUserExist.status === UserStatus.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "User account is blocked");
  }
  if (isUserExist.isDeleted) {
    throw new AppError(httpStatus.GONE, "User account deleted");
  }
  if (isUserExist.status === UserStatus.INACTIVE) {
    throw new AppError(httpStatus.FORBIDDEN, "User account inactive");
  }

  // Generate new access token
  const newAccessToken = generateToken(
    {
      _id: isUserExist._id.toString(),
      email: isUserExist.email,
      role: isUserExist.role
    },
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES
  );

  return newAccessToken;
};