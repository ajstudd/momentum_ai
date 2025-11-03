import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { connectToDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Stats from "@/lib/models/stats";
import StatLog from "@/lib/models/StatLog";

// GET: Get user stats and logs
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

  const user = await User.findById(payload.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Get stats from Stats collection
  let stats = await Stats.findOne({ userId: payload.userId });
  if (!stats) {
    // Create default stats if they don't exist
    stats = await Stats.create({
      userId: payload.userId,
      strength: 1,
      vitality: 1,
      agility: 1,
      intelligence: 1,
      perception: 1,
    });
  }

  // Get logs from StatLog collection (limit to recent 100)
  const logs = await StatLog.find({ userId: payload.userId })
    .sort({ changedAt: -1 })
    .limit(100)
    .lean();

  return NextResponse.json({
    stats: {
      strength: stats.strength,
      vitality: stats.vitality,
      agility: stats.agility,
      intelligence: stats.intelligence,
      perception: stats.perception,
    },
    logs: logs.map((log) => ({
      stat: log.stat,
      oldValue: log.oldValue,
      newValue: log.newValue,
      changedAt: log.changedAt,
    })),
  });
}

// PATCH: Update user stats
export async function PATCH(req: NextRequest) {
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
  const { stat, value } = await req.json();
  const allowedStats = [
    "strength",
    "vitality",
    "agility",
    "intelligence",
    "perception",
  ];
  if (!allowedStats.includes(stat) || typeof value !== "number") {
    return NextResponse.json(
      { error: "Invalid stat or value" },
      { status: 400 }
    );
  }

  const user = await User.findById(payload.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Get or create stats
  let stats = await Stats.findOne({ userId: payload.userId });
  if (!stats) {
    stats = await Stats.create({
      userId: payload.userId,
      strength: 1,
      vitality: 1,
      agility: 1,
      intelligence: 1,
      perception: 1,
    });
  }

  const oldValue = (stats as unknown as Record<string, number>)[stat];
  (stats as unknown as Record<string, number>)[stat] = value;
  await stats.save();

  // Create stat log
  await StatLog.create({
    userId: payload.userId,
    stat,
    oldValue,
    newValue: value,
    changedAt: new Date(),
  });

  // Get updated logs
  const logs = await StatLog.find({ userId: payload.userId })
    .sort({ changedAt: -1 })
    .limit(100)
    .lean();

  return NextResponse.json({
    stats: {
      strength: stats.strength,
      vitality: stats.vitality,
      agility: stats.agility,
      intelligence: stats.intelligence,
      perception: stats.perception,
    },
    logs: logs.map((log) => ({
      stat: log.stat,
      oldValue: log.oldValue,
      newValue: log.newValue,
      changedAt: log.changedAt,
    })),
  });
}
