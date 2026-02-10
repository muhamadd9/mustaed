import subscriptionModel from "../../DB/model/Subscription.model.js";
import planModel from "../../DB/model/Plan.model.js";
import { asyncHandler } from "../../utils/response/error.response.js";
import { successResponse } from "../../utils/response/success.response.js";

/* Subscribe to a Plan */
export const subscribe = asyncHandler(async (req, res, next) => {
    const { planId } = req.body;
    const userId = req.user._id;

    // 1. Check if plan exists
    const plan = await planModel.findById(planId);
    if (!plan) {
        return next(new Error("الخطة غير موجودة", { cause: 404 }));
    }

    // 2. Deactivate any existing active subscription
    await subscriptionModel.updateMany(
        { userId, status: 'active' },
        { status: 'expired', endDate: new Date() }
    );

    // 3. Create new subscription
    const subscription = await subscriptionModel.create({
        userId,
        planId,
        price: plan.priceAfterDiscount,
        totalInvitations: plan.limits.maxInvitations,
        usedInvitations: 0,
        status: 'active'
    });

    return successResponse({
        res,
        message: "تم الاشتراك بنجاح",
        data: { subscription },
        status: 201
    });
});

/* Get All Subscriptions (Admin) */
export const getAllSubscriptions = asyncHandler(async (req, res, next) => {
    const subscriptions = await subscriptionModel.find()
        .populate('userId', 'fullname email')
        .populate('planId', 'name')
        .sort({ createdAt: -1 });

    return successResponse({
        res,
        message: "تم جلب الاشتراكات بنجاح",
        data: { subscriptions }
    });
});

/* Get My Subscription */
export const getMySubscription = asyncHandler(async (req, res, next) => {
    const subscription = await subscriptionModel.findOne({
        userId: req.user._id,
        status: 'active'
    }).populate('planId');

    return successResponse({
        res,
        message: "تم جلب اشتراكك بنجاح",
        data: { subscription }
    });
});
