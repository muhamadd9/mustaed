import Router from "express";
import { authentication, authorization } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validation.middileware.js";
import {
    paymentIdSchema,
    createPaymentSchema,
    confirmPaymentSchema,
    refundPaymentSchema
} from "./payment.validation.js";
import * as paymentService from "./payment.service.js";

const paymentRouter = Router();

// All routes require authentication
paymentRouter.use(authentication(), authorization());

// Create payment
paymentRouter.post("/create", validate(createPaymentSchema), paymentService.createPayment);

// Confirm payment
paymentRouter.post("/confirm/:id", validate(confirmPaymentSchema), paymentService.confirmPayment);

// Get user payment history
paymentRouter.get("/user", paymentService.getUserPayments);

// Get payment details
paymentRouter.get("/:id", validate(paymentIdSchema), paymentService.getPaymentById);

// Admin only - Refund payment
paymentRouter.post("/refund/:id", authorization(['admin']), validate(refundPaymentSchema), paymentService.refundPayment);

export default paymentRouter;
