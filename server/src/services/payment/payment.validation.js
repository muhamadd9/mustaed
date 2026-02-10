import Joi from "joi";
import { generalFeilds } from "../../middleware/validation.middileware.js";

export const paymentIdSchema = Joi.object()
    .keys({
        id: generalFeilds.id.required(),
    })
    .required();

export const createPaymentSchema = Joi.object()
    .keys({
        invitation: generalFeilds.id.required(),
        plan: generalFeilds.id.optional(),
        amount: Joi.number().min(0).required(),
        extraGuests: Joi.number().min(0).optional(),
        paymentMethod: Joi.string().optional()
    })
    .required();

export const confirmPaymentSchema = Joi.object()
    .keys({
        id: generalFeilds.id.required(),
        transactionId: Joi.string().required(),
        status: Joi.string().valid("completed", "failed").required()
    })
    .required();

export const refundPaymentSchema = Joi.object()
    .keys({
        id: generalFeilds.id.required(),
        notes: Joi.string().optional()
    })
    .required();
