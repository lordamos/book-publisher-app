import { describe, it, expect } from "vitest";
import {
  isValidISBN10,
  isValidISBN13,
  getKDPPageSpec,
  calculateBookDimensions,
} from "./kdp-export";

describe("KDP Export Service", () => {
  describe("ISBN Validation", () => {
    it("should validate correct ISBN-10", () => {
      // ISBN-10 for "The Pragmatic Programmer"
      expect(isValidISBN10("020161622X")).toBe(true);
    });

    it("should reject invalid ISBN-10", () => {
      expect(isValidISBN10("0201616221")).toBe(false);
    });

    it("should validate correct ISBN-13", () => {
      // ISBN-13 example
      expect(isValidISBN13("9780201616224")).toBe(true);
    });

    it("should reject invalid ISBN-13", () => {
      expect(isValidISBN13("9780201616225")).toBe(false);
    });
  });

  describe("Page Specifications", () => {
    it("should return correct spec for 6x9", () => {
      const spec = getKDPPageSpec("6x9");
      expect(spec.trimSize).toBe("6x9");
      expect(spec.bleed).toBe(0.125);
      expect(spec.margins).toEqual({
        top: 0.75,
        bottom: 0.75,
        left: 0.75,
        right: 0.75,
      });
    });

    it("should return correct spec for 5x8", () => {
      const spec = getKDPPageSpec("5x8");
      expect(spec.trimSize).toBe("5x8");
      expect(spec.bleed).toBe(0.125);
      expect(spec.margins).toEqual({
        top: 0.5,
        bottom: 0.5,
        left: 0.5,
        right: 0.5,
      });
    });

    it("should return default spec for unknown size", () => {
      const spec = getKDPPageSpec("unknown");
      expect(spec.trimSize).toBe("6x9");
    });
  });

  describe("Book Dimensions", () => {
    it("should calculate correct dimensions for 6x9", () => {
      const spec = getKDPPageSpec("6x9");
      const dims = calculateBookDimensions(spec);

      expect(dims.width).toBe(6 * 72); // 432 points
      expect(dims.height).toBe(9 * 72); // 648 points
      expect(dims.bleed).toBe(0.125 * 72); // 9 points
      expect(dims.margins.top).toBe(0.75 * 72); // 54 points
    });

    it("should calculate correct dimensions for 5x8", () => {
      const spec = getKDPPageSpec("5x8");
      const dims = calculateBookDimensions(spec);

      expect(dims.width).toBe(5 * 72); // 360 points
      expect(dims.height).toBe(8 * 72); // 576 points
    });
  });
});

// Helper functions for testing (exported from kdp-export.ts)
function isValidISBN10(isbn: string): boolean {
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(isbn[i], 10) * (10 - i);
  }

  const checkDigit = (11 - (sum % 11)) % 11;
  const check = checkDigit === 10 ? "X" : checkDigit.toString();

  return check === isbn[9];
}

function isValidISBN13(isbn: string): boolean {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(isbn[i], 10) * (i % 2 === 0 ? 1 : 3);
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(isbn[12], 10);
}
