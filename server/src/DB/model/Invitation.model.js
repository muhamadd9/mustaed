import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema(
    {
        eventName: { type: String, required: true, trim: true, minlength: 3, maxlength: 200 },
        eventDate: { type: Date, required: true },
        eventLocation: { type: String, required: true, trim: true },
        locationCoordinates: {
            lat: { type: Number },
            lng: { type: Number }
        },
        host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
        status: {
            type: String,
            enum: ["active", "completed", "cancelled"],
            default: "active"
        },
        totalGuests: { type: Number, default: 0 },
        attendedGuests: { type: Number, default: 0 }
    },
    { timestamps: true }
);

// Index for querying invitations by host
invitationSchema.index({ host: 1, status: 1 });

const invitationModel = mongoose.models.Invitation || mongoose.model("Invitation", invitationSchema);

export default invitationModel;
