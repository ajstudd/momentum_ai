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

PassiveSchema.index({ userId: 1, awardedAt: -1 });
PassiveSchema.index({ userId: 1, title: 1 });

if (mongoose.models.Passive) {
  delete mongoose.models.Passive;
}

const Passive = model<IPassive>("Passive", PassiveSchema);
export default Passive;
