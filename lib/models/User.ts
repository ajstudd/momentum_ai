import mongoose from "mongoose";
import { Schema, model, Document } from "mongoose";

export interface UserProfile {
  name?: string;
  age?: number;
  gender?: string;
  bio?: string;
  goals?: string;
  preferences?: string;
  [key: string]: unknown;
}

export interface IUser extends Document {
  email: string;
  password: string;
  setupCompleted: boolean;
  // Profile info for Gemini AI
  profile?: UserProfile;
  xp?: number;
  level?: number;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    setupCompleted: { type: Boolean, default: false },
    // Profile info for Gemini AI
    profile: {
      name: String,
      age: Number,
      gender: String,
      bio: String,
      goals: String,
      preferences: String,
    },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// Index for fast email lookups
UserSchema.index({ email: 1 });

// Force recompilation of the model in dev/hot-reload environments
// This ensures we always use the latest schema definition
if (mongoose.models.User) {
  delete mongoose.models.User;
}

const User = model<IUser>("User", UserSchema);
export default User;
