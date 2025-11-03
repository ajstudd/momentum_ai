// Achievement checker service - evaluates unlock conditions and returns newly unlocked achievements

import {
  AchievementDefinition,
  getAutoUnlockableDefinitions,
} from "./achievement-definitions";
import Passive from "./models/Passive";
import Title from "./models/Title";
import Badge from "./models/Badge";
import CompletedQuest from "./models/CompletedQuest";
import Stats from "./models/stats";
import User from "./models/User";
import mongoose from "mongoose";

export interface UserAchievementState {
  userId: string | mongoose.Types.ObjectId;
  stats: {
    strength: number;
    vitality: number;
    agility: number;
    intelligence: number;
    perception: number;
  };
  level: number;
  completedQuestCount: number;
  completedQuestsByType?: Record<string, number>; // e.g., { strength: 3, intelligence: 5 }
}

export interface UnlockedAchievement {
  definition: AchievementDefinition;
  type: "passive" | "title" | "badge";
}

/**
 * Checks if a specific achievement condition is met
 */
function isConditionMet(
  definition: AchievementDefinition,
  state: UserAchievementState
): boolean {
  const { conditionType, conditionParams } = definition;

  switch (conditionType) {
    case "stat":
      if (!conditionParams?.stat || conditionParams.value === undefined) {
        return false;
      }
      const statKey = conditionParams.stat as keyof typeof state.stats;
      const currentStatValue = state.stats[statKey];
      return currentStatValue >= conditionParams.value;

    case "level":
      if (conditionParams?.value === undefined) return false;
      return state.level >= conditionParams.value;

    case "quest-count":
      if (conditionParams?.count === undefined) return false;

      // If specific quest type is specified (e.g., "strength quests")
      if (conditionParams.questType) {
        const questType = conditionParams.questType.toLowerCase();
        const count = state.completedQuestsByType?.[questType] || 0;
        return count >= conditionParams.count;
      }

      // Otherwise, total quest count
      return state.completedQuestCount >= conditionParams.count;

    case "specific-quest":
      // This would require checking if a specific quest title was completed
      // For now, return false (would need to query CompletedQuest)
      return false;

    case "manual":
      // Manual achievements are never auto-unlocked
      return false;

    default:
      return false;
  }
}

/**
 * Get current user achievement state
 */
export async function getUserAchievementState(
  userId: string | mongoose.Types.ObjectId
): Promise<UserAchievementState> {
  // Get user stats
  const stats = await Stats.findOne({ userId });
  const user = await User.findById(userId);

  // Get completed quest count
  const completedQuests = await CompletedQuest.find({ userId });
  const completedQuestCount = completedQuests.length;

  // Count quests by type (based on quest title or rewards containing stat gains)
  const completedQuestsByType: Record<string, number> = {
    strength: 0,
    vitality: 0,
    agility: 0,
    intelligence: 0,
    perception: 0,
  };

  // Analyze each completed quest to categorize by type
  completedQuests.forEach((quest) => {
    const title = quest.questTitle?.toLowerCase() || "";
    const rewards = quest.rewards || [];

    // Check if quest rewards mention a specific stat
    const statGains = rewards.filter(
      (r: { type: string }) => r.type === "Stat"
    );

    statGains.forEach((gain: { value: string }) => {
      const statMatch = gain.value.match(
        /(strength|vitality|agility|intelligence|perception)/i
      );
      if (statMatch) {
        const stat = statMatch[1].toLowerCase();
        completedQuestsByType[stat] = (completedQuestsByType[stat] || 0) + 1;
      }
    });

    // If no stat gains found, try to infer from title
    if (statGains.length === 0) {
      if (
        title.includes("strength") ||
        title.includes("workout") ||
        title.includes("physical")
      ) {
        completedQuestsByType.strength++;
      } else if (
        title.includes("intelligence") ||
        title.includes("study") ||
        title.includes("learn")
      ) {
        completedQuestsByType.intelligence++;
      } else if (
        title.includes("agility") ||
        title.includes("speed") ||
        title.includes("reflex")
      ) {
        completedQuestsByType.agility++;
      } else if (
        title.includes("vitality") ||
        title.includes("stamina") ||
        title.includes("endurance")
      ) {
        completedQuestsByType.vitality++;
      } else if (
        title.includes("perception") ||
        title.includes("aware") ||
        title.includes("observe")
      ) {
        completedQuestsByType.perception++;
      }
    }
  });

  return {
    userId,
    stats: {
      strength: stats?.strength || 1,
      vitality: stats?.vitality || 1,
      agility: stats?.agility || 1,
      intelligence: stats?.intelligence || 1,
      perception: stats?.perception || 1,
    },
    level: user?.level || 1,
    completedQuestCount,
    completedQuestsByType,
  };
}

