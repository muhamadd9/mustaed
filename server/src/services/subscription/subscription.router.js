import { Router } from "express";
import * as subscriptionService from "./subscription.service.js";
import { authentication } from "../../middleware/auth.middleware.js";

const router = Router();

// User routes
router.post("/subscribe", authentication(), subscriptionService.subscribe);
router.get("/me", authentication(), subscriptionService.getMySubscription);

// Admin routes
router.get("/all", authentication(), subscriptionService.getAllSubscriptions);

export default router;