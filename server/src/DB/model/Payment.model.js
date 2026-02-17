import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
        subscription: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },
        amount: { type: Number, required: true, min: 0 },
        status: {
            type: String,
            enum: ["pending", "completed", "failed", "refunded"],
            default: "pending"
        },
        paymentMethod: { type: String, trim: true, default: "paytabs" },
        transactionId: { type: String, trim: true },
        paytabsTranRef: { type: String, trim: true },
        paytabsResponse: { type: mongoose.Schema.Types.Mixed },
        notes: { type: String }
    },
    { timestamps: true }
);

paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ paytabsTranRef: 1 });

const paymentModel = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

export default paymentModel;
