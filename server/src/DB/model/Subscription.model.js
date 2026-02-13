import { Schema, model, Types } from "mongoose";

const subscriptionSchema = new Schema(
    {
        userId: { type: Types.ObjectId, ref: "User", required: true },
        planId: { type: Types.ObjectId, ref: "Plan", required: true },
        planName: { type: String, required: true },
        price: { type: Number, required: true },
        billingPeriod: { type: String, enum: ['yearly', 'monthly'], default: 'yearly' },
        visits: { type: Number, default: 0 },
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

subscriptionSchema.index({ userId: 1, status: 1 });

const subscriptionModel = model("Subscription", subscriptionSchema);
export default subscriptionModel;
