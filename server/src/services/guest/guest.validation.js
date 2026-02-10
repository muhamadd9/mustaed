import Joi from "joi";
import { generalFeilds } from "../../middleware/validation.middileware.js";

export const guestIdSchema = Joi.object()
    .keys({
        id: generalFeilds.id.required(),
    })
    .required();

export const invitationIdParamSchema = Joi.object()
    .keys({
        invitationId: generalFeilds.id.required(),
    })
    .required();

export const createGuestSchema = Joi.object()
    .keys({
        name: Joi.string().min(2).max(100).required(),
        phone: Joi.string().min(6).max(20).required(),
        invitation: generalFeilds.id.required()
    })
    .required();

export const createBulkGuestsSchema = Joi.object()
    .keys({
        invitation: generalFeilds.id.required(),
        guests: Joi.array().items(
            Joi.object({
                name: Joi.string().min(2).max(100).required(),
                phone: Joi.string().min(6).max(20).required()
            })
        ).min(1).required()
    })
    .required();

export const updateGuestSchema = Joi.object()
    .keys({
        id: generalFeilds.id.required(),
        name: Joi.string().min(2).max(100).optional(),
        phone: Joi.string().min(6).max(20).optional(),
        rsvpStatus: Joi.string().valid("pending", "accepted", "declined").optional()
    })
    .required();

export const checkInSchema = Joi.object()
    .keys({
        id: generalFeilds.id.required()
    })
    .required();
