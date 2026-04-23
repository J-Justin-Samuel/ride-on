import express from "express";
import rideController from "../controllers/ride.controller.js";

const router = express.Router();

router.post("/request", rideController.createRide);
router.patch("/:rideId/cancel", rideController.cancelRide);
router.patch("/:rideId/complete", rideController.completeRide);
router.get("/:rideId", rideController.getRide);

export default router;
