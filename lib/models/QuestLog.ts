import mongoose, { Schema, model, Document } from "mongoose";

export interface IQuestLog extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  skippedSections: string[];
  progress: Record<string, number>;
}

const QuestLogSchema = new Schema<IQuestLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now },
    skippedSections: [{ type: String }],
    progress: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Indexes for efficient queries
QuestLogSchema.index({ userId: 1, date: -1 }); // Get user quest logs sorted by date

// Force recompilation in dev/hot-reload environments
if (mongoose.models.QuestLog) {
  delete mongoose.models.QuestLog;
}

const QuestLog = model<IQuestLog>("QuestLog", QuestLogSchema);
export default QuestLog;
