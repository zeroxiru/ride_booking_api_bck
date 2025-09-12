import express from "express";
import { RideController } from "./ride.controller";
import { Role } from "../user/user.interface";
import { rideValidations } from "./ride.validation";
import { checkAuth } from "../../middleWares/checkAuth";
import { validateRequest } from "../../middleWares/validateRequest";
import { IUser } from "../user/user.interface";

declare module "express-serve-static-core" {
  interface Request {
    user?: IUser;
  }
}

const router = express.Router();

router.patch("/:rideId/cancel",
  checkAuth(Role.RIDER, Role.DRIVER, Role.ADMIN),
  validateRequest(rideValidations.cancelRideSchema),
  RideController.cancelRide as express.RequestHandler // Type assertion here
);


router.get("/:rideId/rejections",
  checkAuth(Role.DRIVER, Role.ADMIN, Role.RIDER), // Multiple roles can view
  validateRequest(rideValidations.rideIdSchema),
  RideController.getRideRejectionHistory
);

router.post('/:rideId/feedback',
  checkAuth(Role.RIDER, Role.DRIVER),
  validateRequest(rideValidations.submitFeedbackSchema),
  RideController.submitFeedback as express.RequestHandler
);


export const RideRoutes = router;