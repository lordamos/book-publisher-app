import { STYLE_PRESETS, StylePreset } from "./style-presets";

/**
 * Preset Recommendation System
 * Analyzes book genre and content to recommend suitable style presets
 */

export interface RecommendationScore {
  presetId: string;
  preset: StylePreset;
  score: number;
  confidence: number;
  reasons: string[];
}

// Genre to preset category mapping
const GENRE_PRESET_MAP: Record<string, string[]> = {
  romance: ["classic", "warm", "creative"],
  mystery: ["bold", "professional", "vintage"],
  thriller: ["bold", "modern", "professional"],
  "science-fiction": ["modern", "creative", "professional"],
  fantasy: ["creative", "classic", "vintage"],
  "non-fiction": ["professional", "modern", "minimal"],
  memoir: ["classic", "warm", "vintage"],
  "young-adult": ["creative", "modern", "warm"],
  horror: ["bold", "modern", "creative"],
  poetry: ["minimal", "classic", "creative"],
  children: ["creative", "warm", "playful"],
  adventure: ["bold", "creative", "modern"],
  historical: ["vintage", "classic", "warm"],
  biography: ["professional", "classic", "minimal"],
  selfhelp: ["professional", "modern", "minimal"],
};

// Tone keywords and their associated preset categories
const TONE_PRESET_MAP: Record<string, string[]> = {
  formal: ["professional", "classic", "minimal"],
  casual: ["modern", "creative", "warm"],
  dramatic: ["bold", "creative", "classic"],
  humorous: ["creative", "warm", "playful"],
  serious: ["professional", "bold", "classic"],
  whimsical: ["creative", "warm", "playful"],
  mysterious: ["bold", "vintage", "modern"],
  romantic: ["classic", "warm", "creative"],
  technical: ["professional", "modern", "minimal"],
  artistic: ["creative", "vintage", "warm"],
  minimalist: ["minimal", "modern", "professional"],
  luxurious: ["classic", "creative", "bold"],
};

// Tone detection keywords
const TONE_KEYWORDS: Record<string, string[]> = {
  formal: [
    "therefore",
    "moreover",
    "furthermore",
    "consequently",
    "however",
    "nevertheless",
    "research",
    "analysis",
    "study",
    "evidence",
  ],
  casual: [
    "hey",
    "yeah",
    "gonna",
    "wanna",
    "like",
    "cool",
    "awesome",
    "fun",
    "easy",
    "simple",
  ],
  dramatic: [
    "suddenly",
    "shocking",
    "devastating",
    "incredible",
    "amazing",
    "terrifying",
    "breathtaking",
    "intense",
    "powerful",
    "climactic",
  ],
  humorous: [
    "funny",
    "hilarious",
    "laugh",
    "joke",
    "ridiculous",
    "absurd",
    "silly",
    "witty",
    "clever",
    "amusing",
  ],
  serious: [
    "important",
    "critical",
    "grave",
    "serious",
    "urgent",
    "vital",
    "crucial",
    "significant",
    "profound",
    "solemn",
  ],
  mysterious: [
    "mysterious",
    "secret",
    "hidden",
    "unknown",
    "enigma",
    "puzzle",
    "cryptic",
    "obscure",
    "shadowy",
    "veiled",
  ],
  romantic: [
    "love",
    "heart",
    "passion",
    "romance",
    "tender",
    "intimate",
    "affection",
    "devotion",
    "adore",
    "cherish",
  ],
  technical: [
    "algorithm",
    "system",
    "process",
    "method",
    "technical",
    "implementation",
    "architecture",
    "framework",
    "protocol",
    "specification",
  ],
};

export function detectTone(content: string): Record<string, number> {
  const lowerContent = content.toLowerCase();
  const toneScores: Record<string, number> = {};

  for (const [tone, keywords] of Object.entries(TONE_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      const matches = lowerContent.match(regex);
      score += matches ? matches.length : 0;
    }
    toneScores[tone] = score;
  }

  // Normalize scores
  const totalScore = Object.values(toneScores).reduce((a, b) => a + b, 0);
  if (totalScore > 0) {
    for (const tone in toneScores) {
      toneScores[tone] = toneScores[tone] / totalScore;
    }
  }

  return toneScores;
}

export function getGenrePresets(genre: string): string[] {
  const normalizedGenre = genre.toLowerCase().replace(/\s+/g, "-");
  return GENRE_PRESET_MAP[normalizedGenre] || ["modern", "classic", "professional"];
}

export function getTonePresets(toneScores: Record<string, number>): string[] {
  const presetCategoryScores: Record<string, number> = {};

  for (const [tone, score] of Object.entries(toneScores)) {
    if (score > 0.05) {
      // Only consider tones with at least 5% weight
      const categories = TONE_PRESET_MAP[tone] || [];
      for (const category of categories) {
        presetCategoryScores[category] = (presetCategoryScores[category] || 0) + score;
      }
    }
  }

  // Sort by score and return top categories
  return Object.entries(presetCategoryScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([category]) => category);
}

export function recommendPresets(
  genre: string,
  content: string,
  limit: number = 5
): RecommendationScore[] {
  const genrePresets = getGenrePresets(genre);
  const toneScores = detectTone(content);
  const tonePresets = getTonePresets(toneScores);

  // Calculate scores for each preset
  const presetScores: Record<string, RecommendationScore> = {};

  for (const [presetId, preset] of Object.entries(STYLE_PRESETS)) {
    let score = 0;
    const reasons: string[] = [];

    // Genre matching (50% weight)
    if (genrePresets.includes(preset.category)) {
      score += 50;
      reasons.push(`Perfect for ${genre} books`);
    }

    // Tone matching (40% weight)
    if (tonePresets.includes(preset.category)) {
      score += 40;
      const matchingTones = Object.entries(toneScores)
        .filter(([tone, s]) => s > 0.05 && TONE_PRESET_MAP[tone]?.includes(preset.category))
        .map(([tone]) => tone);
      if (matchingTones.length > 0) {
        reasons.push(`Matches ${matchingTones.join(", ")} tone`);
      }
    }

    // Category diversity bonus (10% weight)
    const categoryCount = Object.values(STYLE_PRESETS).filter(
      (p) => p.category === preset.category
    ).length;
    if (categoryCount < 3) {
      score += 10;
    }

    // Calculate confidence (0-100)
    const confidence = Math.min(100, score);

    presetScores[presetId] = {
      presetId,
      preset,
      score,
      confidence,
      reasons: reasons.length > 0 ? reasons : ["Versatile choice"],
    };
  }

  // Sort by score and return top presets
  return Object.values(presetScores)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getRecommendationExplanation(recommendation: RecommendationScore): string {
  const reasons = recommendation.reasons.join(" • ");
  const confidence =
    recommendation.confidence >= 80
      ? "highly recommended"
      : recommendation.confidence >= 60
        ? "recommended"
        : "suggested";

  return `${recommendation.preset.name} is ${confidence} for your book (${recommendation.confidence}% match). ${reasons}`;
}

export function scorePresetForBook(
  preset: StylePreset,
  genre: string,
  content: string
): number {
  const genrePresets = getGenrePresets(genre);
  const toneScores = detectTone(content);
  const tonePresets = getTonePresets(toneScores);

  let score = 0;

  if (genrePresets.includes(preset.category)) {
    score += 50;
  }

  if (tonePresets.includes(preset.category)) {
    score += 40;
  }

  return Math.min(100, score);
}
