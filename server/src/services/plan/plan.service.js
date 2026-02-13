import planModel from "../../DB/model/Plan.model.js";
import subscriptionModel from "../../DB/model/Subscription.model.js";
import { asyncHandler } from "../../utils/response/error.response.js";
import { successResponse } from "../../utils/response/success.response.js";
import { create, find, findById, findOne, updateOne, deleteOne } from "../../DB/dbService.js";

/* Create Plan */
export const createPlan = asyncHandler(async (req, res, next) => {
    const { name, subtitle, description, price, discountPercentage, limits, isFeatured, features, billingPeriod, tag, type, visits } = req.body;

    // Check if name exists
    const existingPlan = await findOne({ model: planModel, filter: { name } });
    if (existingPlan) {
        return next(new Error("اسم الخطة موجود بالفعل", { cause: 409 }));
    }

    // Calculate priceAfterDiscount
    const discount = discountPercentage || 0;
    const priceAfterDiscount = price - (price * discount / 100);

    const plan = await create({
        model: planModel,
        data: {
            name,
            subtitle,
            description,
            price,
            discountPercentage: discount,
            priceAfterDiscount,
            limits,
            isFeatured,
            features,
            billingPeriod,
            tag,
            type,
            visits: visits || 0
        }
    });

    return successResponse({ res, message: "تم إنشاء الخطة بنجاح", data: { plan }, status: 201 });
});

/* Get All Plans */
export const getPlans = asyncHandler(async (req, res, next) => {
    const plans = await find({ model: planModel, filter: {} }); // Can add pagination later if needed
    return successResponse({ res, message: "تم جلب الخطط بنجاح", data: { plans } });
});

/* Get Single Plan */
export const getPlan = asyncHandler(async (req, res, next) => {
    const { planId } = req.params;
    const plan = await findById({ model: planModel, id: planId });
    if (!plan) {
        return next(new Error("الخطة غير موجودة", { cause: 404 }));
    }
    return successResponse({ res, message: "تم جلب الخطة بنجاح", data: { plan } });
});

/* Update Plan */
export const updatePlan = asyncHandler(async (req, res, next) => {
    const { planId } = req.params;
    const { name, subtitle, description, price, discountPercentage, limits, isFeatured, features, billingPeriod, tag, type, visits } = req.body;

    const plan = await findById({ model: planModel, id: planId });
    if (!plan) {
        return next(new Error("الخطة غير موجودة", { cause: 404 }));
    }

    if (name) {
        const existingName = await findOne({ model: planModel, filter: { name, _id: { $ne: planId } } });
        if (existingName) {
            return next(new Error("اسم الخطة موجود بالفعل", { cause: 409 }));
        }
    }

    // Recalculate price if necessary
    let newPriceAfterDiscount = plan.priceAfterDiscount;
    const newPrice = price !== undefined ? price : plan.price;
    const newDiscount = discountPercentage !== undefined ? discountPercentage : plan.discountPercentage;

    if (price !== undefined || discountPercentage !== undefined) {
        newPriceAfterDiscount = newPrice - (newPrice * newDiscount / 100);
    }

    const newVisits = visits !== undefined ? visits : plan.visits;
    // Normalize tag: empty string → null (removes the tag)
    const newTag = tag === '' ? null : tag;

    const updatedPlan = await planModel.findByIdAndUpdate(
        planId,
        {
            name,
            subtitle,
            description,
            price: newPrice,
            discountPercentage: newDiscount,
            priceAfterDiscount: newPriceAfterDiscount,
            limits,
            isFeatured,
            features,
            billingPeriod,
            tag: newTag,
            type,
            visits: newVisits
        },
        { new: true }
    );

    // If visits changed, sync all active subscriptions on this plan
    if (visits !== undefined && visits !== plan.visits) {
        const diff = visits - plan.visits; // e.g. plan had 6, now 10 → diff = +4
        if (diff !== 0) {
            await subscriptionModel.updateMany(
                { planId, status: 'active' },
                { $inc: { visits: diff } }
            );
        }
    }

    return successResponse({ res, message: "تم تحديث الخطة بنجاح", data: { plan: updatedPlan } });
});

/* Delete Plan */
export const deletePlan = asyncHandler(async (req, res, next) => {
    const { planId } = req.params;

    // Check if plan exists
    const plan = await findById({ model: planModel, id: planId });
    if (!plan) {
        return next(new Error("الخطة غير موجودة", { cause: 404 }));
    }

    // Check if plan is used by users? (Optional logic: prevent delete if users are subscribed)
    // For now, allow delete.

    await deleteOne({ model: planModel, filter: { _id: planId } });

    return successResponse({ res, message: "تم حذف الخطة بنجاح" });
});
