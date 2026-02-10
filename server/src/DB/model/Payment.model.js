import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        invitation: { type: mongoose.Schema.Types.ObjectId, ref: "Invitation", required: true },
        plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
        amount: { type: Number, required: true, min: 0 },
        extraGuests: { type: Number, default: 0, min: 0 },
        status: {
            type: String,
            enum: ["pending", "completed", "failed", "refunded"],
            default: "pending"
        },
        paymentMethod: { type: String, trim: true },
        transactionId: { type: String, trim: true },
        notes: { type: String }
    },
    { timestamps: true }
);

// Index for querying payments by user and status
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ invitation: 1 });

const paymentModel = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

export default paymentModel;
