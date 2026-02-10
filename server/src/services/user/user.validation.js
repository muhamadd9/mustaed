import Joi from "joi";
import { generalFeilds } from "../../middleware/validation.middileware.js";

const getMessages = (field) => ({
    "string.base": `يجب أن يكون ${field} نصاً`,
    "string.empty": `لا يمكن أن يكون ${field} فارغاً`,
    "string.min": `يجب أن يحتوي ${field} على {#limit} أحرف على الأقل`,
    "string.max": `يجب أن لا يتجاوز ${field} {#limit} أحرف`,
    "string.email": `يجب إدخال بريد إلكتروني صالح`,
    "any.required": `${field} مطلوب`,
    "any.only": `يجب أن يكون ${field} مطابقاً لـ {#valids}`,
});

export const userIdSchema = Joi.object()
    .keys({
        id: generalFeilds.id.required(),
    })
    .required();

// Logged-in user updating their own profile
export const updateProfileSchema = Joi.object()
    .keys({
        fullname: Joi.string().min(3).max(100).optional().messages(getMessages("الاسم الكامل")),
        city: Joi.string().trim().optional(),
        place: Joi.string().trim().optional(),
        district: Joi.string().trim().optional(),
        phone: Joi.string().min(6).max(20).optional().messages(getMessages("رقم الهاتف")),
    })
    .required();

// Admin creating a new user
export const adminCreateUserSchema = Joi.object()
    .keys({
        fullname: Joi.string().min(3).max(100).required().messages(getMessages("الاسم الكامل")),
        email: generalFeilds.email.optional(),
        phone: Joi.string().min(6).max(20).optional().messages(getMessages("رقم الهاتف")),
        city: Joi.string().trim().optional(),
        place: Joi.string().trim().optional(),
        district: Joi.string().trim().optional(),
        password: generalFeilds.password.required(),
        role: Joi.string().valid("admin", "user").required().messages(getMessages("الدور")),
    })
    .required();

// Admin updating an existing user
export const adminUpdateUserSchema = Joi.object()
    .keys({
        id: generalFeilds.id.required(),
        fullname: Joi.string().min(3).max(100).optional().messages(getMessages("الاسم الكامل")),
        email: generalFeilds.email.optional(),
        phone: Joi.string().min(6).max(20).optional().messages(getMessages("رقم الهاتف")),
        city: Joi.string().trim().optional(),
        place: Joi.string().trim().optional(),
        district: Joi.string().trim().optional(),
        password: generalFeilds.password.optional(),
        role: Joi.string().valid("admin", "user").optional().messages(getMessages("الدور")),
    })
    .required();

