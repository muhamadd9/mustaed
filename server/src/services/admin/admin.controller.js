import Router from "express";
import { authentication, authorization } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validation.middileware.js";
import { userIdSchema, toggleUserStatusSchema } from "./admin.validation.js";
import * as adminService from "./admin.service.js";

const adminRouter = Router();

// All routes require authentication and admin role
adminRouter.use(authentication(), authorization(['admin']));

// Get dashboard statistics
adminRouter.get("/stats", adminService.getDashboardStats);

// Get all users (hosts)
adminRouter.get("/users", adminService.getAllUsers);

// Toggle user status
adminRouter.patch("/users/:id/toggle-status", validate(toggleUserStatusSchema), adminService.toggleUserStatus);

// Get all invitations
adminRouter.get("/invitations", adminService.getAllInvitations);

export default adminRouter;
