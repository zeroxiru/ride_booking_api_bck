/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response, Router } from "express";
import { UserControllers } from "./user.controller";
 import { AnyZodObject } from "zod";
import z from "zod";
import { createUserZodSchema } from "./user.validation";
import { validateRequest } from "../../middleWares/validateRequest";


const router = Router();

router.post("/register",validateRequest(createUserZodSchema), UserControllers.createUser);
router.get("/all-users", UserControllers.getAllUsers);

export const UserRoutes = router;
