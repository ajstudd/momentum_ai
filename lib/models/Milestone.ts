import mongoose, { Schema, model, Document } from "mongoose";

export interface IMilestone extends Document {
  userId: mongoose.Types.ObjectId;
  badge: string;
  achieved: boolean;
  achievedAt?: Date;
  criteria: string;
}

const MilestoneSchema = new Schema<IMilestone>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    badge: { type: String, required: true },
    achieved: { type: Boolean, default: false },
    achievedAt: { type: Date },
    criteria: { type: String, required: true },
  },
  { timestamps: true }
);

MilestoneSchema.index({ userId: 1 });
MilestoneSchema.index({ userId: 1, achieved: 1 });
MilestoneSchema.index({ userId: 1, badge: 1 });

if (mongoose.models.Milestone) {
  delete mongoose.models.Milestone;
}

const Milestone = model<IMilestone>("Milestone", MilestoneSchema);
export default Milestone;
