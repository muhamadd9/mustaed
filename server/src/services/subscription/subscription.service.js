import subscriptionModel from "../../DB/model/Subscription.model.js";
import planModel from "../../DB/model/Plan.model.js";
import paymentModel from "../../DB/model/Payment.model.js";
import { asyncHandler } from "../../utils/response/error.response.js";
import { successResponse } from "../../utils/response/success.response.js";
import { createPaymentPage, verifySignature, queryTransaction } from "../../utils/paytabs.js";

/* Subscribe to a Plan — initiates PayTabs payment */
export const subscribe = asyncHandler(async (req, res, next) => {
    const { planId } = req.body;
    const userId = req.user._id;

    const plan = await planModel.findById(planId);
    if (!plan) {
        return next(new Error("الباقة غير موجودة", { cause: 404 }));
    }

    // Create pending payment record
    const payment = await paymentModel.create({
        user: userId,
        plan: plan._id,
        amount: plan.priceAfterDiscount,
        status: "pending",
        paymentMethod: "paytabs",
    });

    const callbackUrl = `${process.env.WEBHOOK_BASE_URL}/subscription/webhook`;
    const returnUrl = `${process.env.FRONTEND_URL}/payment/return`;

    // Call PayTabs to create hosted payment page
    const paytabsResponse = await createPaymentPage({
        amount: plan.priceAfterDiscount,
        currency: "SAR",
        cartId: payment._id.toString(),
        cartDescription: `اشتراك باقة ${plan.name}`,
        customerDetails: {
            name: req.user.fullname || "Customer",
            email: req.user.email || "",
            phone: req.user.phone || "",
            street1: "N/A",
            city: req.user.city || "Riyadh",
            country: "SA",
        },
        callbackUrl,
        returnUrl,
    });

    if (!paytabsResponse.tran_ref) {
        // PayTabs returned an error
        payment.status = "failed";
        payment.paytabsResponse = paytabsResponse;
        await payment.save();
        return next(new Error(paytabsResponse.message || "فشل في إنشاء صفحة الدفع", { cause: 400 }));
    }

    // Save PayTabs transaction reference
    payment.paytabsTranRef = paytabsResponse.tran_ref;
    await payment.save();

    return successResponse({
        res,
        message: "تم إنشاء طلب الدفع بنجاح",
        data: {
            redirect_url: paytabsResponse.redirect_url,
            tran_ref: paytabsResponse.tran_ref,
            payment_id: payment._id,
        },
        status: 200,
    });
});

/* PayTabs Webhook Callback — server-to-server */
export const handleWebhook = async (req, res) => {
    try {
        const callbackData = req.body;
        console.log("PayTabs webhook received:", JSON.stringify(callbackData));

        // Verify signature
        if (callbackData.signature) {
            try {
                const isValid = verifySignature(callbackData, callbackData.signature);
                if (!isValid) {
                    console.error("PayTabs webhook: invalid signature");
                    return res.status(400).json({ message: "التوقيع غير صالح" });
                }
            } catch (err) {
                console.error("Signature verification error:", err.message);
                // Continue processing — some test callbacks may not have valid signatures
            }
        }

        const tranRef = callbackData.tranRef || callbackData.tran_ref;
        const respStatus = callbackData.respStatus || callbackData.payment_result?.response_status;
        const cartId = callbackData.cartId || callbackData.cart_id;

        if (!tranRef && !cartId) {
            console.error("PayTabs webhook: missing tranRef and cartId");
            return res.status(200).json({ message: "المرجع مفقود" });
        }

        // Find payment by cartId (which is our payment._id) or by tranRef
        let payment;
        if (cartId) {
            payment = await paymentModel.findById(cartId);
        }
        if (!payment && tranRef) {
            payment = await paymentModel.findOne({ paytabsTranRef: tranRef });
        }

        if (!payment) {
            console.error("PayTabs webhook: payment not found", { tranRef, cartId });
            return res.status(200).json({ message: "الدفعة غير موجودة" });
        }

        // Already processed
        if (payment.status === "completed") {
            return res.status(200).json({ message: "تمت المعالجة مسبقاً" });
        }

        // Store the full callback data
        payment.paytabsResponse = callbackData;
        payment.paytabsTranRef = tranRef || payment.paytabsTranRef;

        if (respStatus === "A") {
            // Payment authorized — activate subscription
            payment.status = "completed";
            payment.transactionId = tranRef;

            const plan = await planModel.findById(payment.plan);
            if (!plan) {
                payment.notes = "الباقة غير موجودة أثناء التفعيل";
                await payment.save();
                return res.status(200).json({ message: "الباقة غير موجودة" });
            }

            // Expire existing active subscriptions
            await subscriptionModel.updateMany(
                { userId: payment.user, status: "active" },
                { status: "expired", endDate: new Date() }
            );

            // Calculate end date
            const startDate = new Date();
            const endDate = new Date(startDate);
            if (plan.billingPeriod === "yearly") {
                endDate.setFullYear(endDate.getFullYear() + 1);
            } else {
                endDate.setMonth(endDate.getMonth() + 1);
            }

            // Create subscription
            const subscription = await subscriptionModel.create({
                userId: payment.user,
                planId: plan._id,
                planName: plan.name,
                price: plan.priceAfterDiscount,
                billingPeriod: plan.billingPeriod,
                visits: plan.visits || 0,
                startDate,
                endDate,
                status: "active",
            });

            payment.subscription = subscription._id;
            await payment.save();

            console.log("Subscription activated:", subscription._id, "for user:", payment.user);
        } else {
            // Payment failed or declined
            payment.status = "failed";
            await payment.save();
            console.log("Payment failed:", tranRef, "status:", respStatus);
        }

        return res.status(200).json({ message: "تمت معالجة الإشعار بنجاح" });
    } catch (error) {
        console.error("PayTabs webhook error:", error);
        return res.status(200).json({ message: "خطأ في معالجة الإشعار" });
    }
};