/**
 * Check which achievements should be unlocked but aren't yet
 * Returns newly unlocked achievements
 */
export async function checkAndUnlockAchievements(
  userId: string | mongoose.Types.ObjectId
): Promise<UnlockedAchievement[]> {
  // Get all auto-unlockable achievement definitions
  const definitions = getAutoUnlockableDefinitions();

  // Get current user state
  const state = await getUserAchievementState(userId);

  // Get already unlocked achievements
  const [existingPassives, existingTitles, existingBadges] = await Promise.all([
    Passive.find({ userId }).select("title").lean(),
    Title.find({ userId }).select("title").lean(),
    Badge.find({ userId }).select("title").lean(),
  ]);

  const existingPassiveTitles = new Set(existingPassives.map((p) => p.title));
  const existingTitleTitles = new Set(existingTitles.map((t) => t.title));
  const existingBadgeTitles = new Set(existingBadges.map((b) => b.title));

  // Check each definition
  const newlyUnlocked: UnlockedAchievement[] = [];

  for (const definition of definitions) {
    // Skip if already unlocked
    if (
      definition.type === "passive" &&
      existingPassiveTitles.has(definition.title)
    ) {
      continue;
    }
    if (
      definition.type === "title" &&
      existingTitleTitles.has(definition.title)
    ) {
      continue;
    }
    if (
      definition.type === "badge" &&
      existingBadgeTitles.has(definition.title)
    ) {
      continue;
    }

    // Check if condition is met
    if (isConditionMet(definition, state)) {
      newlyUnlocked.push({
        definition,
        type: definition.type,
      });

      // Create the achievement in the database
      await createAchievement(userId, definition);
    }
  }

  return newlyUnlocked;
}

/**
 * Create an achievement in the database
 */
async function createAchievement(
  userId: string | mongoose.Types.ObjectId,
  definition: AchievementDefinition
): Promise<void> {
  const now = new Date();

  try {
    if (definition.type === "passive") {
      await Passive.create({
        userId,
        title: definition.title,
        description: definition.description,
        unlockCondition: definition.unlockCondition,
        awardedAt: now,
      });
    } else if (definition.type === "title") {
      await Title.create({
        userId,
        title: definition.title,
        description: definition.description,
        unlockCondition: definition.unlockCondition,
        awardedAt: now,
      });
    } else if (definition.type === "badge") {
      await Badge.create({
        userId,
        title: definition.title,
        description: definition.description,
        unlockCondition: definition.unlockCondition,
        icon: definition.icon || "B",
        color: definition.color || "#FFD700",
        awardedAt: now,
      });
    }
  } catch (error) {
    // Ignore duplicate errors
    if ((error as { code?: number }).code !== 11000) {
      console.error(`Failed to create achievement ${definition.title}:`, error);
    }
  }
}

/**
 * Get progress toward locked achievements
 */
export async function getAchievementProgress(
  userId: string | mongoose.Types.ObjectId
): Promise<
  Array<{
    definition: AchievementDefinition;
    current: number;
    required: number;
    percentage: number;
    unlocked: boolean;
  }>
> {
  const definitions = getAutoUnlockableDefinitions();
  const state = await getUserAchievementState(userId);

  // Get already unlocked
  const [existingPassives, existingTitles, existingBadges] = await Promise.all([
    Passive.find({ userId }).select("title").lean(),
    Title.find({ userId }).select("title").lean(),
    Badge.find({ userId }).select("title").lean(),
  ]);

  const unlocked = new Set([
    ...existingPassives.map((p) => p.title),
    ...existingTitles.map((t) => t.title),
    ...existingBadges.map((b) => b.title),
  ]);

  const progress = definitions.map((definition) => {
    const isUnlocked = unlocked.has(definition.title);
    let current = 0;
    let required = 1;

    const { conditionType, conditionParams } = definition;

    switch (conditionType) {
      case "stat":
        if (conditionParams?.stat && conditionParams.value !== undefined) {
          const statKey = conditionParams.stat as keyof typeof state.stats;
          current = state.stats[statKey];
          required = conditionParams.value;
        }
        break;

      case "level":
        if (conditionParams?.value !== undefined) {
          current = state.level;
          required = conditionParams.value;
        }
        break;

      case "quest-count":
        if (conditionParams?.count !== undefined) {
          if (conditionParams.questType) {
            current =
              state.completedQuestsByType?.[
                conditionParams.questType.toLowerCase()
              ] || 0;
          } else {
            current = state.completedQuestCount;
          }
          required = conditionParams.count;
        }
        break;
    }

    const percentage = Math.min(100, Math.round((current / required) * 100));

    return {
      definition,
      current,
      required,
      percentage,
      unlocked: isUnlocked,
    };
  });

  return progress;
}
