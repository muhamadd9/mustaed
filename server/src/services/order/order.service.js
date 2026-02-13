import orderModel from "../../DB/model/Order.model.js";
import subscriptionModel from "../../DB/model/Subscription.model.js";
import { asyncHandler } from "../../utils/response/error.response.js";
import { successResponse } from "../../utils/response/success.response.js";

/* Create Order - User must have active subscription with visits > 0 */
export const createOrder = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const { city, place, district, notes } = req.body;

    if (!city || !place || !district) {
        return next(new Error("يجب إدخال المدينة والمنطقة والحي", { cause: 400 }));
    }

    // Find active subscription
    const subscription = await subscriptionModel.findOne({
        userId,
        status: 'active'
    });

    if (!subscription) {
        return next(new Error("يجب أن يكون لديك اشتراك نشط لطلب زيارة", { cause: 403 }));
    }

    if (subscription.visits <= 0) {
        return next(new Error("لا يوجد لديك زيارات متبقية في اشتراكك الحالي", { cause: 403 }));
    }

    const order = await orderModel.create({
        userId,
        subscriptionId: subscription._id,
        city,
        place,
        district,
        notes: notes || ''
    });

    return successResponse({
        res,
        message: "تم إنشاء طلب الزيارة بنجاح",
        data: { order },
        status: 201
    });
});

/* Get My Orders - User */
export const getMyOrders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    const filter = { userId: req.user._id };
    if (status && ['pending', 'in_progress', 'done'].includes(status)) {
        filter.status = status;
    }

    const [total, orders] = await Promise.all([
        orderModel.countDocuments(filter),
        orderModel.find(filter)
            .populate('subscriptionId', 'planName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
    ]);

    return successResponse({
        res,
        message: "تم جلب طلباتك بنجاح",
        data: {
            orders,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    });
});

/* Get All Orders - Admin (with pagination & filter) */
export const getAllOrders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status && ['pending', 'in_progress', 'done'].includes(status)) {
        filter.status = status;
    }

    const [total, orders, stats] = await Promise.all([
        orderModel.countDocuments(filter),
        orderModel.find(filter)
            .populate('userId', 'fullname email phone city place district')
            .populate('subscriptionId', 'planName visits')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        orderModel.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ])
    ]);

    const statsMap = {
        total: 0,
        pending: 0,
        in_progress: 0,
        done: 0
    };
    stats.forEach(s => {
        statsMap[s._id] = s.count;
        statsMap.total += s.count;
    });

    return successResponse({
        res,
        message: "تم جلب جميع الطلبات بنجاح",
        data: {
            orders,
            stats: statsMap,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    });
});

/* Get Single Order - Admin */
export const getOrderById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const order = await orderModel.findById(id)
        .populate('userId', 'fullname email phone city place district')
        .populate('subscriptionId', 'planName visits startDate endDate');

    if (!order) {
        return next(new Error("الطلب غير موجود", { cause: 404 }));
    }

    return successResponse({
        res,
        message: "تم جلب تفاصيل الطلب بنجاح",
        data: { order }
    });
});

/* Update Order Status - Admin */
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['in_progress', 'done'].includes(status)) {
        return next(new Error("الحالة غير صالحة. يجب أن تكون 'in_progress' أو 'done'", { cause: 400 }));
    }

    const order = await orderModel.findById(id);
    if (!order) {
        return next(new Error("الطلب غير موجود", { cause: 404 }));
    }

    // Prevent changing status of already done orders
    if (order.status === 'done') {
        return next(new Error("لا يمكن تغيير حالة طلب مكتمل", { cause: 400 }));
    }

    order.status = status;
    await order.save();

    // If status changed to done, decrement visits on subscription
    if (status === 'done') {
        await subscriptionModel.findByIdAndUpdate(
            order.subscriptionId,
            { $inc: { visits: -1 } }
        );
    }

    const updatedOrder = await orderModel.findById(id)
        .populate('userId', 'fullname email phone city place district')
        .populate('subscriptionId', 'planName visits');

    return successResponse({
        res,
        message: status === 'done' ? "تم إكمال الطلب بنجاح" : "تم تحديث حالة الطلب بنجاح",
        data: { order: updatedOrder }
    });
});
