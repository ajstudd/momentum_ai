import mongoose, { Schema, model, Document } from "mongoose";

export interface IFocusLog extends Document {
  userId: mongoose.Types.ObjectId;
  stat: string;
  questTitle: string;
  chosenAt: Date;
}

const FocusLogSchema = new Schema<IFocusLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    stat: { type: String, required: true },
    questTitle: { type: String, required: true },
    chosenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

FocusLogSchema.index({ userId: 1, chosenAt: -1 });
FocusLogSchema.index({ userId: 1, stat: 1 });

if (mongoose.models.FocusLog) {
  delete mongoose.models.FocusLog;
}

const FocusLog = model<IFocusLog>("FocusLog", FocusLogSchema);
export default FocusLog;
