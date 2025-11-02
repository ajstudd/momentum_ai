import mongoose, { Schema, model, Document } from "mongoose";

export interface IPassive extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  unlockCondition?: string;
  awardedAt: Date;
}

const PassiveSchema = new Schema<IPassive>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    unlockCondition: { type: String },
    awardedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes for efficient queries
PassiveSchema.index({ userId: 1, awardedAt: -1 }); // Get user passives sorted by award date
PassiveSchema.index({ userId: 1, title: 1 }); // Check if specific passive exists

// Force recompilation in dev/hot-reload environments
if (mongoose.models.Passive) {
  delete mongoose.models.Passive;
}

const Passive = model<IPassive>("Passive", PassiveSchema);
export default Passive;
