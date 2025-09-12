import express from "express";
import { DriverController } from "./driver.controller";
import { checkAuth } from "../../middleWares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middleWares/validateRequest";
import { driverValidations } from "./driver.validation";

const router =  express.Router();

router.patch("/rides/:rideId/accept", 
    checkAuth(Role.DRIVER),
    validateRequest(driverValidations.rideActionSchema),
    DriverController.acceptRide
)
router.patch("/rides/:rideId/reject",
  checkAuth(Role.DRIVER),
  validateRequest(driverValidations.rideActionSchema),
  DriverController.rejectRide
);
// Driver availability
router.patch("/availability",
  checkAuth(Role.DRIVER),
  validateRequest(driverValidations.availabilitySchema),
  DriverController.updateAvailability
);

// Update ride status
router.patch("/rides/:rideId/status",
  checkAuth(Role.DRIVER),
  validateRequest(driverValidations.rideStatusSchema),
  DriverController.updateRideStatus
);

// Get earnings history
router.get("/earnings",
  checkAuth(Role.DRIVER),
  validateRequest(driverValidations.earningsQuerySchema),
  DriverController.getEarningsHistory
);

// Update driver profile
router.patch("/profile",
  checkAuth(Role.DRIVER),
  validateRequest(driverValidations.updateProfileSchema),
  DriverController.updateAvailability
);

// Get driver profile
router.get("/profile",
  checkAuth(Role.DRIVER),
  DriverController.getDriverProfile
);

router.get("/rejections/history",
  checkAuth(Role.DRIVER),
  validateRequest(driverValidations.rejectionHistorySchema),
  DriverController.getDriverRejectionHistory
);

export const DriverRoutes = router;
