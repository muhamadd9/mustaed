import { asyncHandler } from "../../utils/response/error.response.js";
import { successResponse } from "../../utils/response/success.response.js";
import paymentModel from "../../DB/model/Payment.model.js";
import { refundTransaction } from "../../utils/paytabs.js";

// Get all payments — admin only (paginated + filters)
export const getAllPayments = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status && ["pending", "completed", "failed", "refunded"].includes(status)) {
        filter.status = status;
    }

    const [total, payments] = await Promise.all([
        paymentModel.countDocuments(filter),
        paymentModel.find(filter)
            .populate("user", "fullname email phone")
            .populate("plan", "name price priceAfterDiscount")
            .populate("subscription", "status startDate endDate")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
    ]);

    return successResponse({
        res,
        message: "تم جلب المدفوعات بنجاح",
        data: {
            payments,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        },
    });
});

// Get payment stats — admin only
export const getPaymentStats = asyncHandler(async (req, res) => {
    const [
        totalPayments,
        completedPayments,
        pendingPayments,
        failedPayments,
        refundedPayments,
        revenueResult,
    ] = await Promise.all([
        paymentModel.countDocuments(),
        paymentModel.countDocuments({ status: "completed" }),
        paymentModel.countDocuments({ status: "pending" }),
        paymentModel.countDocuments({ status: "failed" }),
        paymentModel.countDocuments({ status: "refunded" }),
        paymentModel.aggregate([
            { $match: { status: "completed" } },
            { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
        ]),
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Monthly payments (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyPayments = await paymentModel.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo }, status: "completed" } },
        {
            $group: {
                _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                count: { $sum: 1 },
                revenue: { $sum: "$amount" },
            },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    return successResponse({
        res,
        message: "تم جلب إحصائيات المدفوعات بنجاح",
        data: {
            stats: {
                totalPayments,
                completedPayments,
                pendingPayments,
                failedPayments,
                refundedPayments,
                totalRevenue,
                monthlyPayments,
            },
        },
    });
});

// Get payment details
export const getPaymentById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const payment = await paymentModel.findById(id)
        .populate("user", "fullname email phone")
        .populate("plan", "name price priceAfterDiscount")
        .populate("subscription");

    if (!payment) return next(new Error("عملية الدفع غير موجودة", { cause: 404 }));

    return successResponse({ res, data: payment });
});

// Refund payment — admin only (calls PayTabs refund API)
export const refundPayment = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { notes } = req.body;

    const payment = await paymentModel.findById(id).populate("plan", "name");
    if (!payment) return next(new Error("عملية الدفع غير موجودة", { cause: 404 }));

    if (payment.status !== "completed") {
        return next(new Error("يمكن استرداد المدفوعات المكتملة فقط", { cause: 400 }));
    }

    if (!payment.paytabsTranRef) {
        return next(new Error("لا يوجد مرجع معاملة PayTabs للاسترداد", { cause: 400 }));
    }

    // Call PayTabs refund API
    const refundResult = await refundTransaction({
        tranRef: payment.paytabsTranRef,
        cartId: payment._id.toString(),
        cartDescription: `استرداد - ${payment.plan?.name || "اشتراك"}`,
        currency: "SAR",
        amount: payment.amount,
    });

    payment.status = "refunded";
    if (notes) payment.notes = notes;
    payment.paytabsResponse = { ...payment.paytabsResponse, refund: refundResult };
    await payment.save();

    return successResponse({ res, data: payment, message: "تم استرداد عملية الدفع بنجاح" });
});
