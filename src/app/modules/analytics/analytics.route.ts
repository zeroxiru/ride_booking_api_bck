import express from "express";
import { AnalyticsController } from "../analytics/analytics.controller";
import { checkAuth } from "../../middleWares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middleWares/validateRequest";
import { analyticsTimeRangeValidation, rideStatsValidation } from "../analytics/analytics.validation";

const router = express.Router();

router.get(
  "/dashboard",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(analyticsTimeRangeValidation),
  AnalyticsController.getDashboardOverview
);

router.get(
  "/rides/stats",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(rideStatsValidation),
  AnalyticsController.getRideStats
);

export const AnalyticsRoutes = router;