/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response, Router } from "express";
import { UserControllers } from "./user.controller";
import { AnyZodObject, object } from "zod";
import z from "zod";
import { createUserZodSchema } from "./user.validation";
import { validateRequest } from "../../middleWares/validateRequest";
import jwt, { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";
import { Role } from "./user.interface";
import { verifyToken } from "../../utils/jwt";
import { envVars } from "../../config/env";
import { checkAuth } from "../../middleWares/checkAuth";
import { AuthControllers } from "../auth/auth.controller";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserZodSchema),
  UserControllers.createUser
);
router.get(
  "/all-users",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  UserControllers.getAllUsers
);
router.patch("/:id", checkAuth(...Object.values(Role)), UserControllers.updateUser);

export const UserRoutes = router;
