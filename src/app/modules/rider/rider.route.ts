// src/modules/rider/rider.route.ts
import express from "express";
import {validateRequest} from "../../middleWares/validateRequest";
import { requestRideSchema } from "./rider.validation";
import { checkAuth } from "../../middleWares/checkAuth";
import { Role } from "../user/user.interface";
import {RiderController } from "./rider.controller";

const router = express.Router();

router.post("/request",
  checkAuth(Role.RIDER),
  validateRequest(requestRideSchema),
  RiderController.rideRequestHandler
);
router.get("/rides/history", 
  checkAuth(Role.RIDER),
  RiderController.getRideHistory
     
)

// router.patch(
//   '/cancel/:rideId',
//   checkAuth(Role.RIDER),
//   validateRequest(cancelRideSchema),
//   cancelRideHandler
// );

// router.get(
//   '/history',
//   checkAuth(Role.RIDER),
//   validateRequest(rideHistorySchema),
//   getRideHistoryHandler
// );

export const RiderRoutes = router;
