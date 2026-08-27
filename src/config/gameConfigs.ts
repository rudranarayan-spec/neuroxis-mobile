export interface MetricConfig {
  label: string;
  value: string;
}

export interface SpeedRewardConfig {
  targetTimeFormatted: string;
  bonusXp: number;
}

// Complex rule object definition
export interface GameRule {
  title?: string;
  description: string;
}

// Flexible RuleItem type allowing strings OR rule objects
export type RuleItem = string | GameRule;

export interface GameConfig {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  tagline: string;
  baseXp: number;
  speedReward?: SpeedRewardConfig;
  metrics: MetricConfig[];
  tacticalIntel: string[];
  rules: RuleItem[];
  controlsGuide?: string;
}

export const GAME_CONFIGS: Record<string, GameConfig> = {
  sudoku: {
    id: "sudoku",
    title: "MATRIX SUDOKU",
    subtitle: "CLASSIFIED DECRYPTION",
    icon: "🧩",
    description:
      "Decrypt the matrix grid sequence under time pressure. Complete missing blocks without breaking row, column, or sub-grid integrity.",
    tagline: "Decryption sequence verified successfully.",
    baseXp: 50,
    speedReward: {
      targetTimeFormatted: "Under 2:00 mins",
      bonusXp: 20,
    },
    metrics: [
      { label: "BASE REWARD", value: "+50 XP" },
      { label: "GRID CONFIG", value: "6 x 6 MATRIX" },
      { label: "TARGET TIME", value: "< 3:00 MIN" },
      { label: "DIFFICULTY", value: "NOVICE" },
    ],
    tacticalIntel: [
      "Scan sub-grids containing 4 or 5 pre-filled numbers first to quickly isolate missing entries.",
      "Conflict detection will highlight duplicate numbers in red automatically.",
    ],
    rules: [
      "Fill the grid so every row contains numbers 1 to 6 without duplicates.",
      "Every column must also contain numbers 1 to 6 with no repeats.",
      "Each 2x3 box outlined in green must contain digits 1 through 6.",
    ],
    controlsGuide:
      "Tap an empty cell, then select a digit from the keypad below.",
  },

  shikaku: {
    id: "shikaku",
    title: "SHIKAKU MATRIX",
    subtitle: "SPATIAL PARTITIONING",
    icon: "📐",
    description:
      "Partition the sector grid into isolated rectangular blocks. Ensure every block area perfectly matches its core integer identifier.",
    tagline: "Grid partitioned into valid geometric regions.",
    baseXp: 75,
    speedReward: {
      targetTimeFormatted: "Under 1:45 mins",
      bonusXp: 30,
    },
    metrics: [
      { label: "BASE REWARD", value: "+75 XP" },
      { label: "GRID CONFIG", value: "5 x 5 SECTOR" },
      { label: "TARGET TIME", value: "< 2:30 MIN" },
      { label: "DIFFICULTY", value: "INTERMEDIATE" },
    ],
    tacticalIntel: [
      "Target numbers with prime factors (e.g., 5 or 7) first as they can only form 1-cell wide rectangles.",
      "Overlapping drawn regions will automatically overwrite the previous section.",
    ],
    rules: [
      "Divide the grid into rectangular or square regions.",
      "Each region must contain exactly one number.",
      "The number indicates how many grid cells the rectangle must cover.",
    ],
    controlsGuide:
      "Drag across grid cells to form a rectangle, or tap a starting cell then tap your destination cell.",
  },

  echoPattern: {
    id: "echoPattern",
    title: "ECHO PATTERN",
    subtitle: "SEQUENCE RECALL",
    icon: "🧠",
    description:
      "Memorize the illuminated node sequence in real time and mirror the exact order to stabilize the memory field.",
    tagline: "Sequence recalled and synchronized without error.",
    baseXp: 75,
    speedReward: {
      targetTimeFormatted: "Under 10 secs",
      bonusXp: 25,
    },
    metrics: [
      { label: "BASE REWARD", value: "+75 XP" },
      { label: "GRID CONFIG", value: "3 x 3 MATRIX" },
      { label: "TARGET TIME", value: "< 15 SEC" },
      { label: "DIFFICULTY", value: "INTERMEDIATE" },
    ],
    tacticalIntel: [
      "Observe the preview closely before tapping—the timer only starts once user input unlocks.",
      "Tracing the pattern spatially as a continuous geometric shape can help retain longer sequences.",
    ],
    rules: [
      "Watch the glowing tile preview sequence during the initial phase.",
      "Tap the grid tiles in the exact order they illuminated.",
      "A single sequence mistake resets your progress for the current round.",
    ],
    controlsGuide:
      "Tap the individual matrix tiles in sequence. Use the replay button if you need to review the initial preview.",
  },
};
