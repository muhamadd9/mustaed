import Joi from "joi";
import { generalFeilds } from "../../middleware/validation.middileware.js";

export const userIdSchema = Joi.object()
    .keys({
        id: generalFeilds.id.required(),
    })
    .required();

export const toggleUserStatusSchema = Joi.object()
    .keys({
        id: generalFeilds.id.required(),
        isActive: Joi.boolean().required()
    })
    .required();
