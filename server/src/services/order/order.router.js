import { Router } from "express";
import * as orderService from "./order.service.js";
import { authentication, authorization } from "../../middleware/auth.middleware.js";

const router = Router();

// User routes
router.post("/", authentication(), orderService.createOrder);
router.get("/me", authentication(), orderService.getMyOrders);

// Admin routes
router.get("/all", authentication(), authorization(["admin"]), orderService.getAllOrders);
router.get("/:id", authentication(), authorization(["admin"]), orderService.getOrderById);
router.patch("/:id/status", authentication(), authorization(["admin"]), orderService.updateOrderStatus);

export default router;
