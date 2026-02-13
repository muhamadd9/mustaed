import { Router } from "express";
import * as subscriptionService from "./subscription.service.js";
import { authentication, authorization } from "../../middleware/auth.middleware.js";

const router = Router();

// User routes
router.post("/subscribe", authentication(), subscriptionService.subscribe);
router.get("/me", authentication(), subscriptionService.getMySubscription);

// Admin routes
router.get("/all", authentication(), authorization(["admin"]), subscriptionService.getAllSubscriptions);
router.get("/stats", authentication(), authorization(["admin"]), subscriptionService.getSubscriptionStats);

export default router;