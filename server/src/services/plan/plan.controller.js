import { Router } from "express";
import * as planService from "./plan.service.js";
import { createPlanSchema, updatePlanSchema, planIdSchema } from "./plan.validation.js";
import { validate } from "../../middleware/validation.middileware.js";
import { authentication, authorization } from "../../middleware/auth.middleware.js";

const planRouter = Router();

// Public routes (Viewing plans)
planRouter.get("/", planService.getPlans);
planRouter.get("/:planId", validate(planIdSchema), planService.getPlan);

// Admin routes (Manage plans)
planRouter.post("/", authentication(), authorization(["admin"]), validate(createPlanSchema), planService.createPlan);
planRouter.put("/:planId", authentication(), authorization(["admin"]), validate(updatePlanSchema), planService.updatePlan);
planRouter.delete("/:planId", authentication(), authorization(["admin"]), validate(planIdSchema), planService.deletePlan);

export default planRouter;
