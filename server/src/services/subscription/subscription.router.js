import { Router } from "express";
import * as subscriptionService from "./subscription.service.js";
import { authentication, authorization } from "../../middleware/auth.middleware.js";

const router = Router();

// PayTabs webhook — NO auth (server-to-server from PayTabs)
router.post("/webhook", subscriptionService.handleWebhook);

// PayTabs browser return — NO auth (browser redirect from PayTabs — can be GET or POST)
router.get("/payment-return", subscriptionService.handlePaymentReturn);
router.post("/payment-return", subscriptionService.handlePaymentReturn);

// User routes
router.post("/subscribe", authentication(), subscriptionService.subscribe);
router.get("/me", authentication(), subscriptionService.getMySubscription);

// Admin routes
router.get("/all", authentication(), authorization(["admin"]), subscriptionService.getAllSubscriptions);
router.get("/stats", authentication(), authorization(["admin"]), subscriptionService.getSubscriptionStats);

export default router;
