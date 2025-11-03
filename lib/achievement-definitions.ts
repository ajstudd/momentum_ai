// Central achievement definitions for passives, titles, and badges
// These define what CAN be unlocked and their conditions

export interface AchievementDefinition {
  id: string;
  type: "passive" | "title" | "badge";
  title: string;
  description: string;
  unlockCondition: string; // Human-readable
  // Condition for code evaluation
  conditionType: "stat" | "level" | "quest-count" | "specific-quest" | "manual";
  conditionParams?: {
    stat?: string;
    value?: number;
    questType?: string; // e.g., "strength", "intelligence"
    questTitle?: string;
    count?: number;
  };
  // For badges
  icon?: string;
  color?: string;
}

// PASSIVES - Auto-unlock based on stats/level/quest milestones
export const PASSIVE_DEFINITIONS: AchievementDefinition[] = [
  // Strength Passives
  {
    id: "iron-will",
    type: "passive",
    title: "Iron Will",
    description:
      "Your determination is unbreakable. +5% resistance to mental fatigue.",
    unlockCondition: "Reach Strength 20",
    conditionType: "stat",
    conditionParams: { stat: "strength", value: 20 },
  },
  {
    id: "titans-grip",
    type: "passive",
    title: "Titan's Grip",
    description:
      "Physical challenges feel lighter. Enhanced carrying capacity.",
    unlockCondition: "Reach Strength 40",
    conditionType: "stat",
    conditionParams: { stat: "strength", value: 40 },
  },
  {
    id: "unbreakable",
    type: "passive",
    title: "Unbreakable",
    description:
      "You've transcended physical limits. Maximum strength efficiency.",
    unlockCondition: "Reach Strength 70",
    conditionType: "stat",
    conditionParams: { stat: "strength", value: 70 },
  },

  // Intelligence Passives
  {
    id: "quick-learner",
    type: "passive",
    title: "Quick Learner",
    description: "You absorb knowledge faster than most. +10% learning speed.",
    unlockCondition: "Reach Intelligence 20",
    conditionType: "stat",
    conditionParams: { stat: "intelligence", value: 20 },
  },
  {
    id: "strategic-mind",
    type: "passive",
    title: "Strategic Mind",
    description:
      "Complex problems become puzzles to solve. Enhanced pattern recognition.",
    unlockCondition: "Reach Intelligence 40",
    conditionType: "stat",
    conditionParams: { stat: "intelligence", value: 40 },
  },
  {
    id: "genius",
    type: "passive",
    title: "Genius",
    description:
      "Your intellect operates on a different plane. Maximum cognitive efficiency.",
    unlockCondition: "Reach Intelligence 70",
    conditionType: "stat",
    conditionParams: { stat: "intelligence", value: 70 },
  },

  // Agility Passives
  {
    id: "nimble",
    type: "passive",
    title: "Nimble",
    description: "Your reflexes are sharp and precise. +10% reaction speed.",
    unlockCondition: "Reach Agility 20",
    conditionType: "stat",
    conditionParams: { stat: "agility", value: 20 },
  },
  {
    id: "lightning-reflexes",
    type: "passive",
    title: "Lightning Reflexes",
    description: "You move with supernatural grace. Enhanced coordination.",
    unlockCondition: "Reach Agility 40",
    conditionType: "stat",
    conditionParams: { stat: "agility", value: 40 },
  },
  {
    id: "untouchable",
    type: "passive",
    title: "Untouchable",
    description: "You flow like water around obstacles. Peak agility mastery.",
    unlockCondition: "Reach Agility 70",
    conditionType: "stat",
    conditionParams: { stat: "agility", value: 70 },
  },

  // Vitality Passives
  {
    id: "enduring",
    type: "passive",
    title: "Enduring",
    description: "Fatigue is just a suggestion. +15% stamina recovery.",
    unlockCondition: "Reach Vitality 20",
    conditionType: "stat",
    conditionParams: { stat: "vitality", value: 20 },
  },
  {
    id: "iron-constitution",
    type: "passive",
    title: "Iron Constitution",
    description: "Your body recovers remarkably fast. Enhanced healing.",
    unlockCondition: "Reach Vitality 40",
    conditionType: "stat",
    conditionParams: { stat: "vitality", value: 40 },
  },
  {
    id: "immortal",
    type: "passive",
    title: "Immortal",
    description:
      "Death seems like a distant concept. Maximum vitality achieved.",
    unlockCondition: "Reach Vitality 70",
    conditionType: "stat",
    conditionParams: { stat: "vitality", value: 70 },
  },

  // Perception Passives
  {
    id: "observant",
    type: "passive",
    title: "Observant",
    description: "Nothing escapes your notice. +10% awareness.",
    unlockCondition: "Reach Perception 20",
    conditionType: "stat",
    conditionParams: { stat: "perception", value: 20 },
  },
  {
    id: "all-seeing",
    type: "passive",
    title: "All-Seeing",
    description: "You perceive patterns others miss. Enhanced intuition.",
    unlockCondition: "Reach Perception 40",
    conditionType: "stat",
    conditionParams: { stat: "perception", value: 40 },
  },
  {
    id: "omniscient",
    type: "passive",
    title: "Omniscient",
    description: "The world reveals its secrets to you. Perfect perception.",
    unlockCondition: "Reach Perception 70",
    conditionType: "stat",
    conditionParams: { stat: "perception", value: 70 },
  },

  // Level-based Passives
  {
    id: "determined",
    type: "passive",
    title: "Determined",
    description: "You've proven your commitment to growth. +5% XP gain.",
    unlockCondition: "Reach Level 5",
    conditionType: "level",
    conditionParams: { value: 5 },
  },
  {
    id: "veteran",
    type: "passive",
    title: "Veteran",
    description: "Experience has made you formidable. All stats +2.",
    unlockCondition: "Reach Level 10",
    conditionType: "level",
    conditionParams: { value: 10 },
  },
  {
    id: "master",
    type: "passive",
    title: "Master",
    description:
      "You've mastered the art of self-improvement. +10% all stat gains.",
    unlockCondition: "Reach Level 20",
    conditionType: "level",
    conditionParams: { value: 20 },
  },

  // Quest completion Passives
  {
    id: "warrior-spirit",
    type: "passive",
    title: "Warrior Spirit",
    description:
      "Physical challenges fuel your growth. Bonus strength quest rewards.",
    unlockCondition: "Complete 5 Strength quests",
    conditionType: "quest-count",
    conditionParams: { questType: "strength", count: 5 },
  },
  {
    id: "scholar-soul",
    type: "passive",
    title: "Scholar Soul",
    description: "Knowledge is your weapon. Bonus intelligence quest rewards.",
    unlockCondition: "Complete 5 Intelligence quests",
    conditionType: "quest-count",
    conditionParams: { questType: "intelligence", count: 5 },
  },
  {
    id: "swift-learner",
    type: "passive",
    title: "Swift Learner",
    description:
      "Speed and adaptability define you. Bonus agility quest rewards.",
    unlockCondition: "Complete 5 Agility quests",
    conditionType: "quest-count",
    conditionParams: { questType: "agility", count: 5 },
  },
];

