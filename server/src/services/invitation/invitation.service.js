import { asyncHandler } from "../../utils/response/error.response.js";
import { successResponse } from "../../utils/response/success.response.js";
import invitationModel from "../../DB/model/Invitation.model.js";
import guestModel from "../../DB/model/Guest.model.js";
import { findById, getAll, findByIdAndUpdate, create } from "../../DB/dbService.js";

// Get all invitations (user sees only their own, admin sees all)
export const getAllInvitations = asyncHandler(async (req, res) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 20, 1);
    const skip = (page - 1) * limit;
    const sort = req.query.sort ? JSON.parse(req.query.sort) : { createdAt: -1 };

    // Filter based on role
    const filter = req.user.role === 'admin' ? {} : { host: req.user.id };

    const [count, invitations] = await getAll({
        model: invitationModel,
        filter,
        skip,
        limit,
        sort,
        populate: 'host plan'
    });

    return successResponse({ res, data: { count, page, limit, invitations } });
});

// Get invitation by ID
export const getInvitationById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const invitation = await findById({
        model: invitationModel,
        id,
        populate: 'host plan'
    });

    if (!invitation) return next(new Error("الدعوة غير موجودة", { cause: 404 }));

    // Check ownership (user can only view their own, admin can view all)
    if (req.user.role !== 'admin' && invitation.host._id.toString() !== req.user.id) {
        return next(new Error("غير مصرح لك بعرض هذه الدعوة", { cause: 403 }));
    }

    return successResponse({ res, data: invitation });
});

// Create new invitation
export const createInvitation = asyncHandler(async (req, res, next) => {
    const { eventName, eventDate, eventLocation, locationCoordinates, plan } = req.body;

    const invitation = await create({
        model: invitationModel,
        data: {
            eventName,
            eventDate,
            eventLocation,
            locationCoordinates,
            plan,
            host: req.user.id
        }
    });

    return successResponse({ res, data: invitation, message: "تم إنشاء الدعوة بنجاح" });
});

// Update invitation
export const updateInvitation = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { eventName, eventDate, eventLocation, locationCoordinates, status } = req.body;

    // Check ownership
    const invitation = await invitationModel.findById(id);
    if (!invitation) return next(new Error("الدعوة غير موجودة", { cause: 404 }));

    if (req.user.role !== 'admin' && invitation.host.toString() !== req.user.id) {
        return next(new Error("غير مصرح لك بتحديث هذه الدعوة", { cause: 403 }));
    }

    const data = {};
    if (eventName) data.eventName = eventName;
    if (eventDate) data.eventDate = eventDate;
    if (eventLocation) data.eventLocation = eventLocation;
    if (locationCoordinates) data.locationCoordinates = locationCoordinates;
    if (status) data.status = status;

    const updated = await findByIdAndUpdate({
        model: invitationModel,
        id,
        data,
        options: { new: true, populate: 'host plan' }
    });

    return successResponse({ res, data: updated, message: "تم تحديث الدعوة بنجاح" });
});

// Delete invitation
export const deleteInvitation = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // Check ownership
    const invitation = await invitationModel.findById(id);
    if (!invitation) return next(new Error("الدعوة غير موجودة", { cause: 404 }));

    if (req.user.role !== 'admin' && invitation.host.toString() !== req.user.id) {
        return next(new Error("غير مصرح لك بحذف هذه الدعوة", { cause: 403 }));
    }

    // Delete all associated guests
    await guestModel.deleteMany({ invitation: id });

    // Delete invitation
    await invitationModel.findByIdAndDelete(id);

    return successResponse({ res, message: "تم حذف الدعوة والضيوف المرتبطين بها بنجاح" });
});

// Get invitation statistics
export const getInvitationStats = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const invitation = await invitationModel.findById(id);
    if (!invitation) return next(new Error("الدعوة غير موجودة", { cause: 404 }));

    // Check ownership
    if (req.user.role !== 'admin' && invitation.host.toString() !== req.user.id) {
        return next(new Error("غير مصرح لك بعرض هذه الدعوة", { cause: 403 }));
    }

    // Count guests by RSVP status
    const guestStats = await guestModel.aggregate([
        { $match: { invitation: invitation._id } },
        {
            $group: {
                _id: "$rsvpStatus",
                count: { $sum: 1 }
            }
        }
    ]);

    const stats = {
        totalGuests: invitation.totalGuests,
        attendedGuests: invitation.attendedGuests,
        rsvpStats: {
            pending: 0,
            accepted: 0,
            declined: 0
        }
    };

    guestStats.forEach(stat => {
        stats.rsvpStats[stat._id] = stat.count;
    });

    return successResponse({ res, data: stats });
});
