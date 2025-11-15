import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { connectToDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Badge from "@/lib/models/Badge";
import Passive from "@/lib/models/Passive";
import Title from "@/lib/models/Title";
import QuestCache from "@/lib/models/QuestCache";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = auth.replace("Bearer ", "");
  const payload = verifyJwt(token);
  if (!payload || typeof payload !== "object" || !("userId" in payload)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  await connectToDB();

  const user = await User.findById(payload.userId).select(
    "profile xp level setupCompleted"
  );
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Get badges from Badge collection
  const badges = await Badge.find({ userId: payload.userId })
    .sort({ awardedAt: -1 })
    .lean();

  // Get passives from Passive collection
  const passives = await Passive.find({ userId: payload.userId })
    .sort({ awardedAt: -1 })
    .lean();

  // Get titles from Title collection
  const titles = await Title.find({ userId: payload.userId })
    .sort({ awardedAt: -1 })
    .lean();

  // Calculate XP required for next level
  function getXPRequiredForLevel(level: number): number {
    if (level === 1) return 100;
    if (level === 2) return 300;
    if (level === 3) return 600;
    if (level === 4) return 1000;
    return level * 300 + (level - 4) * 200;
  }

  const currentLevel = user.level || 1;
  const nextLevelXPRequired = getXPRequiredForLevel(currentLevel + 1);

  return NextResponse.json({
    profile: user.profile || {},
    badges: badges || [],
    xp: user.xp || 0,
    level: user.level || 1,
    nextLevelXPRequired,
    passives: passives || [],
    titles: titles || [],
    setupCompleted: user.setupCompleted || false,
  });
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = auth.replace("Bearer ", "");
  const payload = verifyJwt(token);
  if (!payload || typeof payload !== "object" || !("userId" in payload)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  await connectToDB();
  const body = await req.json();

  const user = await User.findById(payload.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  user.profile = { ...user.profile, ...body };

  // Clear questCache to force quest regeneration on next fetch
  await QuestCache.deleteOne({ userId: payload.userId });

  await user.save();

  return NextResponse.json({ success: true });
}
