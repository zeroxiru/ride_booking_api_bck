import express from "express";
import { FareController } from "../fare/fare.controller";
import { checkAuth } from "../../middleWares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middleWares/validateRequest";
import { fareEstimationValidation, fareConfigUpdateValidation } from "../fare/fare.validation";

const router = express.Router();

// Initialize default configurations (admin endpoint)
router.post(
  "/configurations/initialize",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  FareController.initializeConfigurations
);

// Fare estimation endpoint (public - no auth required)
router.post(
  "/estimate",
  validateRequest(fareEstimationValidation),
  FareController.estimateFare
);

// Get fare configurations (public - no auth required)
router.get(
  "/configurations",
  FareController.getFareConfigurations
);

// Update fare configuration (admin endpoint)
router.patch(
  "/configurations",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(fareConfigUpdateValidation),
  FareController.updateFareConfiguration
);

export const FareRoutes = router;