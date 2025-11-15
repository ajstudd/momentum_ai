import mongoose, { Schema, model, Document } from "mongoose";

export interface IStats extends Document {
  userId: mongoose.Types.ObjectId;
  strength: number;
  vitality: number;
  agility: number;
  intelligence: number;
  perception: number;
  createdAt: Date;
  updatedAt: Date;
}

const StatsSchema = new Schema<IStats>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    strength: { type: Number, default: 1 },
    vitality: { type: Number, default: 1 },
    agility: { type: Number, default: 1 },
    intelligence: { type: Number, default: 1 },
    perception: { type: Number, default: 1 },
  },
  { timestamps: true }
);

StatsSchema.index({ userId: 1 });

// Force recompilation in dev/hot-reload environments
if (mongoose.models.Stats) {
  delete mongoose.models.Stats;
}

const Stats = model<IStats>("Stats", StatsSchema);
export default Stats;
