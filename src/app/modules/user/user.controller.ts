/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes"
import { UserServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { success } from "zod";
import { sendResponse } from "../../utils/senResponse";
import { verifyToken } from "../../utils/jwt";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

// const createuserFunction =  (req: Request, res: Response) => {
//  const user = await UserServices.createUser(req.body)

//     res.status(httpStatus.CREATED).json({
//       message: "User Created Successfully",
//       user,

// })
// }




// const createUser = async (req: Request, res: Response, next: NextFunction) => {
//   try {
  
//     // throw new AppError(httpStatus.BAD_REQUEST, "fake error")
  
    
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   } catch (err: any) {
//     console.log(err);
//    next(err)
//   }
// }

const createUser = catchAsync(async(req: Request, res: Response, next: NextFunction)=> { 
      const user = await UserServices.createUser(req.body)

       sendResponse(res, { 
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User  Created Successfully",
        data: user,
      })
})

const updateUser = catchAsync(async(req: Request, res: Response, next: NextFunction)=> { 
      const userId = req.params.id
      // const token = req.headers.authorization
      // const verifiedToken =  verifyToken(token as string, envVars.JWT_ACCESS_SECRET) as JwtPayload
      
      const verifiedToken = req.user
      const payload =  req.body
      const user = await  UserServices.updateUser(userId, payload, verifiedToken)

       sendResponse(res, { 
        success: true,
        statusCode: httpStatus.OK,
        message: "User  Updated Successfully",
        data: user,
      })
})


const getAllUsers = catchAsync (async(req: Request, res: Response, next: NextFunction)=> {
      const  result = await UserServices.getAllUsers();


       sendResponse(res, { 
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User  Created Successfully",
        data: result.data,
        meta: result.meta
      })
     
})


// function => req-res-function 

export const UserControllers = { 
    createUser,
    getAllUsers,
    updateUser
}

// route matching -> controller -> service -> model -> DB

