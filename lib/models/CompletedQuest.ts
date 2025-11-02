import mongoose, { Schema, model, Document } from "mongoose";

export interface ICompletedQuest extends Document {
  userId: mongoose.Types.ObjectId;
  questTitle: string;
  questDescription: string;
  completedAt: Date;
  rewards: Array<{
    type: string;
    value: string;
  }>;
}

const CompletedQuestSchema = new Schema<ICompletedQuest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    questTitle: { type: String, required: true },
    questDescription: { type: String, default: "" },
    completedAt: { type: Date, default: Date.now },
    rewards: [
      {
        type: { type: String },
        value: { type: String },
      },
    ],
  },
  { timestamps: true }
);

// Indexes for efficient queries
CompletedQuestSchema.index({ userId: 1, completedAt: -1 }); // Get user quests sorted by completion date
CompletedQuestSchema.index({ userId: 1, questTitle: 1 }); // Check if specific quest completed

// Force recompilation in dev/hot-reload environments
if (mongoose.models.CompletedQuest) {
  delete mongoose.models.CompletedQuest;
}

const CompletedQuest = model<ICompletedQuest>(
  "CompletedQuest",
  CompletedQuestSchema
);
export default CompletedQuest;
