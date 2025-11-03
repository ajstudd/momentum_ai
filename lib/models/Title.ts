import mongoose, { Schema, model, Document } from "mongoose";

export interface ITitle extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  unlockCondition?: string;
  awardedAt: Date;
}

const TitleSchema = new Schema<ITitle>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    unlockCondition: { type: String },
    awardedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

TitleSchema.index({ userId: 1, awardedAt: -1 }); // Get user titles sorted by award date
TitleSchema.index({ userId: 1, title: 1 }); // Check if specific title exists

if (mongoose.models.Title) {
  delete mongoose.models.Title;
}

const Title = model<ITitle>("Title", TitleSchema);
export default Title;
