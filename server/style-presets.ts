/**
 * Quick-apply style presets for instant template customization
 * Each preset defines a complete color, typography, and layout scheme
 */

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  category: "modern" | "classic" | "bold" | "warm" | "professional" | "creative" | "vintage" | "minimal";
  icon: string;
  coverColor: string;
  accentColor: string;
  bodyFont: string;
  headingFont: string;
  bodyFontSize: number;
  headingFontSize: number;
  lineHeight: string;
  marginTop: string;
  marginBottom: string;
  marginLeft: string;
  marginRight: string;
  chapterStyle: "numbered" | "titled" | "decorated";
}

export const STYLE_PRESETS: Record<string, StylePreset> = {
  modern_minimal: {
    id: "modern_minimal",
    name: "Modern & Minimal",
    description: "Clean, contemporary design with minimalist aesthetics and ample whitespace",
    category: "modern",
    icon: "✨",
    coverColor: "#ffffff",
    accentColor: "#000000",
    bodyFont: "Helvetica",
    headingFont: "Helvetica",
    bodyFontSize: 11,
    headingFontSize: 22,
    lineHeight: "1.5",
    marginTop: "1",
    marginBottom: "1",
    marginLeft: "1",
    marginRight: "1",
    chapterStyle: "numbered",
  },

  classic_elegant: {
    id: "classic_elegant",
    name: "Classic & Elegant",
    description: "Timeless sophistication with serif fonts and refined typography",
    category: "classic",
    icon: "👑",
    coverColor: "#2c2c2c",
    accentColor: "#d4af37",
    bodyFont: "Georgia",
    headingFont: "Georgia",
    bodyFontSize: 12,
    headingFontSize: 28,
    lineHeight: "1.6",
    marginTop: "0.75",
    marginBottom: "0.75",
    marginLeft: "0.75",
    marginRight: "0.75",
    chapterStyle: "titled",
  },

  bold_dark: {
    id: "bold_dark",
    name: "Bold & Dark",
    description: "High contrast, dramatic design perfect for thrillers and mysteries",
    category: "bold",
    icon: "🌑",
    coverColor: "#0a0e27",
    accentColor: "#ff0000",
    bodyFont: "Courier New",
    headingFont: "Helvetica-Bold",
    bodyFontSize: 11,
    headingFontSize: 26,
    lineHeight: "1.5",
    marginTop: "0.75",
    marginBottom: "0.75",
    marginLeft: "0.75",
    marginRight: "0.75",
    chapterStyle: "numbered",
  },

  warm_inviting: {
    id: "warm_inviting",
    name: "Warm & Inviting",
    description: "Cozy, welcoming aesthetic with warm earth tones and comfortable spacing",
    category: "warm",
    icon: "🔥",
    coverColor: "#8b6f47",
    accentColor: "#d2691e",
    bodyFont: "Georgia",
    headingFont: "Georgia",
    bodyFontSize: 12,
    headingFontSize: 26,
    lineHeight: "1.6",
    marginTop: "1",
    marginBottom: "1",
    marginLeft: "0.75",
    marginRight: "0.75",
    chapterStyle: "titled",
  },

  professional_clean: {
    id: "professional_clean",
    name: "Professional & Clean",
    description: "Business-focused design with clear hierarchy and professional appearance",
    category: "professional",
    icon: "💼",
    coverColor: "#ffffff",
    accentColor: "#003366",
    bodyFont: "Helvetica",
    headingFont: "Helvetica-Bold",
    bodyFontSize: 11,
    headingFontSize: 24,
    lineHeight: "1.5",
    marginTop: "0.75",
    marginBottom: "0.75",
    marginLeft: "0.75",
    marginRight: "0.75",
    chapterStyle: "numbered",
  },

  creative_artistic: {
    id: "creative_artistic",
    name: "Creative & Artistic",
    description: "Vibrant, expressive design with bold colors and decorative elements",
    category: "creative",
    icon: "🎨",
    coverColor: "#ff6b9d",
    accentColor: "#c44569",
    bodyFont: "Georgia",
    headingFont: "Helvetica-Bold",
    bodyFontSize: 12,
    headingFontSize: 28,
    lineHeight: "1.6",
    marginTop: "1",
    marginBottom: "1",
    marginLeft: "1",
    marginRight: "1",
    chapterStyle: "decorated",
  },

  vintage_nostalgic: {
    id: "vintage_nostalgic",
    name: "Vintage & Nostalgic",
    description: "Retro-inspired design evoking classic literature and timeless charm",
    category: "vintage",
    icon: "📚",
    coverColor: "#d4a574",
    accentColor: "#8b4513",
    bodyFont: "Georgia",
    headingFont: "Palatino",
    bodyFontSize: 12,
    headingFontSize: 26,
    lineHeight: "1.7",
    marginTop: "1",
    marginBottom: "1",
    marginLeft: "1",
    marginRight: "1",
    chapterStyle: "titled",
  },

  minimalist_zen: {
    id: "minimalist_zen",
    name: "Minimalist & Zen",
    description: "Peaceful, meditative design with subtle colors and generous whitespace",
    category: "minimal",
    icon: "🧘",
    coverColor: "#f5f5f5",
    accentColor: "#666666",
    bodyFont: "Helvetica",
    headingFont: "Helvetica",
    bodyFontSize: 11,
    headingFontSize: 20,
    lineHeight: "1.8",
    marginTop: "1.25",
    marginBottom: "1.25",
    marginLeft: "1",
    marginRight: "1",
    chapterStyle: "titled",
  },

  luxury_premium: {
    id: "luxury_premium",
    name: "Luxury & Premium",
    description: "High-end, sophisticated design with gold accents and premium typography",
    category: "classic",
    icon: "💎",
    coverColor: "#1a1a1a",
    accentColor: "#ffd700",
    bodyFont: "Georgia",
    headingFont: "Palatino",
    bodyFontSize: 12,
    headingFontSize: 30,
    lineHeight: "1.6",
    marginTop: "1",
    marginBottom: "1",
    marginLeft: "1",
    marginRight: "1",
    chapterStyle: "decorated",
  },

  tech_futuristic: {
    id: "tech_futuristic",
    name: "Tech & Futuristic",
    description: "Modern, cutting-edge design with tech-inspired colors and monospace fonts",
    category: "modern",
    icon: "🚀",
    coverColor: "#0d1117",
    accentColor: "#58a6ff",
    bodyFont: "Courier New",
    headingFont: "Courier New",
    bodyFontSize: 11,
    headingFontSize: 24,
    lineHeight: "1.5",
    marginTop: "0.75",
    marginBottom: "0.75",
    marginLeft: "0.75",
    marginRight: "0.75",
    chapterStyle: "numbered",
  },

  nature_organic: {
    id: "nature_organic",
    name: "Nature & Organic",
    description: "Natural, earthy design inspired by nature with organic color palette",
    category: "warm",
    icon: "🌿",
    coverColor: "#3d5a3d",
    accentColor: "#8fbc8f",
    bodyFont: "Georgia",
    headingFont: "Georgia",
    bodyFontSize: 12,
    headingFontSize: 26,
    lineHeight: "1.6",
    marginTop: "1",
    marginBottom: "1",
    marginLeft: "0.75",
    marginRight: "0.75",
    chapterStyle: "titled",
  },

  playful_fun: {
    id: "playful_fun",
    name: "Playful & Fun",
    description: "Lighthearted, cheerful design perfect for children's books and young adult",
    category: "creative",
    icon: "🎉",
    coverColor: "#ffb6c1",
    accentColor: "#ff69b4",
    bodyFont: "Helvetica",
    headingFont: "Helvetica-Bold",
    bodyFontSize: 12,
    headingFontSize: 28,
    lineHeight: "1.7",
    marginTop: "1",
    marginBottom: "1",
    marginLeft: "1",
    marginRight: "1",
    chapterStyle: "titled",
  },
};

