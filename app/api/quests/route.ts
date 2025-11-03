import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { connectToDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Stats from "@/lib/models/stats";
import FocusLog from "@/lib/models/FocusLog";
import CompletedQuest from "@/lib/models/CompletedQuest";
import QuestCache from "@/lib/models/QuestCache";
import { getGeminiQuests } from "@/lib/gemini";

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

  // Fetch user, stats, focusLogs, completedQuests, questCache, profile
  const user = await User.findById(payload.userId).select("profile");
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Get stats
  let stats = await Stats.findOne({ userId: payload.userId }).lean();
  if (!stats) {
    const newStats = await Stats.create({
      userId: payload.userId,
      strength: 1,
      vitality: 1,
      agility: 1,
      intelligence: 1,
      perception: 1,
    });
    stats = {
      userId: newStats.userId,
      strength: newStats.strength,
      vitality: newStats.vitality,
      agility: newStats.agility,
      intelligence: newStats.intelligence,
      perception: newStats.perception,
    } as any;
  }

  // Get focus logs
  const focusLogs = await FocusLog.find({ userId: payload.userId })
    .sort({ chosenAt: -1 })
    .limit(50)
    .lean();

  // Get completed quests
  const completedQuests = await CompletedQuest.find({ userId: payload.userId })
    .sort({ completedAt: -1 })
    .limit(100)
    .lean();

  // Check if quests are cached and updated within 24 hours
  const now = new Date();
  const questCache = await QuestCache.findOne({ userId: payload.userId });

  if (
    questCache &&
    questCache.quests &&
    questCache.updatedAt &&
    now.getTime() - new Date(questCache.updatedAt).getTime() <
      24 * 60 * 60 * 1000
  ) {
    return NextResponse.json(questCache.quests);
  }

  try {
    const parsed = await getGeminiQuests(
      {
        strength: stats.strength,
        vitality: stats.vitality,
        agility: stats.agility,
        intelligence: stats.intelligence,
        perception: stats.perception,
      },
      focusLogs.map((log) => ({
        stat: log.stat,
        questTitle: log.questTitle,
        chosenAt: log.chosenAt,
      })),
      completedQuests.map((quest) => ({
        questTitle: quest.questTitle,
        completedAt: quest.completedAt,
        rewards: quest.rewards,
      })),
      user.profile || {}
    );

    // Cache the quests in db
    await QuestCache.findOneAndUpdate(
      { userId: payload.userId },
      {
        userId: payload.userId,
        quests: parsed,
        updatedAt: new Date(),
      },
      { upsert: true }
    );

    return NextResponse.json(parsed);
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : "Gemini API error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
