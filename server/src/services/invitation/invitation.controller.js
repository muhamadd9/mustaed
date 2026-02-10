import Router from "express";
import { authentication, authorization } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validation.middileware.js";
import {
    invitationIdSchema,
    createInvitationSchema,
    updateInvitationSchema
} from "./invitation.validation.js";
import * as invitationService from "./invitation.service.js";

const invitationRouter = Router();

// All routes require authentication
invitationRouter.use(authentication(), authorization());

// Get all invitations (filtered by role)
invitationRouter.get("/", invitationService.getAllInvitations);

// Get invitation by ID
invitationRouter.get("/:id", validate(invitationIdSchema), invitationService.getInvitationById);

// Get invitation statistics
invitationRouter.get("/:id/stats", validate(invitationIdSchema), invitationService.getInvitationStats);

// Create new invitation
invitationRouter.post("/", validate(createInvitationSchema), invitationService.createInvitation);

// Update invitation
invitationRouter.patch("/:id", validate(updateInvitationSchema), invitationService.updateInvitation);

// Delete invitation
invitationRouter.delete("/:id", validate(invitationIdSchema), invitationService.deleteInvitation);

export default invitationRouter;
