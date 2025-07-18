import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { UserServices } from "../user/user.service";
import { sendResponse } from "../../utils/senResponse";
import httpStatus from "http-status-codes";
import bcryptjs from  "bcryptjs"
import { AuthServices } from "./auth.service";

const credentialsLogin = catchAsync(async(req: Request, res: Response, next: NextFunction)=> { 
     const loginInfo = await AuthServices.credentialsLogin(req.body)

       sendResponse(res, { 
        success: true,
        statusCode: httpStatus.OK,
        message: "User  Login Successfully",
        data: loginInfo,
      })
})

export const  AuthControllers = { 
    credentialsLogin
}