// TITLES - Mix of auto-unlock and manual (from special quests)
export const TITLE_DEFINITIONS: AchievementDefinition[] = [
  // Level-based Titles (auto-unlock)
  {
    id: "novice",
    type: "title",
    title: "Novice",
    description: "Every master was once a beginner.",
    unlockCondition: "Reach Level 1",
    conditionType: "level",
    conditionParams: { value: 1 },
  },
  {
    id: "apprentice",
    type: "title",
    title: "Apprentice",
    description: "You're learning the ways of self-mastery.",
    unlockCondition: "Reach Level 3",
    conditionType: "level",
    conditionParams: { value: 3 },
  },
  {
    id: "adept",
    type: "title",
    title: "Adept",
    description: "Your skills are becoming formidable.",
    unlockCondition: "Reach Level 7",
    conditionType: "level",
    conditionParams: { value: 7 },
  },
  {
    id: "expert",
    type: "title",
    title: "Expert",
    description: "You stand above the average.",
    unlockCondition: "Reach Level 12",
    conditionType: "level",
    conditionParams: { value: 12 },
  },
  {
    id: "master-hunter",
    type: "title",
    title: "Master Hunter",
    description: "You've ascended to mastery.",
    unlockCondition: "Reach Level 20",
    conditionType: "level",
    conditionParams: { value: 20 },
  },
  {
    id: "monarch",
    type: "title",
    title: "Monarch",
    description: "You rule over your domain.",
    unlockCondition: "Reach Level 30",
    conditionType: "level",
    conditionParams: { value: 30 },
  },

  // Stat-based Titles (auto-unlock)
  {
    id: "the-strong",
    type: "title",
    title: "The Strong",
    description: "Physical power is your trademark.",
    unlockCondition: "Reach Strength 50",
    conditionType: "stat",
    conditionParams: { stat: "strength", value: 50 },
  },
  {
    id: "the-wise",
    type: "title",
    title: "The Wise",
    description: "Your intellect is legendary.",
    unlockCondition: "Reach Intelligence 50",
    conditionType: "stat",
    conditionParams: { stat: "intelligence", value: 50 },
  },
  {
    id: "the-swift",
    type: "title",
    title: "The Swift",
    description: "None can match your speed.",
    unlockCondition: "Reach Agility 50",
    conditionType: "stat",
    conditionParams: { stat: "agility", value: 50 },
  },
  {
    id: "the-resilient",
    type: "title",
    title: "The Resilient",
    description: "You are unbreakable.",
    unlockCondition: "Reach Vitality 50",
    conditionType: "stat",
    conditionParams: { stat: "vitality", value: 50 },
  },
  {
    id: "the-all-seeing",
    type: "title",
    title: "The All-Seeing",
    description: "Nothing escapes your gaze.",
    unlockCondition: "Reach Perception 50",
    conditionType: "stat",
    conditionParams: { stat: "perception", value: 50 },
  },

  // Quest completion Titles (auto-unlock)
  {
    id: "quest-seeker",
    type: "title",
    title: "Quest Seeker",
    description: "You actively pursue growth.",
    unlockCondition: "Complete 10 quests",
    conditionType: "quest-count",
    conditionParams: { count: 10 },
  },
  {
    id: "quest-champion",
    type: "title",
    title: "Quest Champion",
    description: "Your dedication is unmatched.",
    unlockCondition: "Complete 25 quests",
    conditionType: "quest-count",
    conditionParams: { count: 25 },
  },
  {
    id: "quest-legend",
    type: "title",
    title: "Quest Legend",
    description: "Legends will be told of your achievements.",
    unlockCondition: "Complete 50 quests",
    conditionType: "quest-count",
    conditionParams: { count: 50 },
  },

  // Manual Titles (awarded through special quests - conditionType: "manual")
  {
    id: "dragon-slayer",
    type: "title",
    title: "Dragon Slayer",
    description: "You've defeated an impossible challenge.",
    unlockCondition: "Complete a legendary difficulty quest",
    conditionType: "manual", // Must be awarded as quest reward
  },
  {
    id: "shadow-monarch",
    type: "title",
    title: "Shadow Monarch",
    description: "You command the shadows themselves.",
    unlockCondition: "Awarded for exceptional achievement",
    conditionType: "manual",
  },
];

