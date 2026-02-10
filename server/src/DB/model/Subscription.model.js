import { Schema, model, Types } from "mongoose";

const subscriptionSchema = new Schema(
    {
        userId: { type: Types.ObjectId, ref: "User", required: true },
        planId: { type: Types.ObjectId, ref: "Plan", required: true },
        price: { type: Number, required: true },
        totalInvitations: { type: Number, required: true },
        usedInvitations: { type: Number, default: 0 },
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date },
        status: {
            type: String,
            enum: ['active', 'expired', 'cancelled'],
            default: 'active'
        }
    },
    { timestamps: true }
);

// Ensure user has only one active subscription if needed, but for history we allow multiple.
// specific query can just find the one with status 'active'.

const subscriptionModel = model("Subscription", subscriptionSchema);
export default subscriptionModel;
