import subscriptionModel from "../../DB/model/Subscription.model.js";
import planModel from "../../DB/model/Plan.model.js";
import { asyncHandler } from "../../utils/response/error.response.js";
import { successResponse } from "../../utils/response/success.response.js";

/* Subscribe to a Plan */
export const subscribe = asyncHandler(async (req, res, next) => {
    const { planId } = req.body;
    const userId = req.user._id;

    const plan = await planModel.findById(planId);
    if (!plan) {
        return next(new Error("الباقة غير موجودة", { cause: 404 }));
    }

    // Deactivate any existing active subscription
    await subscriptionModel.updateMany(
        { userId, status: 'active' },
        { status: 'expired', endDate: new Date() }
    );

    // Calculate end date based on billing period
    const startDate = new Date();
    const endDate = new Date(startDate);
    if (plan.billingPeriod === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
        endDate.setMonth(endDate.getMonth() + 1);
    }

    const subscription = await subscriptionModel.create({
        userId,
        planId,
        planName: plan.name,
        price: plan.priceAfterDiscount,
        billingPeriod: plan.billingPeriod,
        visits: plan.visits || 0,
        startDate,
        endDate,
        status: 'active'
    });

    return successResponse({
        res,
        message: "تم الاشتراك بنجاح",
        data: { subscription },
        status: 201
    });
});

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
