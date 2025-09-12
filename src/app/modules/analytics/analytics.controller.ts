import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/senResponse";
import { AnalyticsService } from "../analytics/analytics.service";
import { AnalyticsTimeRangeInput, RideStatsInput } from "../analytics/analytics.validation";
import { Ride } from "../ride/ride.model";

const getDashboardOverview = catchAsync(async (req: Request, res: Response) => {
  // The validated query parameters are now in req.query
  const { startDate, endDate, period } = req.query as AnalyticsTimeRangeInput;

  const timeRange = {
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
    period: period
  };

  const analytics = await AnalyticsService.getDashboardOverview(timeRange);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Dashboard analytics retrieved successfully",
    data: analytics
  });
});

const getRideStats = catchAsync(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query as RideStatsInput;

  const timeRange = {
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined
  };

  // Simple ride statistics
  const rideStats = await Ride.aggregate([
    {
      $match: {
        createdAt: {
          $gte: timeRange.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          $lte: timeRange.endDate || new Date()
        }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Ride statistics retrieved successfully",
    data: rideStats
  });
});

export const AnalyticsController = {
  getDashboardOverview,
  getRideStats
};