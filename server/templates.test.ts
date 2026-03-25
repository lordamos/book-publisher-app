import { describe, it, expect } from "vitest";
import { BOOK_TEMPLATES, GENRE_LIST } from "./templates-data";

/**
 * Tests for Template Library Feature
 * Validates template configurations and genre support
 */

describe("Template Library", () => {
  describe("Template Data Structure", () => {
    it("should have templates for all genres", () => {
      expect(Object.keys(BOOK_TEMPLATES).length).toBeGreaterThan(0);
    });

    it("should have required properties for each template", () => {
      for (const [key, template] of Object.entries(BOOK_TEMPLATES)) {
        expect(template).toHaveProperty("name");
        expect(template).toHaveProperty("genre");
        expect(template).toHaveProperty("description");
        expect(template).toHaveProperty("coverColor");
        expect(template).toHaveProperty("accentColor");
        expect(template).toHaveProperty("bodyFont");
        expect(template).toHaveProperty("headingFont");
        expect(template).toHaveProperty("bodyFontSize");
        expect(template).toHaveProperty("headingFontSize");
        expect(template).toHaveProperty("lineHeight");
        expect(template).toHaveProperty("marginTop");
        expect(template).toHaveProperty("marginBottom");
        expect(template).toHaveProperty("marginLeft");
        expect(template).toHaveProperty("marginRight");
        expect(template).toHaveProperty("chapterStyle");
        expect(template).toHaveProperty("includeTableOfContents");
        expect(template).toHaveProperty("includeFrontMatter");
        expect(template).toHaveProperty("includeBackMatter");
      }
    });
  });

  describe("Genre Support", () => {
    it("should include major genres", () => {
      const genres = Object.keys(BOOK_TEMPLATES);
      expect(genres).toContain("romance");
      expect(genres).toContain("mystery");
      expect(genres).toContain("scifi");
      expect(genres).toContain("fantasy");
      expect(genres).toContain("nonfiction");
      expect(genres).toContain("memoir");
      expect(genres).toContain("youngadult");
      expect(genres).toContain("horror");
      expect(genres).toContain("poetry");
      expect(genres).toContain("children");
    });

    it("should have genre list", () => {
      expect(GENRE_LIST.length).toBeGreaterThan(0);
      expect(GENRE_LIST[0]).toHaveProperty("id");
      expect(GENRE_LIST[0]).toHaveProperty("name");
      expect(GENRE_LIST[0]).toHaveProperty("genre");
      expect(GENRE_LIST[0]).toHaveProperty("description");
    });
  });

  describe("Color Configuration", () => {
    it("should have valid hex colors", () => {
      const hexColorRegex = /^#[0-9A-F]{6}$/i;

      for (const [key, template] of Object.entries(BOOK_TEMPLATES)) {
        expect(template.coverColor).toMatch(hexColorRegex);
        expect(template.accentColor).toMatch(hexColorRegex);
      }
    });

    it("should have different colors for cover and accent", () => {
      for (const [key, template] of Object.entries(BOOK_TEMPLATES)) {
        expect(template.coverColor).not.toBe(template.accentColor);
      }
    });
  });

  describe("Typography Configuration", () => {
    it("should have valid font sizes", () => {
      for (const [key, template] of Object.entries(BOOK_TEMPLATES)) {
        expect(template.bodyFontSize).toBeGreaterThanOrEqual(8);
        expect(template.bodyFontSize).toBeLessThanOrEqual(20);
        expect(template.headingFontSize).toBeGreaterThanOrEqual(16);
        expect(template.headingFontSize).toBeLessThanOrEqual(48);
        expect(template.headingFontSize).toBeGreaterThan(template.bodyFontSize);
      }
    });

    it("should have valid line heights", () => {
      for (const [key, template] of Object.entries(BOOK_TEMPLATES)) {
        const lineHeight = parseFloat(template.lineHeight);
        expect(lineHeight).toBeGreaterThanOrEqual(1);
        expect(lineHeight).toBeLessThanOrEqual(2);
      }
    });

    it("should have font names", () => {
      for (const [key, template] of Object.entries(BOOK_TEMPLATES)) {
        expect(template.bodyFont.length).toBeGreaterThan(0);
        expect(template.headingFont.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Margin Configuration", () => {
    it("should have valid margins", () => {
      for (const [key, template] of Object.entries(BOOK_TEMPLATES)) {
        const margins = [
          template.marginTop,
          template.marginBottom,
          template.marginLeft,
          template.marginRight,
        ];

        for (const margin of margins) {
          const value = parseFloat(margin);
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(2);
        }
      }
    });
  });

  describe("Chapter Style", () => {
    it("should have valid chapter styles", () => {
      const validStyles = ["numbered", "titled", "decorated"];

      for (const [key, template] of Object.entries(BOOK_TEMPLATES)) {
        expect(validStyles).toContain(template.chapterStyle);
      }
    });
  });

  describe("Front/Back Matter Options", () => {
    it("should have valid boolean flags", () => {
      for (const [key, template] of Object.entries(BOOK_TEMPLATES)) {
        expect(typeof template.includeTableOfContents).toBe("boolean");
        expect(typeof template.includeFrontMatter).toBe("boolean");
        expect(typeof template.includeBackMatter).toBe("boolean");
      }
    });

    it("should have sensible defaults", () => {
      // Most templates should include front matter
      const withFrontMatter = Object.values(BOOK_TEMPLATES).filter(
        (t) => t.includeFrontMatter
      ).length;
      expect(withFrontMatter).toBeGreaterThan(5);

      // Poetry might not have TOC
      const poetry = BOOK_TEMPLATES.poetry;
      expect(poetry.includeTableOfContents).toBe(false);

      // Children's books might not have TOC
      const children = BOOK_TEMPLATES.children;
      expect(children.includeTableOfContents).toBe(false);
    });
  });

  describe("Genre-Specific Characteristics", () => {
    it("Romance should have elegant styling", () => {
      const romance = BOOK_TEMPLATES.romance;
      expect(romance.bodyFont).toBe("Georgia");
      expect(romance.chapterStyle).toBe("titled");
      expect(parseFloat(romance.lineHeight)).toBeGreaterThanOrEqual(1.5);
    });

    it("Mystery should have dark colors", () => {
      const mystery = BOOK_TEMPLATES.mystery;
      expect(mystery.coverColor).toBe("#1a1a1a");
      expect(mystery.chapterStyle).toBe("numbered");
    });

    it("Sci-Fi should have modern styling", () => {
      const scifi = BOOK_TEMPLATES.scifi;
      expect(scifi.accentColor).toBe("#00d9ff");
      expect(scifi.bodyFont).toBe("Courier New");
    });

    it("Fantasy should have decorative styling", () => {
      const fantasy = BOOK_TEMPLATES.fantasy;
      expect(fantasy.chapterStyle).toBe("decorated");
      expect(fantasy.accentColor).toBe("#d4af37");
    });

    it("Non-Fiction should be professional", () => {
      const nonfiction = BOOK_TEMPLATES.nonfiction;
      expect(nonfiction.bodyFont).toBe("Helvetica");
      expect(nonfiction.chapterStyle).toBe("numbered");
      expect(nonfiction.coverColor).toBe("#ffffff");
    });

    it("Poetry should have minimal styling", () => {
      const poetry = BOOK_TEMPLATES.poetry;
      expect(poetry.includeTableOfContents).toBe(false);
      expect(parseFloat(poetry.lineHeight)).toBeGreaterThan(1.5);
    });

    it("Children's books should have large fonts", () => {
      const children = BOOK_TEMPLATES.children;
      expect(children.bodyFontSize).toBeGreaterThanOrEqual(14);
      expect(children.headingFontSize).toBeGreaterThanOrEqual(32);
    });
  });

  describe("Template Consistency", () => {
    it("should have consistent property types", () => {
      for (const [key, template] of Object.entries(BOOK_TEMPLATES)) {
        expect(typeof template.name).toBe("string");
        expect(typeof template.genre).toBe("string");
        expect(typeof template.description).toBe("string");
        expect(typeof template.coverColor).toBe("string");
        expect(typeof template.accentColor).toBe("string");
        expect(typeof template.bodyFont).toBe("string");
        expect(typeof template.headingFont).toBe("string");
        expect(typeof template.bodyFontSize).toBe("number");
        expect(typeof template.headingFontSize).toBe("number");
        expect(typeof template.lineHeight).toBe("string");
        expect(typeof template.marginTop).toBe("string");
        expect(typeof template.marginBottom).toBe("string");
        expect(typeof template.marginLeft).toBe("string");
        expect(typeof template.marginRight).toBe("string");
        expect(typeof template.chapterStyle).toBe("string");
        expect(typeof template.includeTableOfContents).toBe("boolean");
        expect(typeof template.includeFrontMatter).toBe("boolean");
        expect(typeof template.includeBackMatter).toBe("boolean");
      }
    });
  });

  describe("Template Count", () => {
    it("should have at least 10 templates", () => {
      expect(Object.keys(BOOK_TEMPLATES).length).toBeGreaterThanOrEqual(10);
    });

    it("should have matching genre list", () => {
      expect(GENRE_LIST.length).toBe(Object.keys(BOOK_TEMPLATES).length);
    });
  });
});
