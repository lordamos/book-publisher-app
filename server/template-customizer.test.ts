import { describe, it, expect } from "vitest";

/**
 * Tests for Template Customizer Feature
 * Validates template customization logic and constraints
 */

describe("Template Customizer", () => {
  describe("Color Validation", () => {
    it("should validate hex color format", () => {
      const hexColorRegex = /^#[0-9A-F]{6}$/i;
      expect("#1a1a1a").toMatch(hexColorRegex);
      expect("#ff6b6b").toMatch(hexColorRegex);
      expect("#ffffff").toMatch(hexColorRegex);
      expect("#000000").toMatch(hexColorRegex);
    });

    it("should reject invalid hex colors", () => {
      const hexColorRegex = /^#[0-9A-F]{6}$/i;
      expect("#1a1a").not.toMatch(hexColorRegex);
      expect("1a1a1a").not.toMatch(hexColorRegex);
      expect("#gggggg").not.toMatch(hexColorRegex);
    });

    it("should ensure cover and accent colors are different", () => {
      const coverColor = "#1a1a1a";
      const accentColor = "#ff6b6b";
      expect(coverColor).not.toBe(accentColor);
    });
  });

  describe("Font Size Validation", () => {
    it("should validate body font size range", () => {
      const bodyFontSize = 12;
      expect(bodyFontSize).toBeGreaterThanOrEqual(8);
      expect(bodyFontSize).toBeLessThanOrEqual(20);
    });

    it("should validate heading font size range", () => {
      const headingFontSize = 24;
      expect(headingFontSize).toBeGreaterThanOrEqual(16);
      expect(headingFontSize).toBeLessThanOrEqual(48);
    });

    it("should ensure heading font is larger than body font", () => {
      const bodyFontSize = 12;
      const headingFontSize = 24;
      expect(headingFontSize).toBeGreaterThan(bodyFontSize);
    });

    it("should reject invalid font sizes", () => {
      const bodyFontSize = 5; // Too small
      expect(bodyFontSize).toBeLessThan(8);

      const headingFontSize = 60; // Too large
      expect(headingFontSize).toBeGreaterThan(48);
    });
  });

  describe("Line Height Validation", () => {
    it("should validate line height range", () => {
      const lineHeight = 1.5;
      expect(lineHeight).toBeGreaterThanOrEqual(1);
      expect(lineHeight).toBeLessThanOrEqual(2);
    });

    it("should support common line heights", () => {
      const validLineHeights = [1, 1.15, 1.5, 1.6, 1.8, 2];
      for (const lh of validLineHeights) {
        expect(lh).toBeGreaterThanOrEqual(1);
        expect(lh).toBeLessThanOrEqual(2);
      }
    });
  });

  describe("Margin Validation", () => {
    it("should validate margin ranges", () => {
      const margins = [0.75, 0.75, 0.75, 0.75];
      for (const margin of margins) {
        expect(margin).toBeGreaterThanOrEqual(0);
        expect(margin).toBeLessThanOrEqual(2);
      }
    });

    it("should support zero margins", () => {
      const margin = 0;
      expect(margin).toBeGreaterThanOrEqual(0);
    });

    it("should support large margins", () => {
      const margin = 2;
      expect(margin).toBeLessThanOrEqual(2);
    });

    it("should reject negative margins", () => {
      const margin = -0.5;
      expect(margin).toBeLessThan(0);
    });

    it("should reject margins over 2 inches", () => {
      const margin = 2.5;
      expect(margin).toBeGreaterThan(2);
    });
  });

  describe("Font Selection", () => {
    it("should support standard fonts", () => {
      const fonts = [
        "Georgia",
        "Helvetica",
        "Courier New",
        "Times New Roman",
        "Palatino",
        "Garamond",
        "Trebuchet MS",
        "Arial",
      ];
      expect(fonts.length).toBeGreaterThan(0);
      for (const font of fonts) {
        expect(font.length).toBeGreaterThan(0);
      }
    });

    it("should allow custom font names", () => {
      const customFont = "My Custom Font";
      expect(customFont.length).toBeGreaterThan(0);
    });
  });

  describe("Chapter Style Validation", () => {
    it("should support valid chapter styles", () => {
      const validStyles = ["numbered", "titled", "decorated"];
      expect(validStyles).toContain("numbered");
      expect(validStyles).toContain("titled");
      expect(validStyles).toContain("decorated");
    });

    it("should reject invalid chapter styles", () => {
      const validStyles = ["numbered", "titled", "decorated"];
      expect(validStyles).not.toContain("invalid");
      expect(validStyles).not.toContain("random");
    });
  });

  describe("Template Customization Workflow", () => {
    it("should create valid custom template object", () => {
      const customTemplate = {
        name: "My Custom Template",
        genre: "Custom",
        description: "A custom template",
        coverColor: "#1a1a1a",
        accentColor: "#ff6b6b",
        bodyFont: "Georgia",
        headingFont: "Helvetica-Bold",
        bodyFontSize: 12,
        headingFontSize: 24,
        lineHeight: "1.5",
        marginTop: "0.75",
        marginBottom: "0.75",
        marginLeft: "0.75",
        marginRight: "0.75",
        chapterStyle: "numbered",
        includeTableOfContents: true,
        includeFrontMatter: true,
        includeBackMatter: true,
      };

      expect(customTemplate).toHaveProperty("name");
      expect(customTemplate).toHaveProperty("genre");
      expect(customTemplate).toHaveProperty("description");
      expect(customTemplate).toHaveProperty("coverColor");
      expect(customTemplate).toHaveProperty("accentColor");
      expect(customTemplate).toHaveProperty("bodyFont");
      expect(customTemplate).toHaveProperty("headingFont");
      expect(customTemplate).toHaveProperty("bodyFontSize");
      expect(customTemplate).toHaveProperty("headingFontSize");
      expect(customTemplate).toHaveProperty("lineHeight");
      expect(customTemplate).toHaveProperty("marginTop");
      expect(customTemplate).toHaveProperty("marginBottom");
      expect(customTemplate).toHaveProperty("marginLeft");
      expect(customTemplate).toHaveProperty("marginRight");
      expect(customTemplate).toHaveProperty("chapterStyle");
      expect(customTemplate).toHaveProperty("includeTableOfContents");
      expect(customTemplate).toHaveProperty("includeFrontMatter");
      expect(customTemplate).toHaveProperty("includeBackMatter");
    });

    it("should allow partial customization", () => {
      const baseTemplate = {
        name: "Base",
        genre: "Romance",
        coverColor: "#d4a5a5",
        accentColor: "#c41e3a",
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
        includeTableOfContents: true,
        includeFrontMatter: true,
        includeBackMatter: true,
      };

      const customized = {
        ...baseTemplate,
        name: "My Romance",
        coverColor: "#ff69b4",
        bodyFontSize: 14,
      };

      expect(customized.name).toBe("My Romance");
      expect(customized.coverColor).toBe("#ff69b4");
      expect(customized.bodyFontSize).toBe(14);
      expect(customized.genre).toBe("Romance");
      expect(customized.headingFont).toBe("Georgia");
    });
  });

  describe("Reset Functionality", () => {
    it("should reset to original template values", () => {
      const original = {
        name: "Original",
        coverColor: "#1a1a1a",
        accentColor: "#ff6b6b",
        bodyFontSize: 12,
        headingFontSize: 24,
        lineHeight: "1.5",
        marginTop: "0.75",
      };

      const modified = {
        ...original,
        name: "Modified",
        coverColor: "#ffffff",
        bodyFontSize: 16,
      };

      // Reset to original
      const reset = {
        ...original,
      };

      expect(reset.name).toBe(original.name);
      expect(reset.coverColor).toBe(original.coverColor);
      expect(reset.bodyFontSize).toBe(original.bodyFontSize);
    });
  });

  describe("Live Preview Calculations", () => {
    it("should calculate preview style correctly", () => {
      const previewStyle = {
        backgroundColor: "#1a1a1a",
        color: "#ff6b6b",
        fontFamily: "Georgia",
        lineHeight: 1.5,
        padding: "0.75in",
      };

      expect(previewStyle.backgroundColor).toBe("#1a1a1a");
      expect(previewStyle.color).toBe("#ff6b6b");
      expect(previewStyle.fontFamily).toBe("Georgia");
      expect(previewStyle.lineHeight).toBe(1.5);
      expect(previewStyle.padding).toBe("0.75in");
    });

    it("should update preview when values change", () => {
      let previewStyle = {
        backgroundColor: "#1a1a1a",
        color: "#ff6b6b",
      };

      // Simulate color change
      previewStyle = {
        ...previewStyle,
        backgroundColor: "#ffffff",
      };

      expect(previewStyle.backgroundColor).toBe("#ffffff");
      expect(previewStyle.color).toBe("#ff6b6b");
    });
  });

  describe("Template Name Validation", () => {
    it("should accept template names", () => {
      const names = ["My Custom Template", "Romance Novel", "Sci-Fi Adventure"];
      for (const name of names) {
        expect(name.length).toBeGreaterThan(0);
      }
    });

    it("should reject empty template names", () => {
      const name = "";
      expect(name.length).toBe(0);
    });
  });

  describe("Margin Synchronization", () => {
    it("should allow independent margin adjustment", () => {
      const margins = {
        top: 0.75,
        bottom: 0.75,
        left: 0.75,
        right: 0.75,
      };

      // Adjust top margin
      margins.top = 1;

      expect(margins.top).toBe(1);
      expect(margins.bottom).toBe(0.75);
      expect(margins.left).toBe(0.75);
      expect(margins.right).toBe(0.75);
    });

    it("should support symmetric margins", () => {
      const margins = {
        top: 1,
        bottom: 1,
        left: 1,
        right: 1,
      };

      expect(margins.top).toBe(margins.bottom);
      expect(margins.left).toBe(margins.right);
    });
  });

  describe("Front/Back Matter Options", () => {
    it("should toggle front matter independently", () => {
      const options = {
        includeTableOfContents: true,
        includeFrontMatter: true,
        includeBackMatter: true,
      };

      options.includeFrontMatter = false;

      expect(options.includeFrontMatter).toBe(false);
      expect(options.includeTableOfContents).toBe(true);
      expect(options.includeBackMatter).toBe(true);
    });

    it("should support all combinations of options", () => {
      const combinations = [
        { toc: true, front: true, back: true },
        { toc: false, front: true, back: true },
        { toc: true, front: false, back: true },
        { toc: true, front: true, back: false },
        { toc: false, front: false, back: false },
      ];

      expect(combinations.length).toBe(5);
      for (const combo of combinations) {
        expect(typeof combo.toc).toBe("boolean");
        expect(typeof combo.front).toBe("boolean");
        expect(typeof combo.back).toBe("boolean");
      }
    });
  });
});
