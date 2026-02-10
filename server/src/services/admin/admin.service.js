import { asyncHandler } from "../../utils/response/error.response.js";
import { successResponse } from "../../utils/response/success.response.js";
import userModel from "../../DB/model/User.model.js";
import invitationModel from "../../DB/model/Invitation.model.js";
import guestModel from "../../DB/model/Guest.model.js";
import { getAll } from "../../DB/dbService.js";

// Get dashboard statistics
export const getDashboardStats = asyncHandler(async (req, res) => {
    // Count hosts (users with role 'user')
    const hostsCount = await userModel.countDocuments({ role: 'user' });

    // Count total invitations
    const invitationsCount = await invitationModel.countDocuments();

    // Count total guests
    const guestsCount = await guestModel.countDocuments();

    // Count active invitations
    const activeInvitations = await invitationModel.countDocuments({ status: 'active' });

    const stats = {
        hostsCount,
        invitationsCount,
        guestsCount,
        activeInvitations,
        // Placeholder for support tickets
        supportTicketsCount: 0
    };

    return successResponse({ res, data: stats });
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
