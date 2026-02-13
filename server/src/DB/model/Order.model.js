import { Schema, model, Types } from "mongoose";

const orderSchema = new Schema(
    {
        userId: { type: Types.ObjectId, ref: "User", required: true },
        subscriptionId: { type: Types.ObjectId, ref: "Subscription", required: true },
        city: { type: String, required: true, trim: true },
        place: { type: String, required: true, trim: true },
        district: { type: String, required: true, trim: true },
        notes: { type: String, trim: true, maxlength: 500 },
        status: {
            type: String,
            enum: ['pending', 'in_progress', 'done'],
            default: 'pending'
        }
    },
    { timestamps: true }
);

orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });

const orderModel = model("Order", orderSchema);
export default orderModel;
