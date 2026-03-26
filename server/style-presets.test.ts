import { describe, it, expect } from "vitest";
import {
  STYLE_PRESETS,
  PRESET_CATEGORIES,
  PRESET_LIST,
  getPresetById,
  getPresetsByCategory,
  getAllPresets,
  searchPresets,
} from "./style-presets";

/**
 * Tests for Style Presets Feature
 * Validates preset configurations and retrieval functions
 */

describe("Style Presets", () => {
  describe("Preset Data Structure", () => {
    it("should have multiple presets", () => {
      expect(Object.keys(STYLE_PRESETS).length).toBeGreaterThanOrEqual(10);
    });

    it("should have required properties for each preset", () => {
      for (const [key, preset] of Object.entries(STYLE_PRESETS)) {
        expect(preset).toHaveProperty("id");
        expect(preset).toHaveProperty("name");
        expect(preset).toHaveProperty("description");
        expect(preset).toHaveProperty("category");
        expect(preset).toHaveProperty("icon");
        expect(preset).toHaveProperty("coverColor");
        expect(preset).toHaveProperty("accentColor");
        expect(preset).toHaveProperty("bodyFont");
        expect(preset).toHaveProperty("headingFont");
        expect(preset).toHaveProperty("bodyFontSize");
        expect(preset).toHaveProperty("headingFontSize");
        expect(preset).toHaveProperty("lineHeight");
        expect(preset).toHaveProperty("marginTop");
        expect(preset).toHaveProperty("marginBottom");
        expect(preset).toHaveProperty("marginLeft");
        expect(preset).toHaveProperty("marginRight");
        expect(preset).toHaveProperty("chapterStyle");
      }
    });

    it("should have unique preset IDs", () => {
      const ids = Object.keys(STYLE_PRESETS);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe("Preset Categories", () => {
    it("should have category definitions", () => {
      expect(PRESET_CATEGORIES.length).toBeGreaterThan(0);
    });

    it("should have required category properties", () => {
      for (const category of PRESET_CATEGORIES) {
        expect(category).toHaveProperty("id");
        expect(category).toHaveProperty("name");
        expect(category).toHaveProperty("icon");
      }
    });

    it("should have valid category IDs", () => {
      const categoryIds = PRESET_CATEGORIES.map((c) => c.id);
      expect(categoryIds).toContain("modern");
      expect(categoryIds).toContain("classic");
      expect(categoryIds).toContain("bold");
      expect(categoryIds).toContain("warm");
      expect(categoryIds).toContain("professional");
      expect(categoryIds).toContain("creative");
      expect(categoryIds).toContain("vintage");
      expect(categoryIds).toContain("minimal");
    });
  });

  describe("Preset List", () => {
    it("should match preset count", () => {
      expect(PRESET_LIST.length).toBe(Object.keys(STYLE_PRESETS).length);
    });

    it("should have lightweight preset info", () => {
      for (const item of PRESET_LIST) {
        expect(item).toHaveProperty("id");
        expect(item).toHaveProperty("name");
        expect(item).toHaveProperty("description");
        expect(item).toHaveProperty("category");
        expect(item).toHaveProperty("icon");
        expect(item).not.toHaveProperty("bodyFont");
      }
    });
  });

  describe("Color Validation", () => {
    it("should have valid hex colors", () => {
      const hexColorRegex = /^#[0-9A-F]{6}$/i;

      for (const [key, preset] of Object.entries(STYLE_PRESETS)) {
        expect(preset.coverColor).toMatch(hexColorRegex);
        expect(preset.accentColor).toMatch(hexColorRegex);
      }
    });

    it("should have contrasting colors", () => {
      for (const [key, preset] of Object.entries(STYLE_PRESETS)) {
        expect(preset.coverColor).not.toBe(preset.accentColor);
      }
    });
  });

  describe("Typography Configuration", () => {
    it("should have valid font sizes", () => {
      for (const [key, preset] of Object.entries(STYLE_PRESETS)) {
        expect(preset.bodyFontSize).toBeGreaterThanOrEqual(8);
        expect(preset.bodyFontSize).toBeLessThanOrEqual(20);
        expect(preset.headingFontSize).toBeGreaterThanOrEqual(16);
        expect(preset.headingFontSize).toBeLessThanOrEqual(48);
        expect(preset.headingFontSize).toBeGreaterThan(preset.bodyFontSize);
      }
    });

    it("should have valid line heights", () => {
      for (const [key, preset] of Object.entries(STYLE_PRESETS)) {
        const lineHeight = parseFloat(preset.lineHeight);
        expect(lineHeight).toBeGreaterThanOrEqual(1);
        expect(lineHeight).toBeLessThanOrEqual(2);
      }
    });

    it("should have font names", () => {
      for (const [key, preset] of Object.entries(STYLE_PRESETS)) {
        expect(preset.bodyFont.length).toBeGreaterThan(0);
        expect(preset.headingFont.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Layout Configuration", () => {
    it("should have valid margins", () => {
      for (const [key, preset] of Object.entries(STYLE_PRESETS)) {
        const margins = [
          parseFloat(preset.marginTop),
          parseFloat(preset.marginBottom),
          parseFloat(preset.marginLeft),
          parseFloat(preset.marginRight),
        ];

        for (const margin of margins) {
          expect(margin).toBeGreaterThanOrEqual(0);
          expect(margin).toBeLessThanOrEqual(2);
        }
      }
    });
  });

  describe("Chapter Style", () => {
    it("should have valid chapter styles", () => {
      const validStyles = ["numbered", "titled", "decorated"];

      for (const [key, preset] of Object.entries(STYLE_PRESETS)) {
        expect(validStyles).toContain(preset.chapterStyle);
      }
    });
  });

  describe("Retrieval Functions", () => {
    it("should get preset by ID", () => {
      const preset = getPresetById("modern_minimal");
      expect(preset).not.toBeNull();
      expect(preset?.name).toBe("Modern & Minimal");
    });

    it("should return null for invalid ID", () => {
      const preset = getPresetById("invalid_preset");
      expect(preset).toBeNull();
    });

    it("should get presets by category", () => {
      const modernPresets = getPresetsByCategory("modern");
      expect(modernPresets.length).toBeGreaterThan(0);

      for (const preset of modernPresets) {
        expect(preset.category).toBe("modern");
      }
    });

    it("should get all presets", () => {
      const allPresets = getAllPresets();
      expect(allPresets.length).toBe(Object.keys(STYLE_PRESETS).length);
    });

    it("should search presets by name", () => {
      const results = searchPresets("Modern");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name.toLowerCase()).toContain("modern");
    });

    it("should search presets by description", () => {
      const results = searchPresets("elegant");
      expect(results.length).toBeGreaterThan(0);
    });

    it("should return empty array for no matches", () => {
      const results = searchPresets("nonexistent_preset_xyz");
      expect(results.length).toBe(0);
    });
  });

  describe("Specific Presets", () => {
    it("Modern & Minimal should be clean", () => {
      const preset = getPresetById("modern_minimal");
      expect(preset?.coverColor).toBe("#ffffff");
      expect(preset?.accentColor).toBe("#000000");
      expect(preset?.marginTop).toBe("1");
    });

    it("Classic & Elegant should use Georgia", () => {
      const preset = getPresetById("classic_elegant");
      expect(preset?.bodyFont).toBe("Georgia");
      expect(preset?.headingFont).toBe("Georgia");
      expect(preset?.chapterStyle).toBe("titled");
    });

    it("Bold & Dark should have high contrast", () => {
      const preset = getPresetById("bold_dark");
      expect(preset?.coverColor).toBe("#0a0e27");
      expect(preset?.accentColor).toBe("#ff0000");
    });

    it("Tech & Futuristic should use monospace", () => {
      const preset = getPresetById("tech_futuristic");
      expect(preset?.bodyFont).toBe("Courier New");
      expect(preset?.headingFont).toBe("Courier New");
    });

    it("Playful & Fun should have large fonts", () => {
      const preset = getPresetById("playful_fun");
      expect(preset?.bodyFontSize).toBeGreaterThanOrEqual(12);
      expect(preset?.headingFontSize).toBeGreaterThanOrEqual(28);
    });

    it("Minimalist & Zen should have generous spacing", () => {
      const preset = getPresetById("minimalist_zen");
      expect(parseFloat(preset?.marginTop || "0")).toBeGreaterThanOrEqual(1);
      expect(parseFloat(preset?.lineHeight || "1")).toBeGreaterThanOrEqual(1.7);
    });
  });

  describe("Preset Consistency", () => {
    it("should have consistent property types", () => {
      for (const [key, preset] of Object.entries(STYLE_PRESETS)) {
        expect(typeof preset.id).toBe("string");
        expect(typeof preset.name).toBe("string");
        expect(typeof preset.description).toBe("string");
        expect(typeof preset.category).toBe("string");
        expect(typeof preset.icon).toBe("string");
        expect(typeof preset.coverColor).toBe("string");
        expect(typeof preset.accentColor).toBe("string");
        expect(typeof preset.bodyFont).toBe("string");
        expect(typeof preset.headingFont).toBe("string");
        expect(typeof preset.bodyFontSize).toBe("number");
        expect(typeof preset.headingFontSize).toBe("number");
        expect(typeof preset.lineHeight).toBe("string");
        expect(typeof preset.marginTop).toBe("string");
        expect(typeof preset.marginBottom).toBe("string");
        expect(typeof preset.marginLeft).toBe("string");
        expect(typeof preset.marginRight).toBe("string");
        expect(typeof preset.chapterStyle).toBe("string");
      }
    });
  });

  describe("Preset Diversity", () => {
    it("should have presets for different genres", () => {
      const allPresets = getAllPresets();
      const categories = new Set(allPresets.map((p) => p.category));

      expect(categories.size).toBeGreaterThanOrEqual(5);
    });

    it("should have variety of color schemes", () => {
      const allPresets = getAllPresets();
      const colors = new Set(allPresets.map((p) => p.coverColor));

      expect(colors.size).toBeGreaterThanOrEqual(10);
    });

    it("should have variety of fonts", () => {
      const allPresets = getAllPresets();
      const fonts = new Set([
        ...allPresets.map((p) => p.bodyFont),
        ...allPresets.map((p) => p.headingFont),
      ]);

      expect(fonts.size).toBeGreaterThanOrEqual(5);
    });
  });

  describe("Search Functionality", () => {
    it("should be case-insensitive", () => {
      const resultsLower = searchPresets("modern");
      const resultsUpper = searchPresets("MODERN");
      const resultsMixed = searchPresets("MoDErN");

      expect(resultsLower.length).toBe(resultsUpper.length);
      expect(resultsLower.length).toBe(resultsMixed.length);
    });

    it("should match partial names", () => {
      const results = searchPresets("Minimal");
      expect(results.length).toBeGreaterThan(0);
    });

    it("should match descriptions", () => {
      const results = searchPresets("sophisticated");
      expect(results.length).toBeGreaterThan(0);
    });
  });
});
