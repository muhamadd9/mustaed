import connectDB from "./DB/connection.js";
import authRouter from "./services/auth/auth.controller.js";
import userRouter from "./services/user/user.controller.js";
// ارحبو services
import invitationRouter from "./services/invitation/invitation.controller.js";
import guestRouter from "./services/guest/guest.controller.js";
import planRouter from "./services/plan/plan.controller.js";
import paymentRouter from "./services/payment/payment.controller.js";
import subscriptionRouter from "./services/subscription/subscription.router.js";
import orderRouter from "./services/order/order.router.js";
import adminRouter from "./services/admin/admin.controller.js";
import { globalErrorHandler } from "./utils/response/error.response.js";
import cors from "cors";
import { fileURLToPath } from "url";

import path from "path";

const bootstrap = (app, express) => {
  connectDB();

  app.use(express.json());
  app.use(cors());
  app.use("/uploads", express.static(path.resolve("./uploads")));

  app.use("/auth", authRouter);
  app.use("/user", userRouter);

  // ارحبو routes
  app.use("/invitation", invitationRouter);
  app.use("/guest", guestRouter);
  app.use("/plan", planRouter);
  app.use("/payment", paymentRouter);
  app.use("/subscription", subscriptionRouter);
  app.use("/order", orderRouter);
  app.use("/admin", adminRouter);

  app.use(globalErrorHandler);

  app.use("*", (req, res) => {
    res.status(404).json({ message: "Page Not Found" });
  });
};

export default bootstrap;
