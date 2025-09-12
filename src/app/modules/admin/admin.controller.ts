import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/senResponse";
import { AdminServices } from "./admin.service";
import { IUser } from "../user/user.interface";
import AppError from "../../errorHelpers/AppError";

const  getAllUsers =  catchAsync(async(req: Request, res: Response)=> { 
    const { page= 1, limit =10, search, role, status} = req.query;

    const result =  await AdminServices.getAllUsers({ 
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        role: role as string,
        status: status as string
    });

      sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Users retrieved successfully",
    data: result.users,
    meta: result.meta
  });

})
const blockUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { reason } = req.body;
  
  const user = await AdminServices.blockUser(userId, reason);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User blocked successfully",
    data: user
  });
});

const unblockUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  const user = await AdminServices.unblockUser(userId);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User unblocked successfully",
    data: user
  });
});

const getAllDrivers = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, search, status, approved } = req.query;
  
  const result = await AdminServices.getAllDrivers({
    page: Number(page),
    limit: Number(limit),
    search: search as string,
    status: status as string,
    approved: approved as string
  });
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Drivers retrieved successfully",
    data: result.drivers,
    meta: result.meta
  });
});

const approveDriver = catchAsync(async (req: Request, res: Response) => {
  const { driverId } = req.params;
  const { reason } = req.body;
  const admin = req.user as IUser ;

    // Add null check for admin and admin._id
  if (!admin || !admin._id) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Admin authentication required");
  }
  
  const driver = await AdminServices.approveDriver(driverId, admin?._id, reason);
  
  if(typeof driver.user === 'object' && driver.user !== null && 'name' in driver.user){
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Driver approved successfully",
    data: { 
         driverId: driver._id,
    userId: driver.user._id,
    name: driver.user.name,
    approved: driver.approved,
    approvedAt: driver.approvedAt,
    approvedBy: driver.approvedBy
    }
  });
}else { 
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "User data not populated");
}
});

const suspendDriver = catchAsync(async (req: Request, res: Response) => {
  const { driverId } = req.params;
  const { reason } = req.body;
  
  const driver = await AdminServices.suspendDriver(driverId, reason);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Driver suspended successfully",
    data: driver
  });
});

const getAllRides = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, status, startDate, endDate } = req.query;
  
  const result = await AdminServices.getAllRides({
    page: Number(page),
    limit: Number(limit),
    status: status as string,
    startDate: startDate as string,
    endDate: endDate as string
  });
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rides retrieved successfully",
    data: result.rides,
    meta: result.meta
  });
});

const getRideDetails = catchAsync(async (req: Request, res: Response) => {
  const { rideId } = req.params;
  
  const ride = await AdminServices.getRideDetails(rideId);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Ride details retrieved successfully",
    data: ride
  });
});

const getSystemSummary = catchAsync(async (req: Request, res: Response) => {
  const summary = await AdminServices.getSystemSummary();
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "System summary retrieved successfully",
    data: summary
  });
});

const getRideReports = catchAsync(async (req: Request, res: Response) => {
  const { startDate, endDate, type } = req.query;
  
  const reports = await AdminServices.getRideReports({
    startDate: startDate as string,
    endDate: endDate as string,
    type: type as string
  });
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Ride reports retrieved successfully",
    data: reports
  });
});


export const AdminController = { 
    getAllUsers,
    blockUser,
    unblockUser,
    getAllDrivers,
    approveDriver,
    suspendDriver,
    getSystemSummary,
    getRideReports,
    getRideDetails,
    getAllRides
}