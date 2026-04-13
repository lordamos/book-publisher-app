import { describe, it, expect } from "vitest";
import {
  validatePDFOptions,
  sanitizeFilename,
  generatePDFFilename,
  estimatePDFSize,
  formatFileSize,
  getEstimatedExportTime,
  validatePageRange,
  getPageRange,
  calculatePageDimensions,
  mmToPixels,
  pixelsToMm,
} from "../client/src/lib/pdfExport";

describe("PDF Export Utilities", () => {
  describe("validatePDFOptions", () => {
    it("should validate correct PDF options", () => {
      const result = validatePDFOptions({
        filename: "book.pdf",
        pageRange: "all",
        marginTop: 20,
        marginBottom: 20,
        marginLeft: 20,
        marginRight: 20,
        quality: "high",
        includeMetadata: true,
        includePageNumbers: true,
        paperSize: "letter",
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject empty filename", () => {
      const result = validatePDFOptions({
        filename: "",
        pageRange: "all",
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Filename is required");
    });

    it("should reject filename without .pdf extension", () => {
      const result = validatePDFOptions({
        filename: "book.txt",
        pageRange: "all",
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Filename must end with .pdf");
    });

    it("should reject negative margins", () => {
      const result = validatePDFOptions({
        filename: "book.pdf",
        pageRange: "all",
        marginTop: -10,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Top margin cannot be negative");
    });

    it("should reject invalid page range", () => {
      const result = validatePDFOptions({
        filename: "book.pdf",
        pageRange: "range",
        startPage: 5,
        endPage: 2,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Start page must be less than or equal to end page");
    });
  });

  describe("sanitizeFilename", () => {
    it("should remove invalid characters", () => {
      const result = sanitizeFilename('book<>:"\\|?.pdf');
      expect(result.endsWith(".pdf")).toBe(true);
      expect(result).not.toContain("<");
      expect(result).not.toContain(">");
    });

    it("should add .pdf extension if missing", () => {
      const result = sanitizeFilename("mybook");
      expect(result.endsWith(".pdf")).toBe(true);
    });

    it("should trim whitespace", () => {
      const result = sanitizeFilename("  my book  ");
      expect(result.endsWith(".pdf")).toBe(true);
      expect(result.includes("my book")).toBe(true);
    });

    it("should limit filename length", () => {
      const longName = "a".repeat(300);
      const result = sanitizeFilename(longName);
      expect(result.length).toBeLessThanOrEqual(255);
      expect(result.endsWith(".pdf")).toBe(true);
    });
  });

  describe("generatePDFFilename", () => {
    it("should generate filename with timestamp", () => {
      const result = generatePDFFilename("My Book");
      expect(result).toMatch(/My Book.*\d{4}-\d{2}-\d{2}\.pdf/);
      expect(result.endsWith(".pdf")).toBe(true);
    });

    it("should sanitize book title", () => {
      const result = generatePDFFilename('Book<>:"');
      expect(result.endsWith(".pdf")).toBe(true);
    });

    it("should handle .pdf in title", () => {
      const result = generatePDFFilename("My Book.pdf");
      expect(result.endsWith(".pdf")).toBe(true);
      expect(result.match(/\.pdf/g)?.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("estimatePDFSize", () => {
    it("should estimate low quality PDF size", () => {
      const size = estimatePDFSize(10, "low");
      expect(size).toBeGreaterThan(0);
      expect(size).toBeLessThan(1000000);
    });

    it("should estimate medium quality PDF size", () => {
      const size = estimatePDFSize(10, "medium");
      expect(size).toBeGreaterThan(estimatePDFSize(10, "low"));
    });

    it("should estimate high quality PDF size", () => {
      const size = estimatePDFSize(10, "high");
      expect(size).toBeGreaterThan(estimatePDFSize(10, "medium"));
    });

    it("should scale with page count", () => {
      const size10 = estimatePDFSize(10, "medium");
      const size20 = estimatePDFSize(20, "medium");
      expect(size20).toBeGreaterThan(size10);
    });
  });

  describe("formatFileSize", () => {
    it("should format bytes", () => {
      expect(formatFileSize(512)).toContain("Bytes");
    });

    it("should format kilobytes", () => {
      expect(formatFileSize(5120)).toContain("KB");
    });

    it("should format megabytes", () => {
      expect(formatFileSize(5242880)).toContain("MB");
    });

    it("should handle zero bytes", () => {
      expect(formatFileSize(0)).toBe("0 Bytes");
    });
  });

  describe("getEstimatedExportTime", () => {
    it("should estimate export time for low quality", () => {
      const time = getEstimatedExportTime(10, "low");
      expect(time).toBeGreaterThan(0);
      expect(time).toBeLessThan(10);
    });

    it("should estimate export time for high quality", () => {
      const time = getEstimatedExportTime(10, "high");
      expect(time).toBeGreaterThan(getEstimatedExportTime(10, "low"));
    });

    it("should scale with page count", () => {
      const time10 = getEstimatedExportTime(10, "medium");
      const time20 = getEstimatedExportTime(20, "medium");
      expect(time20).toBeGreaterThan(time10);
    });
  });

  describe("validatePageRange", () => {
    it("should validate correct page range", () => {
      const result = validatePageRange(1, 10, 20);
      expect(result.valid).toBe(true);
    });

    it("should reject start page less than 1", () => {
      const result = validatePageRange(0, 10, 20);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject end page exceeding total", () => {
      const result = validatePageRange(1, 25, 20);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject start page greater than end page", () => {
      const result = validatePageRange(15, 10, 20);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("getPageRange", () => {
    it("should return array of page numbers", () => {
      const result = getPageRange(1, 5);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it("should handle single page", () => {
      const result = getPageRange(3, 3);
      expect(result).toEqual([3]);
    });
  });

  describe("calculatePageDimensions", () => {
    it("should calculate letter dimensions", () => {
      const result = calculatePageDimensions("letter", {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
      });
      expect(result.width).toBeCloseTo(215.9, 1);
      expect(result.height).toBeCloseTo(279.4, 1);
      expect(result.contentWidth).toBeCloseTo(175.9, 1);
      expect(result.contentHeight).toBeCloseTo(239.4, 1);
    });

    it("should calculate A4 dimensions", () => {
      const result = calculatePageDimensions("a4", {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
      });
      expect(result.width).toBeCloseTo(210, 1);
      expect(result.height).toBeCloseTo(297, 1);
    });

    it("should calculate A5 dimensions", () => {
      const result = calculatePageDimensions("a5", {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
      });
      expect(result.width).toBeCloseTo(148, 1);
      expect(result.height).toBeCloseTo(210, 1);
    });
  });

  describe("mmToPixels", () => {
    it("should convert mm to pixels at default DPI", () => {
      const result = mmToPixels(25.4);
      expect(result).toBeCloseTo(96, 1);
    });

    it("should convert mm to pixels at custom DPI", () => {
      const result = mmToPixels(25.4, 72);
      expect(result).toBeCloseTo(72, 1);
    });
  });

  describe("pixelsToMm", () => {
    it("should convert pixels to mm at default DPI", () => {
      const result = pixelsToMm(96);
      expect(result).toBeCloseTo(25.4, 0);
    });

    it("should convert pixels to mm at custom DPI", () => {
      const result = pixelsToMm(72, 72);
      expect(result).toBeCloseTo(25.4, 0);
    });
  });
});
