import { asyncHandler } from "../../utils/response/error.response.js";
import { successResponse } from "../../utils/response/success.response.js";
import guestModel from "../../DB/model/Guest.model.js";
import invitationModel from "../../DB/model/Invitation.model.js";
import { findById, create } from "../../DB/dbService.js";

// Get all guests for an invitation
export const getGuestsByInvitation = asyncHandler(async (req, res, next) => {
    const { invitationId } = req.params;

    // Check if invitation exists and user has access
    const invitation = await invitationModel.findById(invitationId);
    if (!invitation) return next(new Error("الدعوة غير موجودة", { cause: 404 }));

    if (req.user.role !== 'admin' && invitation.host.toString() !== req.user.id) {
        return next(new Error("غير مصرح لك بعرض الضيوف لهذه الدعوة", { cause: 403 }));
    }

    const guests = await guestModel.find({ invitation: invitationId }).sort({ createdAt: -1 });

    return successResponse({ res, data: { count: guests.length, guests } });
});

// Create single guest
export const createGuest = asyncHandler(async (req, res, next) => {
    const { name, phone, invitation } = req.body;

    // Check if invitation exists and user owns it
    const invitationDoc = await invitationModel.findById(invitation);
    if (!invitationDoc) return next(new Error("الدعوة غير موجودة", { cause: 404 }));

    if (req.user.role !== 'admin' && invitationDoc.host.toString() !== req.user.id) {
        return next(new Error("غير مصرح لك بإضافة ضيوف لهذه الدعوة", { cause: 403 }));
    }

    const guest = await create({
        model: guestModel,
        data: { name, phone, invitation }
    });

    // Update total guest count
    await invitationModel.findByIdAndUpdate(invitation, {
        $inc: { totalGuests: 1 }
    });

    return successResponse({ res, data: guest, message: "تم إضافة الضيف بنجاح" });
});

// Create multiple guests (bulk from Excel)
export const createBulkGuests = asyncHandler(async (req, res, next) => {
    const { invitation, guests } = req.body;

    // Check if invitation exists and user owns it
    const invitationDoc = await invitationModel.findById(invitation);
    if (!invitationDoc) return next(new Error("الدعوة غير موجودة", { cause: 404 }));

    if (req.user.role !== 'admin' && invitationDoc.host.toString() !== req.user.id) {
        return next(new Error("غير مصرح لك بإضافة ضيوف لهذه الدعوة", { cause: 403 }));
    }

    // Prepare guests for insertion
    const guestsToInsert = guests.map(guest => ({
        name: guest.name,
        phone: guest.phone,
        invitation
    }));

    const createdGuests = await guestModel.insertMany(guestsToInsert);

    // Update total guest count
    await invitationModel.findByIdAndUpdate(invitation, {
        $inc: { totalGuests: createdGuests.length }
    });

    return successResponse({
        res,
        data: { count: createdGuests.length, guests: createdGuests },
        message: `تم إضافة ${createdGuests.length} ضيف بنجاح`
    });
});

// Update guest
export const updateGuest = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name, phone, rsvpStatus } = req.body;

    const guest = await guestModel.findById(id).populate('invitation');
    if (!guest) return next(new Error("الضيف غير موجود", { cause: 404 }));

    // Check ownership
    if (req.user.role !== 'admin' && guest.invitation.host.toString() !== req.user.id) {
        return next(new Error("غير مصرح لك بتحديث بيانات هذا الضيف", { cause: 403 }));
    }

    if (name) guest.name = name;
    if (phone) guest.phone = phone;
    if (rsvpStatus) guest.rsvpStatus = rsvpStatus;

    await guest.save();

    return successResponse({ res, data: guest, message: "تم تحديث بيانات الضيف بنجاح" });
});

// Delete guest
export const deleteGuest = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const guest = await guestModel.findById(id).populate('invitation');
    if (!guest) return next(new Error("الضيف غير موجود", { cause: 404 }));

    // Check ownership
    if (req.user.role !== 'admin' && guest.invitation.host.toString() !== req.user.id) {
        return next(new Error("غير مصرح لك بحذف هذا الضيف", { cause: 403 }));
    }

    await guestModel.findByIdAndDelete(id);

    // Update total guest count
    await invitationModel.findByIdAndUpdate(guest.invitation._id, {
        $inc: { totalGuests: -1 }
    });

    return successResponse({ res, message: "تم حذف الضيف بنجاح" });
});

// Check-in guest via QR code
export const checkInGuest = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const guest = await guestModel.findById(id).populate('invitation');
    if (!guest) return next(new Error("الضيف غير موجود", { cause: 404 }));

    // Check ownership
    if (req.user.role !== 'admin' && guest.invitation.host.toString() !== req.user.id) {
        return next(new Error("غير مصرح لك بتسجيل دخول هذا الضيف", { cause: 403 }));
    }

    if (guest.checkedIn) {
        return next(new Error("الضيف قام بتسجيل الدخول بالفعل", { cause: 400 }));
    }

    guest.checkedIn = true;
    guest.checkedInAt = new Date();
    await guest.save();

    // Update attended count
    await invitationModel.findByIdAndUpdate(guest.invitation._id, {
        $inc: { attendedGuests: 1 }
    });

    return successResponse({ res, data: guest, message: "تم تسجيل دخول الضيف بنجاح" });
});