// BADGES - Mix of auto-unlock and manual
export const BADGE_DEFINITIONS: AchievementDefinition[] = [
  // First steps (auto-unlock)
  {
    id: "first-quest",
    type: "badge",
    title: "First Steps",
    description: "Completed your first quest!",
    unlockCondition: "Complete 1 quest",
    conditionType: "quest-count",
    conditionParams: { count: 1 },
    icon: "FS",
    color: "#10B981",
  },
  {
    id: "dedicated",
    type: "badge",
    title: "Dedicated",
    description: "Completed 5 quests.",
    unlockCondition: "Complete 5 quests",
    conditionType: "quest-count",
    conditionParams: { count: 5 },
    icon: "D",
    color: "#F59E0B",
  },
  {
    id: "unstoppable",
    type: "badge",
    title: "Unstoppable",
    description: "Completed 20 quests.",
    unlockCondition: "Complete 20 quests",
    conditionType: "quest-count",
    conditionParams: { count: 20 },
    icon: "U",
    color: "#EF4444",
  },

  // Level milestones (auto-unlock)
  {
    id: "level-5",
    type: "badge",
    title: "Rising Star",
    description: "Reached Level 5",
    unlockCondition: "Reach Level 5",
    conditionType: "level",
    conditionParams: { value: 5 },
    icon: "L5",
    color: "#8B5CF6",
  },
  {
    id: "level-10",
    type: "badge",
    title: "Elite Hunter",
    description: "Reached Level 10",
    unlockCondition: "Reach Level 10",
    conditionType: "level",
    conditionParams: { value: 10 },
    icon: "L10",
    color: "#06B6D4",
  },
  {
    id: "level-15",
    type: "badge",
    title: "Master Class",
    description: "Reached Level 15",
    unlockCondition: "Reach Level 15",
    conditionType: "level",
    conditionParams: { value: 15 },
    icon: "L15",
    color: "#FFD700",
  },

  // Stat specialists (auto-unlock)
  {
    id: "strength-master",
    type: "badge",
    title: "Strength Master",
    description: "Achieved Strength 60+",
    unlockCondition: "Reach Strength 60",
    conditionType: "stat",
    conditionParams: { stat: "strength", value: 60 },
    icon: "STR",
    color: "#DC2626",
  },
  {
    id: "intelligence-master",
    type: "badge",
    title: "Intelligence Master",
    description: "Achieved Intelligence 60+",
    unlockCondition: "Reach Intelligence 60",
    conditionType: "stat",
    conditionParams: { stat: "intelligence", value: 60 },
    icon: "INT",
    color: "#7C3AED",
  },
  {
    id: "agility-master",
    type: "badge",
    title: "Agility Master",
    description: "Achieved Agility 60+",
    unlockCondition: "Reach Agility 60",
    conditionType: "stat",
    conditionParams: { stat: "agility", value: 60 },
    icon: "AGI",
    color: "#FBBF24",
  },

  // Manual badges (special achievements)
  {
    id: "perfect-week",
    type: "badge",
    title: "Perfect Week",
    description: "Completed all weekly quests",
    unlockCondition: "Awarded for exceptional performance",
    conditionType: "manual",
    icon: "PW",
    color: "#FFD700",
  },
];

// Helper function to get all achievement definitions
export function getAllAchievementDefinitions(): AchievementDefinition[] {
  return [...PASSIVE_DEFINITIONS, ...TITLE_DEFINITIONS, ...BADGE_DEFINITIONS];
}

// Helper to get auto-unlockable achievements
export function getAutoUnlockableDefinitions(): AchievementDefinition[] {
  return getAllAchievementDefinitions().filter(
    (def) => def.conditionType !== "manual"
  );
}

// Helper to get definitions by type
export function getDefinitionsByType(
  type: "passive" | "title" | "badge"
): AchievementDefinition[] {
  const allDefs = getAllAchievementDefinitions();
  return allDefs.filter((def) => def.type === type);
}
