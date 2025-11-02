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

// Indexes for efficient queries
FocusLogSchema.index({ userId: 1, chosenAt: -1 }); // Get user focus logs sorted by date
FocusLogSchema.index({ userId: 1, stat: 1 }); // Get focus logs for specific stat

// Force recompilation in dev/hot-reload environments
if (mongoose.models.FocusLog) {
  delete mongoose.models.FocusLog;
}

const FocusLog = model<IFocusLog>("FocusLog", FocusLogSchema);
export default FocusLog;
