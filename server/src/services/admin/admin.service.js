import { asyncHandler } from "../../utils/response/error.response.js";
import { successResponse } from "../../utils/response/success.response.js";
import userModel from "../../DB/model/User.model.js";
import invitationModel from "../../DB/model/Invitation.model.js";
import guestModel from "../../DB/model/Guest.model.js";
import subscriptionModel from "../../DB/model/Subscription.model.js";
import paymentModel from "../../DB/model/Payment.model.js";
import orderModel from "../../DB/model/Order.model.js";
import planModel from "../../DB/model/Plan.model.js";
import { getAll } from "../../DB/dbService.js";

// Get comprehensive dashboard statistics
export const getDashboardStats = asyncHandler(async (req, res) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
        // Users
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        // Subscriptions
        totalSubscriptions,
        activeSubscriptions,
        expiredSubscriptions,
        cancelledSubscriptions,
        // Payments
        totalPayments,
        completedPayments,
        pendingPayments,
        failedPayments,
        refundedPayments,
        revenueResult,
        revenueThisMonthResult,
        // Orders
        totalOrders,
        pendingOrders,
        inProgressOrders,
        doneOrders,
        // Plans
        totalPlans,
        // Monthly revenue (last 6 months)
        monthlyRevenue,
        // Monthly new users (last 6 months)
        monthlyUsers,
        // Revenue by plan
        revenueByPlan,
        // Recent payments
        recentPayments,
        // Recent subscriptions
        recentSubscriptions,
    ] = await Promise.all([
        // Users
        userModel.countDocuments({ role: "user" }),
        userModel.countDocuments({ role: "user", isActive: true }),
        userModel.countDocuments({ role: "user", createdAt: { $gte: thirtyDaysAgo } }),
        // Subscriptions
        subscriptionModel.countDocuments(),
        subscriptionModel.countDocuments({ status: "active" }),
        subscriptionModel.countDocuments({ status: "expired" }),
        subscriptionModel.countDocuments({ status: "cancelled" }),
        // Payments
        paymentModel.countDocuments(),
        paymentModel.countDocuments({ status: "completed" }),
        paymentModel.countDocuments({ status: "pending" }),
        paymentModel.countDocuments({ status: "failed" }),
        paymentModel.countDocuments({ status: "refunded" }),
        paymentModel.aggregate([
            { $match: { status: "completed" } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        paymentModel.aggregate([
            { $match: { status: "completed", createdAt: { $gte: thirtyDaysAgo } } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        // Orders
        orderModel.countDocuments(),
        orderModel.countDocuments({ status: "pending" }),
        orderModel.countDocuments({ status: "in_progress" }),
        orderModel.countDocuments({ status: "done" }),
        // Plans
        planModel.countDocuments(),
        // Monthly revenue (last 6 months)
        paymentModel.aggregate([
            { $match: { status: "completed", createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                    count: { $sum: 1 },
                    revenue: { $sum: "$amount" },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]),
        // Monthly new users (last 6 months)
        userModel.aggregate([
            { $match: { role: "user", createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]),
        // Revenue by plan
        paymentModel.aggregate([
            { $match: { status: "completed" } },
            {
                $lookup: {
                    from: "plans",
                    localField: "plan",
                    foreignField: "_id",
                    as: "planInfo",
                },
            },
            { $unwind: { path: "$planInfo", preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: "$planInfo.name",
                    count: { $sum: 1 },
                    revenue: { $sum: "$amount" },
                },
            },
            { $sort: { revenue: -1 } },
        ]),
        // Recent payments (last 5)
        paymentModel.find()
            .populate("user", "fullname email")
            .populate("plan", "name")
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),
        // Recent subscriptions (last 5)
        subscriptionModel.find()
            .populate("userId", "fullname email")
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;
    const revenueThisMonth = revenueThisMonthResult[0]?.total || 0;

    return successResponse({
        res,
        data: {
            users: {
                total: totalUsers,
                active: activeUsers,
                newThisMonth: newUsersThisMonth,
            },
            subscriptions: {
                total: totalSubscriptions,
                active: activeSubscriptions,
                expired: expiredSubscriptions,
                cancelled: cancelledSubscriptions,
            },
            payments: {
                total: totalPayments,
                completed: completedPayments,
                pending: pendingPayments,
                failed: failedPayments,
                refunded: refundedPayments,
                totalRevenue,
                revenueThisMonth,
            },
            orders: {
                total: totalOrders,
                pending: pendingOrders,
                inProgress: inProgressOrders,
                done: doneOrders,
            },
            plans: {
                total: totalPlans,
            },
            charts: {
                monthlyRevenue,
                monthlyUsers,
                revenueByPlan,
            },
            recent: {
                payments: recentPayments,
                subscriptions: recentSubscriptions,
            },
        },
    });
});

// Get all users (hosts)
export const getAllUsers = asyncHandler(async (req, res) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 20, 1);
    const skip = (page - 1) * limit;
    const sort = req.query.sort ? JSON.parse(req.query.sort) : { createdAt: -1 };
    const { search } = req.query;

    // Filter for regular users only (not admins)
    const filter = { role: 'user' };

    if (search) {
        filter.$or = [
            { fullname: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } }
        ];
    }

    const [count, users] = await getAll({
        model: userModel,
        filter,
        skip,
        limit,
        sort,
        select: '-password'
    });

    return successResponse({ res, data: { count, page, limit, users } });
});

// Toggle user status (activate/deactivate)
export const toggleUserStatus = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await userModel.findById(id);
    if (!user) return next(new Error("المستخدم غير موجود", { cause: 404 }));

    // Prevent deactivating admins
    if (user.role === 'admin') {
        return next(new Error("لا يمكن تعديل حالة المستخدم المسؤول", { cause: 403 }));
    }

    user.isActive = isActive;
    await user.save();

    return successResponse({
        res,
        data: { id: user._id, isActive: user.isActive },
        message: `تم ${isActive ? 'تفعيل' : 'إلغاء تفعيل'} المستخدم بنجاح`
    });
});

// Get all invitations (admin view)
export const getAllInvitations = asyncHandler(async (req, res) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 20, 1);
    const skip = (page - 1) * limit;
    const sort = { createdAt: -1 };

    const [count, invitations] = await getAll({
        model: invitationModel,
        filter: {},
        skip,
        limit,
        sort,
        populate: 'host'
    });

    return successResponse({ res, data: { count, page, limit, invitations } });
});
