import mongoose, { Schema, model, Document } from "mongoose";

export interface IStatLog extends Document {
  userId: mongoose.Types.ObjectId;
  stat: string;
  oldValue: number;
  newValue: number;
  changedAt: Date;
}

const StatLogSchema = new Schema<IStatLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    stat: { type: String, required: true },
    oldValue: { type: Number, required: true },
    newValue: { type: Number, required: true },
    changedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes for efficient queries
StatLogSchema.index({ userId: 1, changedAt: -1 }); // Get user logs sorted by date
StatLogSchema.index({ userId: 1, stat: 1 }); // Get logs for specific stat

// Force recompilation in dev/hot-reload environments
if (mongoose.models.StatLog) {
  delete mongoose.models.StatLog;
}

const StatLog = model<IStatLog>("StatLog", StatLogSchema);
export default StatLog;
