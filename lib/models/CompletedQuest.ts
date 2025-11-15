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

CompletedQuestSchema.index({ userId: 1, completedAt: -1 });
CompletedQuestSchema.index({ userId: 1, questTitle: 1 });

if (mongoose.models.CompletedQuest) {
  delete mongoose.models.CompletedQuest;
}

const CompletedQuest = model<ICompletedQuest>(
  "CompletedQuest",
  CompletedQuestSchema
);
export default CompletedQuest;
