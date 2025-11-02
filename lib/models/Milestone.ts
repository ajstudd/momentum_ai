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

// Indexes for efficient queries
MilestoneSchema.index({ userId: 1 }); // Get all user milestones
MilestoneSchema.index({ userId: 1, achieved: 1 }); // Filter by achievement status
MilestoneSchema.index({ userId: 1, badge: 1 }); // Check specific milestone

// Force recompilation in dev/hot-reload environments
if (mongoose.models.Milestone) {
  delete mongoose.models.Milestone;
}

const Milestone = model<IMilestone>("Milestone", MilestoneSchema);
export default Milestone;
