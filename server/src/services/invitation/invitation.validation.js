import Joi from "joi";
import { generalFeilds } from "../../middleware/validation.middileware.js";

export const invitationIdSchema = Joi.object()
    .keys({
        id: generalFeilds.id.required(),
    })
    .required();

export const createInvitationSchema = Joi.object()
    .keys({
        eventName: Joi.string().min(3).max(200).required(),
        eventDate: Joi.date().greater('now').required(),
        eventLocation: Joi.string().min(3).max(300).required(),
        locationCoordinates: Joi.object({
            lat: Joi.number().min(-90).max(90),
            lng: Joi.number().min(-180).max(180)
        }).optional(),
        plan: generalFeilds.id.optional()
    })
    .required();

export const updateInvitationSchema = Joi.object()
    .keys({
        id: generalFeilds.id.required(),
        eventName: Joi.string().min(3).max(200).optional(),
        eventDate: Joi.date().greater('now').optional(),
        eventLocation: Joi.string().min(3).max(300).optional(),
        locationCoordinates: Joi.object({
            lat: Joi.number().min(-90).max(90),
            lng: Joi.number().min(-180).max(180)
        }).optional(),
        status: Joi.string().valid("active", "completed", "cancelled").optional()
    })
    .required();
