import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, unique: true },
        subtitle: { type: String, trim: true }, // e.g. "أفضل قيمة - مناسبة للمنازل الكبيرة"
        description: { type: String, trim: true },
        price: { type: Number, required: true, min: 0 },
        discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
        priceAfterDiscount: { type: Number, required: true },
        features: [{ type: String }], // List of features
        billingPeriod: {
            type: String,
            enum: ['yearly', 'monthly'],
            default: 'yearly'
        },
        tag: { type: String, trim: true }, // e.g. "الأكثر طلباً"
        visits: { type: Number, default: 0 }, // e.g. 6 visits
        isFeatured: { type: Boolean, default: false }
    },
    { timestamps: true }
);

const planModel = mongoose.models.Plan || mongoose.model("Plan", planSchema);

export default planModel;
