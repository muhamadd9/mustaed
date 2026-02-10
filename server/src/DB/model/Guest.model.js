import mongoose from "mongoose";

const guestSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
        phone: { type: String, required: true, trim: true },
        invitation: { type: mongoose.Schema.Types.ObjectId, ref: "Invitation", required: true },
        rsvpStatus: {
            type: String,
            enum: ["pending", "accepted", "declined"],
            default: "pending"
        },
        qrCode: { type: String, unique: true, required: true },
        checkedIn: { type: Boolean, default: false },
        checkedInAt: { type: Date }
    },
    { timestamps: true }
);

// Index for querying guests by invitation and RSVP status
guestSchema.index({ invitation: 1, rsvpStatus: 1 });
guestSchema.index({ qrCode: 1 });

// Method to generate unique QR code
guestSchema.pre('save', async function (next) {
    if (!this.qrCode) {
        // Generate unique QR code: invitation_id + guest_id + random
        const randomStr = Math.random().toString(36).substring(2, 15);
        this.qrCode = `${this.invitation}_${randomStr}`;
    }
    next();
});

const guestModel = mongoose.models.Guest || mongoose.model("Guest", guestSchema);

export default guestModel;
