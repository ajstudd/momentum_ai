import mongoose, { Schema, model, Document } from "mongoose";

export interface IBadge extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlockCondition?: string;
  awardedAt: Date;
}

const BadgeSchema = new Schema<IBadge>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: "B" },
    color: { type: String, default: "#FFD700" },
    unlockCondition: { type: String },
    awardedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

BadgeSchema.index({ userId: 1, awardedAt: -1 });
BadgeSchema.index({ userId: 1, title: 1 });

if (mongoose.models.Badge) {
  delete mongoose.models.Badge;
}

const Badge = model<IBadge>("Badge", BadgeSchema);
export default Badge;
