import Router from "express";
import { authentication, authorization } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validation.middileware.js";
import {
    guestIdSchema,
    invitationIdParamSchema,
    createGuestSchema,
    createBulkGuestsSchema,
    updateGuestSchema,
    checkInSchema
} from "./guest.validation.js";
import * as guestService from "./guest.service.js";

const guestRouter = Router();

// All routes require authentication
guestRouter.use(authentication(), authorization());

// Get all guests for an invitation
guestRouter.get("/invitation/:invitationId", validate(invitationIdParamSchema), guestService.getGuestsByInvitation);

// Create single guest
guestRouter.post("/", validate(createGuestSchema), guestService.createGuest);

// Create multiple guests (bulk)
guestRouter.post("/bulk", validate(createBulkGuestsSchema), guestService.createBulkGuests);

// Update guest
guestRouter.patch("/:id", validate(updateGuestSchema), guestService.updateGuest);

// Delete guest
guestRouter.delete("/:id", validate(guestIdSchema), guestService.deleteGuest);

// Check-in guest
guestRouter.post("/:id/check-in", validate(checkInSchema), guestService.checkInGuest);

export default guestRouter;
