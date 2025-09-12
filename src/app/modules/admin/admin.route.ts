import express from "express";
import { AdminController } from "../admin/admin.controller";
import { checkAuth } from "../../middleWares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middleWares/validateRequest";
import { adminValidations } from "../admin/admin.validation";

const router = express.Router();
//user management
router.get("/users", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), AdminController.getAllUsers )
router.patch("/users/:userId/block", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(adminValidations.userActionSchema), AdminController.blockUser);
router.patch("/users/:userId/unblock", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(adminValidations.userActionSchema), AdminController.unblockUser);

// Driver management
router.get("/drivers", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), AdminController.getAllDrivers);
router.patch("/drivers/:driverId/approve", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(adminValidations.driverActionSchema), AdminController.approveDriver);
router.patch("/drivers/:driverId/suspend", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(adminValidations.driverActionSchema), AdminController.suspendDriver);

// Ride management
router.get("/rides", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), AdminController.getAllRides);
router.get("/rides/:rideId", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(adminValidations.rideIdSchema), AdminController.getRideDetails);

// Reports
router.get("/reports/summary", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), AdminController.getSystemSummary);
router.get("/reports/rides", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(adminValidations.reportSchema), AdminController.getRideReports);
export const AdminRoutes = router;