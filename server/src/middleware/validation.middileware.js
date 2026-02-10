import Joi from "joi";
import mongoose from "mongoose";

const validObjectId = (value, helpers) => {
  return mongoose.Types.ObjectId.isValid(value) ? true : helpers.message("المعرف غير صالح");
};
const getMessages = (field) => ({
  "string.base": `يجب أن يكون ${field} نصاً`,
  "string.empty": `لا يمكن أن يكون ${field} فارغاً`,
  "string.min": `يجب أن يحتوي ${field} على {#limit} أحرف على الأقل`,
  "string.max": `يجب أن لا يتجاوز ${field} {#limit} أحرف`,
  "string.email": `يجب إدخال بريد إلكتروني صالح`,
  "string.pattern.base": `تنسيق ${field} غير صالح`,
  "any.required": `${field} مطلوب`,
  "any.only": `يجب أن يكون ${field} مطابقاً لـ {#valids}`,
  "number.base": `يجب أن يكون ${field} رقماً`,
  "number.min": `يجب أن يكون ${field} أكبر من أو يساوي {#limit}`,
  "number.integer": `يجب أن يكون ${field} عدداً صحيحاً`,
});

export const generalFeilds = {
  name: Joi.string().min(6).max(50).messages(getMessages("الاسم")),
  email: Joi.string().email().messages(getMessages("البريد الإلكتروني")),
  password: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
    .messages({
      ...getMessages("كلمة المرور"),
      "string.pattern.base": "يجب أن تتكون كلمة المرور من 3 إلى 30 حرفاً أو رقماً",
    }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).messages({
    ...getMessages("تأكيد كلمة المرور"),
    "any.only": "كلمة المرور غير متطابقة",
  }),
  otp: Joi.string().min(4).max(4).messages(getMessages("رمز التحقق")),
  id: Joi.string().custom(validObjectId).messages(getMessages("المعرف")),
  nationalId: Joi.string().min(6).max(20).messages(getMessages("الرقم القومي")),
  nationalIdNumber: Joi.number().integer().min(1).messages(getMessages("رقم الهوية")),
};

export const validate = (schema) => {
  return (req, res, next) => {
    const data = { ...req.params, ...req.query, ...req.body };

    // Do not inject implicit file fields here; upload middleware normalizes into req.body

    const result = schema.validate(data, { abortEarly: false });

    if (result.error) {
      const messageList = result.error.details.map((obj) => obj.message);

      return res.status(400).json({ success: false, message: messageList });
    }

    return next();
  };
};
