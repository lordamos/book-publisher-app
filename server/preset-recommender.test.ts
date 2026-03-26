import { describe, it, expect } from "vitest";
import {
  detectTone,
  getGenrePresets,
  getTonePresets,
  recommendPresets,
  getRecommendationExplanation,
  scorePresetForBook,
} from "./preset-recommender";

/**
 * Tests for Preset Recommendation System
 * Validates genre/content analysis and recommendation logic
 */

describe("Preset Recommendation System", () => {
  describe("Tone Detection", () => {
    it("should detect formal tone", () => {
      const content = "Therefore, the research analysis shows evidence of significant findings.";
      const tones = detectTone(content);

      expect(tones.formal).toBeGreaterThan(0);
    });

    it("should detect casual tone", () => {
      const content = "Hey, this is gonna be so cool and awesome! I like this fun stuff.";
      const tones = detectTone(content);

      expect(tones.casual).toBeGreaterThan(0);
    });

    it("should detect dramatic tone", () => {
      const content =
        "Suddenly, the shocking and devastating news arrived. It was absolutely incredible and terrifying.";
      const tones = detectTone(content);

      expect(tones.dramatic).toBeGreaterThan(0);
    });

    it("should detect humorous tone", () => {
      const content = "This is hilarious and funny. What an absurd and silly joke!";
      const tones = detectTone(content);

      expect(tones.humorous).toBeGreaterThan(0);
    });

    it("should detect romantic tone", () => {
      const content = "Love and passion filled her heart. She felt deep affection and devotion.";
      const tones = detectTone(content);

      expect(tones.romantic).toBeGreaterThan(0);
    });

    it("should detect mysterious tone", () => {
      const content = "The mysterious secret remained hidden and unknown. An enigma wrapped in shadows.";
      const tones = detectTone(content);

      expect(tones.mysterious).toBeGreaterThan(0);
    });

    it("should detect technical tone", () => {
      const content = "The algorithm implements a system using a technical framework and protocol.";
      const tones = detectTone(content);

      expect(tones.technical).toBeGreaterThan(0);
    });

    it("should normalize tone scores", () => {
      const content = "This is a test with multiple tones.";
      const tones = detectTone(content);

      const total = Object.values(tones).reduce((a, b) => a + b, 0);
      expect(total).toBeLessThanOrEqual(1.01); // Allow for floating point rounding
    });

    it("should handle empty content", () => {
      const tones = detectTone("");

      expect(Object.values(tones).every((score) => score === 0)).toBe(true);
    });
  });

  describe("Genre Preset Mapping", () => {
    it("should map romance genre", () => {
      const presets = getGenrePresets("romance");
      expect(presets).toContain("classic");
      expect(presets).toContain("warm");
    });

    it("should map mystery genre", () => {
      const presets = getGenrePresets("mystery");
      expect(presets).toContain("bold");
      expect(presets).toContain("professional");
    });

    it("should map thriller genre", () => {
      const presets = getGenrePresets("thriller");
      expect(presets).toContain("bold");
      expect(presets).toContain("modern");
    });

    it("should map science-fiction genre", () => {
      const presets = getGenrePresets("science-fiction");
      expect(presets).toContain("modern");
      expect(presets).toContain("creative");
    });

    it("should map fantasy genre", () => {
      const presets = getGenrePresets("fantasy");
      expect(presets).toContain("creative");
      expect(presets).toContain("classic");
    });

    it("should map non-fiction genre", () => {
      const presets = getGenrePresets("non-fiction");
      expect(presets).toContain("professional");
      expect(presets).toContain("modern");
    });

    it("should be case-insensitive", () => {
      const presetsLower = getGenrePresets("romance");
      const presetsUpper = getGenrePresets("ROMANCE");
      const presetsMixed = getGenrePresets("RoMaNcE");

      expect(presetsLower).toEqual(presetsUpper);
      expect(presetsLower).toEqual(presetsMixed);
    });

    it("should handle spaces in genre names", () => {
      const presets = getGenrePresets("science fiction");
      expect(presets.length).toBeGreaterThan(0);
    });

    it("should return default presets for unknown genre", () => {
      const presets = getGenrePresets("unknown_genre_xyz");
      expect(presets).toContain("modern");
      expect(presets).toContain("classic");
      expect(presets).toContain("professional");
    });
  });

  describe("Tone Preset Mapping", () => {
    it("should map formal tone to presets", () => {
      const toneScores = { formal: 1, casual: 0, dramatic: 0, humorous: 0 };
      const presets = getTonePresets(toneScores);

      expect(presets.length).toBeGreaterThan(0);
      expect(presets).toContain("professional");
    });

    it("should map casual tone to presets", () => {
      const toneScores = { formal: 0, casual: 1, dramatic: 0, humorous: 0 };
      const presets = getTonePresets(toneScores);

      expect(presets.length).toBeGreaterThan(0);
      expect(presets).toContain("modern");
    });

    it("should ignore low-scoring tones", () => {
      const toneScores = { formal: 0.02, casual: 0.98, dramatic: 0, humorous: 0 };
      const presets = getTonePresets(toneScores);

      expect(presets).toContain("modern");
    });

    it("should handle mixed tones", () => {
      const toneScores = { formal: 0.3, casual: 0.3, dramatic: 0.2, humorous: 0.2 };
      const presets = getTonePresets(toneScores);

      expect(presets.length).toBeGreaterThan(0);
    });
  });

  describe("Recommendation Engine", () => {
    it("should recommend presets for romance novel", () => {
      const recommendations = recommendPresets("romance", "Love and passion filled her heart.", 5);

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0].confidence).toBeGreaterThan(0);
    });

    it("should recommend presets for mystery novel", () => {
      const recommendations = recommendPresets(
        "mystery",
        "The mysterious secret remained hidden and unknown.",
        5
      );

      expect(recommendations.length).toBeGreaterThan(0);
    });

    it("should recommend presets for technical content", () => {
      const recommendations = recommendPresets(
        "non-fiction",
        "The algorithm implements a system using a technical framework.",
        5
      );

      expect(recommendations.length).toBeGreaterThan(0);
    });

    it("should respect limit parameter", () => {
      const recommendations = recommendPresets("romance", "Love and passion.", 3);

      expect(recommendations.length).toBeLessThanOrEqual(3);
    });

    it("should sort by score descending", () => {
      const recommendations = recommendPresets("romance", "Love and passion.", 5);

      for (let i = 1; i < recommendations.length; i++) {
        expect(recommendations[i - 1].score).toBeGreaterThanOrEqual(recommendations[i].score);
      }
    });

    it("should include reasons for recommendations", () => {
      const recommendations = recommendPresets("romance", "Love and passion.", 5);

      for (const rec of recommendations) {
        expect(rec.reasons.length).toBeGreaterThan(0);
      }
    });

    it("should calculate confidence scores", () => {
      const recommendations = recommendPresets("romance", "Love and passion.", 5);

      for (const rec of recommendations) {
        expect(rec.confidence).toBeGreaterThanOrEqual(0);
        expect(rec.confidence).toBeLessThanOrEqual(100);
      }
    });

    it("should handle empty content", () => {
      const recommendations = recommendPresets("romance", "", 5);

      expect(recommendations.length).toBeGreaterThan(0);
    });
  });

  describe("Recommendation Explanation", () => {
    it("should generate explanation for high confidence", () => {
      const recommendation = {
        presetId: "classic_elegant",
        preset: {
          id: "classic_elegant",
          name: "Classic & Elegant",
          description: "Test",
          category: "classic" as const,
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
          chapterStyle: "titled" as const,
        },
        score: 90,
        confidence: 90,
        reasons: ["Perfect for romance books"],
      };

      const explanation = getRecommendationExplanation(recommendation);

      expect(explanation).toContain("Classic & Elegant");
      expect(explanation).toContain("highly recommended");
      expect(explanation).toContain("90%");
    });

    it("should generate explanation for medium confidence", () => {
      const recommendation = {
        presetId: "modern_minimal",
        preset: {
          id: "modern_minimal",
          name: "Modern & Minimal",
          description: "Test",
          category: "modern" as const,
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
          chapterStyle: "numbered" as const,
        },
        score: 70,
        confidence: 70,
        reasons: ["Versatile choice"],
      };

      const explanation = getRecommendationExplanation(recommendation);

      expect(explanation).toContain("Modern & Minimal");
      expect(explanation).toContain("recommended");
      expect(explanation).toContain("70%");
    });
  });

  describe("Preset Scoring", () => {
    it("should score preset for romance book", () => {
      const score = scorePresetForBook(
        {
          id: "classic_elegant",
          name: "Classic & Elegant",
          description: "Test",
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
        "romance",
        "Love and passion."
      );

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it("should score preset for mystery book", () => {
      const score = scorePresetForBook(
        {
          id: "bold_dark",
          name: "Bold & Dark",
          description: "Test",
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
        "mystery",
        "The mysterious secret remained hidden."
      );

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long content", () => {
      const longContent = "love ".repeat(1000);
      const recommendations = recommendPresets("romance", longContent, 5);

      expect(recommendations.length).toBeGreaterThan(0);
    });

    it("should handle content with special characters", () => {
      const content = "Love @#$% passion!!! *** affection...";
      const tones = detectTone(content);

      expect(tones.romantic).toBeGreaterThan(0);
    });

    it("should handle mixed case keywords", () => {
      const content = "LOVE Passion AFFECTION devotion";
      const tones = detectTone(content);

      expect(tones.romantic).toBeGreaterThan(0);
    });

    it("should handle genre with extra spaces", () => {
      const presets = getGenrePresets("  romance  ");
      expect(presets.length).toBeGreaterThan(0);
    });
  });

  describe("Recommendation Diversity", () => {
    it("should recommend different presets for different genres", () => {
      const romanceRecs = recommendPresets("romance", "Love and passion.", 1);
      const mysteryRecs = recommendPresets("mystery", "Secret and hidden.", 1);

      expect(romanceRecs[0].presetId).not.toBe(mysteryRecs[0].presetId);
    });

    it("should recommend different presets for different tones", () => {
      const formalRecs = recommendPresets("non-fiction", "Therefore, the research shows.", 1);
      const casualRecs = recommendPresets("non-fiction", "Hey, this is cool stuff!", 1);

      expect(formalRecs[0].presetId).not.toBe(casualRecs[0].presetId);
    });
  });
});
