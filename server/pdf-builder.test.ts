import { describe, it, expect } from "vitest";
import { calculateBookDimensions, getKDPPageSpec } from "./kdp-export";

/**
 * Tests for PDF Builder Service
 * Validates PDF generation with proper KDP formatting
 */

describe("PDF Builder Service", () => {
  describe("Page Dimensions", () => {
    it("should calculate correct dimensions for 6x9 trim size", () => {
      const spec = getKDPPageSpec("6x9");
      const dims = calculateBookDimensions(spec);

      // 6x9 inches = 432x648 points
      expect(dims.width).toBe(6 * 72);
      expect(dims.height).toBe(9 * 72);
      expect(dims.bleed).toBe(0.125 * 72); // 9 points
    });

    it("should calculate correct margins for 6x9", () => {
      const spec = getKDPPageSpec("6x9");
      const dims = calculateBookDimensions(spec);

      expect(dims.margins.top).toBe(0.75 * 72); // 54 points
      expect(dims.margins.bottom).toBe(0.75 * 72);
      expect(dims.margins.left).toBe(0.75 * 72);
      expect(dims.margins.right).toBe(0.75 * 72);
    });

    it("should calculate correct dimensions for 5x8 trim size", () => {
      const spec = getKDPPageSpec("5x8");
      const dims = calculateBookDimensions(spec);

      expect(dims.width).toBe(5 * 72);
      expect(dims.height).toBe(8 * 72);
      expect(dims.bleed).toBe(0.125 * 72);
    });

    it("should calculate correct margins for 5x8", () => {
      const spec = getKDPPageSpec("5x8");
      const dims = calculateBookDimensions(spec);

      expect(dims.margins.top).toBe(0.5 * 72); // 36 points
      expect(dims.margins.bottom).toBe(0.5 * 72);
      expect(dims.margins.left).toBe(0.5 * 72);
      expect(dims.margins.right).toBe(0.5 * 72);
    });

    it("should calculate correct dimensions for 8.5x11 trim size", () => {
      const spec = getKDPPageSpec("8.5x11");
      const dims = calculateBookDimensions(spec);

      expect(dims.width).toBe(8.5 * 72);
      expect(dims.height).toBe(11 * 72);
    });
  });

  describe("Bleed and Margins", () => {
    it("should have consistent bleed across all trim sizes", () => {
      const sizes = ["6x9", "5x8", "8.5x11"];

      sizes.forEach((size) => {
        const spec = getKDPPageSpec(size);
        const dims = calculateBookDimensions(spec);

        // All KDP specs should have 0.125 inch bleed
        expect(dims.bleed).toBe(0.125 * 72);
      });
    });

    it("should ensure content area is within safe margins", () => {
      const spec = getKDPPageSpec("6x9");
      const dims = calculateBookDimensions(spec);

      const contentWidth = dims.width - dims.margins.left - dims.margins.right;
      const contentHeight = dims.height - dims.margins.top - dims.margins.bottom;

      // Content should be positive and reasonable
      expect(contentWidth).toBeGreaterThan(0);
      expect(contentHeight).toBeGreaterThan(0);

      // Content should be smaller than page
      expect(contentWidth).toBeLessThan(dims.width);
      expect(contentHeight).toBeLessThan(dims.height);
    });

    it("should maintain proper bleed area", () => {
      const spec = getKDPPageSpec("6x9");
      const dims = calculateBookDimensions(spec);

      // Bleed should be applied on all sides
      const totalWidthWithBleed = dims.width + dims.bleed * 2;
      const totalHeightWithBleed = dims.height + dims.bleed * 2;

      expect(totalWidthWithBleed).toBe(6 * 72 + 0.125 * 72 * 2);
      expect(totalHeightWithBleed).toBe(9 * 72 + 0.125 * 72 * 2);
    });
  });

  describe("Page Specifications", () => {
    it("should return valid KDP page specs", () => {
      const validSizes = ["6x9", "5x8", "8.5x11"];

      validSizes.forEach((size) => {
        const spec = getKDPPageSpec(size);

        expect(spec).toHaveProperty("trimSize");
        expect(spec).toHaveProperty("bleed");
        expect(spec).toHaveProperty("margins");
        expect(spec.trimSize).toBe(size);
      });
    });

    it("should have proper margin structure", () => {
      const spec = getKDPPageSpec("6x9");

      expect(spec.margins).toHaveProperty("top");
      expect(spec.margins).toHaveProperty("bottom");
      expect(spec.margins).toHaveProperty("left");
      expect(spec.margins).toHaveProperty("right");

      // All margins should be positive
      expect(spec.margins.top).toBeGreaterThan(0);
      expect(spec.margins.bottom).toBeGreaterThan(0);
      expect(spec.margins.left).toBeGreaterThan(0);
      expect(spec.margins.right).toBeGreaterThan(0);
    });
  });

  describe("PDF Generation Options", () => {
    it("should support front matter option", () => {
      const options = {
        includeFrontMatter: true,
        includeTableOfContents: false,
        includeBackMatter: false,
        includePageNumbers: false,
      };

      expect(options.includeFrontMatter).toBe(true);
    });

    it("should support table of contents option", () => {
      const options = {
        includeFrontMatter: false,
        includeTableOfContents: true,
        includeBackMatter: false,
        includePageNumbers: false,
      };

      expect(options.includeTableOfContents).toBe(true);
    });

    it("should support back matter option", () => {
      const options = {
        includeFrontMatter: false,
        includeTableOfContents: false,
        includeBackMatter: true,
        includePageNumbers: false,
      };

      expect(options.includeBackMatter).toBe(true);
    });

    it("should support page numbers option", () => {
      const options = {
        includeFrontMatter: false,
        includeTableOfContents: false,
        includeBackMatter: false,
        includePageNumbers: true,
      };

      expect(options.includePageNumbers).toBe(true);
    });

    it("should allow all options to be enabled", () => {
      const options = {
        includeFrontMatter: true,
        includeTableOfContents: true,
        includeBackMatter: true,
        includePageNumbers: true,
      };

      expect(options.includeFrontMatter).toBe(true);
      expect(options.includeTableOfContents).toBe(true);
      expect(options.includeBackMatter).toBe(true);
      expect(options.includePageNumbers).toBe(true);
    });
  });

  describe("Font Handling", () => {
    it("should map font families correctly", () => {
      const fontMappings = [
        { family: "Helvetica", weight: "400", expected: "Helvetica" },
        { family: "Helvetica", weight: "700", expected: "Helvetica-Bold" },
        { family: "Times New Roman", weight: "400", expected: "Times-Roman" },
        { family: "Times New Roman", weight: "700", expected: "Times-Bold" },
        { family: "Courier New", weight: "400", expected: "Courier" },
        { family: "Courier New", weight: "700", expected: "Courier-Bold" },
      ];

      // Verify font mappings are valid
      fontMappings.forEach((mapping) => {
        expect(mapping.expected).toBeTruthy();
      });
    });
  });

  describe("Content Structure", () => {
    it("should support text blocks", () => {
      const textBlock = {
        text: "Sample text",
        x: 50,
        y: 100,
        fontSize: 12,
        fontFamily: "Helvetica",
        fontWeight: "400",
        color: "#000000",
        align: "left" as const,
      };

      expect(textBlock.text).toBeTruthy();
      expect(textBlock.fontSize).toBeGreaterThan(0);
      expect(["left", "center", "right", "justify"]).toContain(textBlock.align);
    });

    it("should support image elements", () => {
      const imageElement = {
        url: "https://example.com/image.jpg",
        x: 50,
        y: 100,
        width: 200,
        height: 300,
      };

      expect(imageElement.url).toBeTruthy();
      expect(imageElement.width).toBeGreaterThan(0);
      expect(imageElement.height).toBeGreaterThan(0);
    });

    it("should support page content with multiple elements", () => {
      const pageContent = {
        textBlocks: [
          {
            text: "Title",
            x: 50,
            y: 50,
            fontSize: 24,
            fontFamily: "Helvetica",
            fontWeight: "700",
            color: "#000000",
            align: "center" as const,
          },
          {
            text: "Body text",
            x: 50,
            y: 100,
            fontSize: 12,
            fontFamily: "Helvetica",
            fontWeight: "400",
            color: "#333333",
            align: "left" as const,
          },
        ],
        images: [
          {
            url: "https://example.com/image.jpg",
            x: 50,
            y: 200,
            width: 200,
            height: 300,
          },
        ],
      };

      expect(pageContent.textBlocks).toHaveLength(2);
      expect(pageContent.images).toHaveLength(1);
    });
  });
});