export const PRESET_CATEGORIES = [
  { id: "modern", name: "Modern", icon: "✨" },
  { id: "classic", name: "Classic", icon: "👑" },
  { id: "bold", name: "Bold", icon: "🌑" },
  { id: "warm", name: "Warm", icon: "🔥" },
  { id: "professional", name: "Professional", icon: "💼" },
  { id: "creative", name: "Creative", icon: "🎨" },
  { id: "vintage", name: "Vintage", icon: "📚" },
  { id: "minimal", name: "Minimal", icon: "🧘" },
];

export const PRESET_LIST = Object.values(STYLE_PRESETS).map((preset) => ({
  id: preset.id,
  name: preset.name,
  description: preset.description,
  category: preset.category,
  icon: preset.icon,
}));

export function getPresetById(id: string): StylePreset | null {
  return STYLE_PRESETS[id] || null;
}

export function getPresetsByCategory(category: string): StylePreset[] {
  return Object.values(STYLE_PRESETS).filter((preset) => preset.category === category);
}

export function getAllPresets(): StylePreset[] {
  return Object.values(STYLE_PRESETS);
}

export function searchPresets(query: string): StylePreset[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(STYLE_PRESETS).filter(
    (preset) =>
      preset.name.toLowerCase().includes(lowerQuery) ||
      preset.description.toLowerCase().includes(lowerQuery)
  );
}