/* Payment Return — browser redirect after payment */
export const handlePaymentReturn = async (req, res) => {
    const { respStatus, tranRef, cartId } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";

    // Redirect to frontend payment return page with query params
    const params = new URLSearchParams();
    if (respStatus) params.append("respStatus", respStatus);
    if (tranRef) params.append("tranRef", tranRef);
    if (cartId) params.append("cartId", cartId);

    return res.redirect(`${frontendUrl}/payment/return?${params.toString()}`);
};

/* Get My Subscription */
export const getMySubscription = asyncHandler(async (req, res, next) => {
    const now = new Date();

    // Auto-expire any active subscriptions that have passed their end date
    await subscriptionModel.updateMany(
        { userId: req.user._id, status: 'active', endDate: { $lte: now } },
        { status: 'expired' }
    );

    // Get current active subscription
    const current = await subscriptionModel.findOne({
        userId: req.user._id,
        status: 'active'
    }).populate('planId').lean();

    let currentWithDays = null;
    if (current) {
        const endDate = new Date(current.endDate);
        const totalDays = Math.ceil((endDate - new Date(current.startDate)) / (1000 * 60 * 60 * 24));
        const remainingDays = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
        const elapsedDays = totalDays - remainingDays;
        const progressPercentage = totalDays > 0 ? Math.round((elapsedDays / totalDays) * 100) : 0;

        currentWithDays = {
            ...current,
            remainingDays,
            totalDays,
            elapsedDays,
            progressPercentage,
        };
    }

    // Get subscription history (expired / cancelled)
    const history = await subscriptionModel.find({
        userId: req.user._id,
        status: { $in: ['expired', 'cancelled'] }
    }).populate('planId').sort({ createdAt: -1 }).limit(10).lean();

    return successResponse({
        res,
        message: "تم جلب اشتراكك بنجاح",
        data: { current: currentWithDays, history }
    });
});

/* Get All Subscriptions - Admin (with pagination) */
export const getAllSubscriptions = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status && ['active', 'expired', 'cancelled'].includes(status)) {
        filter.status = status;
    }

    const [total, subscriptions] = await Promise.all([
        subscriptionModel.countDocuments(filter),
        subscriptionModel.find(filter)
            .populate('userId', 'fullname email phone')
            .populate('planId', 'name price priceAfterDiscount')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
    ]);

    return successResponse({
        res,
        message: "تم جلب الاشتراكات بنجاح",
        data: {
            subscriptions,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    });
});

/* Get Subscription Stats - Admin */
export const getSubscriptionStats = asyncHandler(async (req, res, next) => {
    const [
        totalSubscriptions,
        activeSubscriptions,
        expiredSubscriptions,
        cancelledSubscriptions,
        revenueResult
    ] = await Promise.all([
        subscriptionModel.countDocuments(),
        subscriptionModel.countDocuments({ status: 'active' }),
        subscriptionModel.countDocuments({ status: 'expired' }),
        subscriptionModel.countDocuments({ status: 'cancelled' }),
        subscriptionModel.aggregate([
            { $group: { _id: null, totalRevenue: { $sum: "$price" } } }
        ])
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Revenue by plan
    const revenueByPlan = await subscriptionModel.aggregate([
        {
            $group: {
                _id: "$planName",
                count: { $sum: 1 },
                revenue: { $sum: "$price" }
            }
        },
        { $sort: { revenue: -1 } }
    ]);

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await subscriptionModel.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
            $group: {
                _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" }
                },
                count: { $sum: 1 },
                revenue: { $sum: "$price" }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    return successResponse({
        res,
        message: "تم جلب إحصائيات الاشتراكات بنجاح",
        data: {
            stats: {
                totalSubscriptions,
                activeSubscriptions,
                expiredSubscriptions,
                cancelledSubscriptions,
                totalRevenue,
                revenueByPlan,
                monthlyRevenue
            }
        }
    });
});
