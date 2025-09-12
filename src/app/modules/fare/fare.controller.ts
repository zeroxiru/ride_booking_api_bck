import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/senResponse";
import { FareService } from "../fare/fare.service";
import { FareEstimationRequest } from "../fare/fare.interface";

const initializeConfigurations = catchAsync(async (req: Request, res: Response) => {
  await FareService.initializeFareConfigurations();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Fare configurations initialized successfully",
    data: null
  });
});

const estimateFare = catchAsync(async (req: Request, res: Response) => {

  try {
    const fareRequest: FareEstimationRequest = req.body;
    const result = await FareService.estimateFare(fareRequest);

    if (!result.success) {
      sendResponse(res, {
        success: false,
        statusCode: httpStatus.BAD_REQUEST,
        message: result.error || "Fare estimation failed",
        data: null
      });
      return;
    }
    
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Fare estimated successfully",
      data: result.data
    });
    
  } catch (error) {
    
    console.error('📝 [FareController] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    // Make sure to re-throw for catchAsync to handle
    throw error;
  }
});



const getFareConfigurations = catchAsync(async (req: Request, res: Response) => {
  
  const configurations = await FareService.getFareConfigurations();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Fare configurations retrieved successfully",
    data: configurations
  });
});

const updateFareConfiguration = catchAsync(async (req: Request, res: Response) => {
  const { vehicleType, ...config } = req.body;
  await FareService.updateFareConfiguration(vehicleType, config);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Fare configuration updated successfully",
    data: null
  });
});

const getFareConfigurationByType = catchAsync(async (req: Request, res: Response) => {
//   const { vehicleType } = req.params;

  const configuration = await FareService.getFareConfigurations();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Fare configuration retrieved successfully",
    data: configuration
  });
});

const deactivateFareConfiguration = catchAsync(async (req: Request, res: Response) => {
  const { vehicleType } = req.params;

  await FareService.deactivateConfiguration(vehicleType);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Fare configuration deactivated successfully",
    data: null
  });
});

const activateFareConfiguration = catchAsync(async (req: Request, res: Response) => {
  const { vehicleType } = req.params;

  await FareService.activateConfiguration(vehicleType);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Fare configuration activated successfully",
    data: null
  });
});

const getAllFareDocuments = catchAsync(async (req: Request, res: Response) => {
  const { page, limit } = req.query;

  const result = await FareService.getAllFareDocuments({
    page: parseInt(page as string) || 1,
    limit: parseInt(limit as string) || 10
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Fare documents retrieved successfully",
    data: result.documents,
    meta: result.meta
  });
});

export const FareController = {
  initializeConfigurations,
  estimateFare,
  getFareConfigurations,
  updateFareConfiguration,
  getFareConfigurationByType,
  deactivateFareConfiguration,
  activateFareConfiguration,
  getAllFareDocuments
};