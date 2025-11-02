import mongoose, { Schema, model, Document } from "mongoose";

export interface IBadge extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  icon: string;
  color: string;
  awardedAt: Date;
}

const BadgeSchema = new Schema<IBadge>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: "🏅" },
    color: { type: String, default: "#FFD700" },
    awardedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes for efficient queries
BadgeSchema.index({ userId: 1, awardedAt: -1 }); // Get user badges sorted by award date
BadgeSchema.index({ userId: 1, title: 1 }); // Check if specific badge exists

// Force recompilation in dev/hot-reload environments
if (mongoose.models.Badge) {
  delete mongoose.models.Badge;
}

const Badge = model<IBadge>("Badge", BadgeSchema);
export default Badge;
