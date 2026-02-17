import Router from "express";
import { authentication, authorization } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validation.middileware.js";
import { paymentIdSchema, refundPaymentSchema } from "./payment.validation.js";
import * as paymentService from "./payment.service.js";

const paymentRouter = Router();

// All routes require authentication + admin
paymentRouter.use(authentication(), authorization(["admin"]));

// Get all payments (admin)
paymentRouter.get("/all", paymentService.getAllPayments);

// Get payment stats (admin)
paymentRouter.get("/stats", paymentService.getPaymentStats);

// Get payment details (admin)
paymentRouter.get("/:id", validate(paymentIdSchema), paymentService.getPaymentById);

// Refund payment (admin)
paymentRouter.post("/refund/:id", validate(refundPaymentSchema), paymentService.refundPayment);

export default paymentRouter;
