import mongoose, { Schema, model, Document } from "mongoose";

export interface IQuestCache extends Document {
  userId: mongoose.Types.ObjectId;
  quests: unknown;
  updatedAt: Date;
}

const QuestCacheSchema = new Schema<IQuestCache>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    quests: { type: Schema.Types.Mixed, required: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

QuestCacheSchema.index({ userId: 1 });
QuestCacheSchema.index({ userId: 1, updatedAt: -1 });

if (mongoose.models.QuestCache) {
  delete mongoose.models.QuestCache;
}

const QuestCache = model<IQuestCache>("QuestCache", QuestCacheSchema);
export default QuestCache;
