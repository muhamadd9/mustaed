import Joi from "joi";
import { generalFeilds } from "../../middleware/validation.middileware.js";

export const signupSchema = Joi.object()
  .keys({
    fullname: Joi.string().min(3).max(100).required(),
    email: generalFeilds.email.required(),
    password: generalFeilds.password.required(),
    phone: Joi.string().min(6).max(20).required(),
    city: Joi.string().trim().optional(),
    place: Joi.string().trim().optional(),
    district: Joi.string().trim().optional(),
    role: Joi.string().valid("admin", "user").optional(),
  })
  .required();

export const loginSchema = Joi.object()
  .keys({
    email: generalFeilds.email.required(),
    password: generalFeilds.password.required(),
  })
  .required();
export const resetPasswordSchema = Joi.object()
  .keys({
    id: generalFeilds.id.required(),
    password: generalFeilds.password.required(),
  })
  .required();
