import Joi from "joi";
import { generalFeilds } from "../../middleware/validation.middileware.js";

export const createPlanSchema = Joi.object({
    name: Joi.string().min(3).max(50).required().messages({
        "string.base": "اسم الخطة يجب أن يكون نصاً",
        "string.empty": "اسم الخطة مطلوب",
        "string.min": "اسم الخطة يجب أن لا يقل عن 3 أحرف",
        "string.max": "اسم الخطة يجب أن لا يزيد عن 50 حرفاً",
        "any.required": "اسم الخطة مطلوب"
    }),
    subtitle: Joi.string().min(3).max(100).optional(),
    description: Joi.string().min(3).max(500).optional().messages({
        "string.base": "الوصف يجب أن يكون نصاً",
        "string.min": "الوصف يجب أن لا يقل عن 3 أحرف",
        "string.max": "الوصف يجب أن لا يزيد عن 500 حرفاً"
    }),
    price: Joi.number().min(0).required().messages({
        "number.base": "السعر يجب أن يكون رقماً",
        "number.min": "السعر لا يمكن أن يكون أقل من 0",
        "any.required": "السعر مطلوب"
    }),
    discountPercentage: Joi.number().min(0).max(100).default(0).messages({
        "number.base": "نسبة الخصم يجب أن تكون رقماً",
        "number.min": "نسبة الخصم لا يمكن أن تكون أقل من 0",
        "number.max": "نسبة الخصم لا يمكن أن تكون أكثر من 100"
    }),
    features: Joi.array().items(Joi.string()).optional(),
    billingPeriod: Joi.string().valid('yearly', 'monthly').default('yearly'),
    tag: Joi.string().allow('', null).optional(),
    visits: Joi.number().min(1).required(),
    isFeatured: Joi.boolean().optional()
}).required();

export const updatePlanSchema = Joi.object({
    planId: generalFeilds.id.required(), // Assumes generalFeilds.id is Joi.string().hex().length(24)
    name: Joi.string().min(3).max(50).optional(),
    subtitle: Joi.string().min(3).max(100).optional(),
    description: Joi.string().min(3).max(500).optional(),
    price: Joi.number().min(0).optional(),
    discountPercentage: Joi.number().min(0).max(100).optional(),
    features: Joi.array().items(Joi.string()).optional(),
    billingPeriod: Joi.string().valid('yearly', 'monthly').optional(),
    tag: Joi.string().allow('', null).optional(),
    visits: Joi.number().min(1).optional(),
    isFeatured: Joi.boolean().optional()
}).required();

export const planIdSchema = Joi.object({
    planId: generalFeilds.id.required()
}).required();
