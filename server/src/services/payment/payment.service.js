import { asyncHandler } from "../../utils/response/error.response.js";
import { successResponse } from "../../utils/response/success.response.js";
import paymentModel from "../../DB/model/Payment.model.js";
import invitationModel from "../../DB/model/Invitation.model.js";
import { findById, getAll, create } from "../../DB/dbService.js";

// Create payment intent
export const createPayment = asyncHandler(async (req, res, next) => {
    const { invitation, plan, amount, extraGuests, paymentMethod } = req.body;

    // Verify invitation belongs to user
    const invitationDoc = await invitationModel.findById(invitation);
    if (!invitationDoc) return next(new Error("الدعوة غير موجودة", { cause: 404 }));

    if (invitationDoc.host.toString() !== req.user.id) {
        return next(new Error("غير مصرح لك بإنشاء عملية دفع لهذه الدعوة", { cause: 403 }));
    }

    const payment = await create({
        model: paymentModel,
        data: {
            user: req.user.id,
            invitation,
            plan,
            amount,
            extraGuests: extraGuests || 0,
            paymentMethod,
            status: "pending"
        }
    });

    return successResponse({ res, data: payment, message: "تم إنشاء عملية الدفع بنجاح" });
});

// Confirm payment (after payment gateway response)
export const confirmPayment = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { transactionId, status } = req.body;

    const payment = await paymentModel.findById(id);
    if (!payment) return next(new Error("عملية الدفع غير موجودة", { cause: 404 }));

    if (payment.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new Error("غير مصرح لك بتأكيد عملية الدفع هذه", { cause: 403 }));
    }

    payment.status = status;
    payment.transactionId = transactionId;
    await payment.save();

    return successResponse({ res, data: payment, message: "تم تأكيد عملية الدفع بنجاح" });
});

// Get user payment history
export const getUserPayments = asyncHandler(async (req, res) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 20, 1);
    const skip = (page - 1) * limit;
    const sort = { createdAt: -1 };

    const filter = { user: req.user.id };

    const [count, payments] = await getAll({
        model: paymentModel,
        filter,
        skip,
        limit,
        sort,
        populate: 'invitation plan'
    });

    return successResponse({ res, data: { count, page, limit, payments } });
});

// Get payment details
export const getPaymentById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const payment = await findById({
        model: paymentModel,
        id,
        populate: 'user invitation plan'
    });

    if (!payment) return next(new Error("عملية الدفع غير موجودة", { cause: 404 }));

    // Check authorization
    if (payment.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new Error("غير مصرح لك بعرض عملية الدفع هذه", { cause: 403 }));
    }

    return successResponse({ res, data: payment });
});

// Refund payment (admin only)
export const refundPayment = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { notes } = req.body;

    const payment = await paymentModel.findById(id);
    if (!payment) return next(new Error("عملية الدفع غير موجودة", { cause: 404 }));

    if (payment.status !== 'completed') {
        return next(new Error("يمكن استرداد المدفوعات المكتملة فقط", { cause: 400 }));
    }

    payment.status = 'refunded';
    if (notes) payment.notes = notes;
    await payment.save();

    return successResponse({ res, data: payment, message: "تم استرداد عملية الدفع بنجاح" });
});
