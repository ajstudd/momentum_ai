import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { connectToDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Stats from "@/lib/models/stats";
import StatLog from "@/lib/models/StatLog";
import CompletedQuest from "@/lib/models/CompletedQuest";
import Passive from "@/lib/models/Passive";
import Title from "@/lib/models/Title";
import Badge from "@/lib/models/Badge";

// Body: { questTitle, questDescription, rewards: [{type, value}], statGains: [{stat, amount}] }
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
  const { questTitle, questDescription, rewards, statGains } = await req.json();
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

  // Update stats
  if (Array.isArray(statGains)) {
    for (const gain of statGains) {
      const statKey = gain.stat as
        | "strength"
        | "vitality"
        | "agility"
        | "intelligence"
        | "perception";
      if (stats[statKey] !== undefined) {
        const oldValue = stats[statKey];
        stats[statKey] += gain.amount;
        const newValue = stats[statKey];

        // Create stat log
        await StatLog.create({
          userId: payload.userId,
          stat: gain.stat,
          oldValue,
          newValue,
          changedAt: new Date(),
        });
      }
    }
    await stats.save();
  }

  // Process XP, passives, titles, badges from rewards
  if (Array.isArray(rewards)) {
    for (const reward of rewards) {
      if (reward.type === "XP") {
        user.xp = (user.xp || 0) + parseInt(reward.value, 10);

        // Progressive XP requirement system
        function getXPRequiredForLevel(level: number): number {
          if (level === 1) return 100;
          if (level === 2) return 300;
          if (level === 3) return 600;
          if (level === 4) return 1000;
          // For levels 5+, use formula: level * 300 + (level - 4) * 200
          return level * 300 + (level - 4) * 200;
        }

        // Check for level ups
        let currentLevel = user.level || 1;
        let currentXP = user.xp;

        while (currentXP >= getXPRequiredForLevel(currentLevel + 1)) {
          currentXP -= getXPRequiredForLevel(currentLevel + 1);
          currentLevel++;
        }

        user.level = currentLevel;
        user.xp = currentXP;
      } else if (reward.type === "Passive") {
        // Check if passive already exists
        const existingPassive = await Passive.findOne({
          userId: payload.userId,
          title: reward.value,
        });

        if (!existingPassive) {
          await Passive.create({
            userId: payload.userId,
            title: reward.value,
            description: reward.value,
            awardedAt: new Date(),
          });
        }
      } else if (reward.type === "Title") {
        // Check if title already exists
        const existingTitle = await Title.findOne({
          userId: payload.userId,
          title: reward.value,
        });

        if (!existingTitle) {
          await Title.create({
            userId: payload.userId,
            title: reward.value,
            description: reward.value,
            awardedAt: new Date(),
          });
        }
      } else if (reward.type === "Badge") {
        // Check if badge already exists
        const existingBadge = await Badge.findOne({
          userId: payload.userId,
          title: reward.value,
        });

        if (!existingBadge) {
          await Badge.create({
            userId: payload.userId,
            title: reward.value,
            description: reward.value,
            icon: "🏅",
            color: "#FFD700",
            awardedAt: new Date(),
          });
        }
      }
    }
  }

  // Add to completedQuests
  await CompletedQuest.create({
    userId: payload.userId,
    questTitle,
    questDescription: questDescription || "",
    completedAt: new Date(),
    rewards: Array.isArray(rewards) ? rewards : [],
  });

  await user.save();

  // Get updated data to return
  const updatedCompletedQuests = await CompletedQuest.find({
    userId: payload.userId,
  })
    .sort({ completedAt: -1 })
    .limit(100)
    .lean();

  const updatedPassives = await Passive.find({ userId: payload.userId })
    .sort({ awardedAt: -1 })
    .lean();

  const updatedTitles = await Title.find({ userId: payload.userId })
    .sort({ awardedAt: -1 })
    .lean();

  const updatedBadges = await Badge.find({ userId: payload.userId })
    .sort({ awardedAt: -1 })
    .lean();

  return NextResponse.json({
    success: true,
    stats: {
      strength: stats.strength,
      vitality: stats.vitality,
      agility: stats.agility,
      intelligence: stats.intelligence,
      perception: stats.perception,
    },
    xp: user.xp,
    level: user.level,
    completedQuests: updatedCompletedQuests,
    passives: updatedPassives,
    titles: updatedTitles,
    badges: updatedBadges,
  });
}
