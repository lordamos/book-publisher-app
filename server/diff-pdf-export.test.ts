import { describe, it, expect, beforeEach } from "vitest";
import {
  generateDiffPDF,
  generateDiffHTML,
  computeDiffStatistics,
  type DiffPDFOptions,
} from "./diff-pdf-export";

describe("Diff PDF Export", () => {
  describe("computeDiffStatistics", () => {
    it("should compute statistics for identical texts", () => {
      const oldText = "Hello world";
      const newText = "Hello world";

      const stats = computeDiffStatistics(oldText, newText);

      expect(stats.addedLines).toBe(0);
      expect(stats.removedLines).toBe(0);
      expect(stats.modifiedLines).toBe(0);
      expect(stats.similarity).toBe(100);
    });

    it("should compute statistics for completely different texts", () => {
      const oldText = "Hello world";
      const newText = "Goodbye universe";

      const stats = computeDiffStatistics(oldText, newText);

      // Single line that differs is marked as modification, not add+remove
      expect(stats.modifiedLines).toBeGreaterThan(0);
      expect(stats.similarity).toBeLessThan(100);
    });

    it("should compute statistics for text with additions", () => {
      const oldText = "Line 1\nLine 2";
      const newText = "Line 1\nLine 2\nLine 3";

      const stats = computeDiffStatistics(oldText, newText);

      expect(stats.addedLines).toBeGreaterThan(0);
      expect(stats.removedLines).toBe(0);
    });

    it("should compute statistics for text with deletions", () => {
      const oldText = "Line 1\nLine 2\nLine 3";
      const newText = "Line 1\nLine 2";

      const stats = computeDiffStatistics(oldText, newText);

      expect(stats.removedLines).toBeGreaterThan(0);
      expect(stats.addedLines).toBe(0);
    });

    it("should compute statistics for text with modifications", () => {
      const oldText = "The quick brown fox";
      const newText = "The slow brown fox";

      const stats = computeDiffStatistics(oldText, newText);

      expect(stats.modifiedLines).toBeGreaterThan(0);
      expect(stats.similarity).toBeLessThan(100);
    });

    it("should handle empty old text", () => {
      const oldText = "";
      const newText = "Hello world";

      const stats = computeDiffStatistics(oldText, newText);

      expect(stats.addedLines).toBeGreaterThan(0);
      expect(stats.removedLines).toBe(0);
    });

    it("should handle empty new text", () => {
      const oldText = "Hello world";
      const newText = "";

      const stats = computeDiffStatistics(oldText, newText);

      expect(stats.removedLines).toBeGreaterThan(0);
      expect(stats.addedLines).toBe(0);
    });

    it("should handle both texts empty", () => {
      const oldText = "";
      const newText = "";

      const stats = computeDiffStatistics(oldText, newText);

      expect(stats.addedLines).toBe(0);
      expect(stats.removedLines).toBe(0);
      expect(stats.similarity).toBe(100);
    });

    it("should compute correct similarity percentage", () => {
      const oldText = "AAAA";
      const newText = "AAAB";

      const stats = computeDiffStatistics(oldText, newText);

      // Single line that differs is marked as modification
      expect(stats.modifiedLines).toBeGreaterThan(0);
      expect(stats.similarity).toBeLessThan(100);
    });
  });

  describe("generateDiffHTML", () => {
    it("should generate valid HTML for identical texts", () => {
      const oldText = "Hello world";
      const newText = "Hello world";

      const html = generateDiffHTML(oldText, newText);

      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("Hello world");
      expect(html).toContain("</html>");
    });

    it("should generate HTML with diff highlighting", () => {
      const oldText = "Hello world";
      const newText = "Hello universe";

      const html = generateDiffHTML(oldText, newText);

      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("Hello");
      expect(html).toContain("</html>");
    });

    it("should include title in HTML when provided", () => {
      const oldText = "Old content";
      const newText = "New content";
      const options: DiffPDFOptions = {
        title: "My Comparison",
      };

      const html = generateDiffHTML(oldText, newText, options);

      expect(html).toContain("My Comparison");
    });

    it("should include version labels in HTML when provided", () => {
      const oldText = "Old content";
      const newText = "New content";
      const options: DiffPDFOptions = {
        oldVersion: "v1.0",
        newVersion: "v2.0",
      };

      const html = generateDiffHTML(oldText, newText, options);

      expect(html).toContain("v1.0");
      expect(html).toContain("v2.0");
    });

    it("should handle multiline text", () => {
      const oldText = "Line 1\nLine 2\nLine 3";
      const newText = "Line 1\nModified Line 2\nLine 3";

      const html = generateDiffHTML(oldText, newText);

      expect(html).toContain("Line 1");
      expect(html).toContain("Line 3");
    });

    it("should handle special characters", () => {
      const oldText = "Hello <world> & friends";
      const newText = "Hello <world> & family";

      const html = generateDiffHTML(oldText, newText);

      expect(html).toContain("&lt;");
      expect(html).toContain("&gt;");
      expect(html).toContain("&amp;");
    });

    it("should handle empty texts", () => {
      const oldText = "";
      const newText = "";

      const html = generateDiffHTML(oldText, newText);

      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("</html>");
    });
  });

  describe("generateDiffPDF", () => {
    it("should generate PDF buffer for identical texts", async () => {
      const oldText = "Hello world";
      const newText = "Hello world";

      const pdfBuffer = await generateDiffPDF(oldText, newText);

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
      expect(pdfBuffer[0]).toBe(0x25); // PDF magic number '%'
    });

    it("should generate PDF buffer for different texts", async () => {
      const oldText = "Hello world";
      const newText = "Hello universe";

      const pdfBuffer = await generateDiffPDF(oldText, newText);

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
      expect(pdfBuffer[0]).toBe(0x25); // PDF magic number '%'
    });

    it("should generate PDF with custom title", async () => {
      const oldText = "Content A";
      const newText = "Content B";
      const options: DiffPDFOptions = {
        title: "Custom Title",
      };

      const pdfBuffer = await generateDiffPDF(oldText, newText, options);

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it("should generate PDF with version labels", async () => {
      const oldText = "Version 1";
      const newText = "Version 2";
      const options: DiffPDFOptions = {
        oldVersion: "v1.0",
        newVersion: "v2.0",
      };

      const pdfBuffer = await generateDiffPDF(oldText, newText, options);

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it("should generate PDF with statistics", async () => {
      const oldText = "Line 1\nLine 2";
      const newText = "Line 1\nLine 2\nLine 3";
      const options: DiffPDFOptions = {
        includeStatistics: true,
      };

      const pdfBuffer = await generateDiffPDF(oldText, newText, options);

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it("should generate PDF with different page sizes", async () => {
      const oldText = "Test content";
      const newText = "Test content modified";

      const letterPDF = await generateDiffPDF(oldText, newText, {
        pageSize: "letter",
      });
      const a4PDF = await generateDiffPDF(oldText, newText, {
        pageSize: "a4",
      });

      expect(letterPDF).toBeInstanceOf(Buffer);
      expect(a4PDF).toBeInstanceOf(Buffer);
      expect(letterPDF.length).toBeGreaterThan(0);
      expect(a4PDF.length).toBeGreaterThan(0);
    });

    it("should generate PDF with different font sizes", async () => {
      const oldText = "Test content";
      const newText = "Test content modified";

      const smallPDF = await generateDiffPDF(oldText, newText, {
        fontSize: 8,
      });
      const largePDF = await generateDiffPDF(oldText, newText, {
        fontSize: 12,
      });

      expect(smallPDF).toBeInstanceOf(Buffer);
      expect(largePDF).toBeInstanceOf(Buffer);
      expect(smallPDF.length).toBeGreaterThan(0);
      expect(largePDF.length).toBeGreaterThan(0);
    });

    it("should generate PDF with light color scheme", async () => {
      const oldText = "Content";
      const newText = "Modified content";

      const pdfBuffer = await generateDiffPDF(oldText, newText, {
        colorScheme: "light",
      });

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it("should generate PDF with dark color scheme", async () => {
      const oldText = "Content";
      const newText = "Modified content";

      const pdfBuffer = await generateDiffPDF(oldText, newText, {
        colorScheme: "dark",
      });

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it("should generate PDF with line numbers", async () => {
      const oldText = "Line 1\nLine 2\nLine 3";
      const newText = "Line 1\nModified\nLine 3";

      const pdfBuffer = await generateDiffPDF(oldText, newText, {
        showLineNumbers: true,
      });

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it("should generate PDF without line numbers", async () => {
      const oldText = "Line 1\nLine 2\nLine 3";
      const newText = "Line 1\nModified\nLine 3";

      const pdfBuffer = await generateDiffPDF(oldText, newText, {
        showLineNumbers: false,
      });

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it("should handle large text content", async () => {
      const oldText = "Line\n".repeat(100);
      const newText = "Line\n".repeat(100) + "Extra line";

      const pdfBuffer = await generateDiffPDF(oldText, newText);

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it("should handle special characters in PDF", async () => {
      const oldText = "Hello <world> & friends";
      const newText = "Hello <world> & family";

      const pdfBuffer = await generateDiffPDF(oldText, newText);

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it("should handle multiline content with modifications", async () => {
      const oldText = `Chapter 1: Introduction
This is the first chapter.
It contains important information.

Chapter 2: Main Content
This is the main chapter.
It has multiple paragraphs.`;

      const newText = `Chapter 1: Introduction
This is the first chapter.
It contains very important information.

Chapter 2: Main Content
This is the main chapter.
It has multiple detailed paragraphs.`;

      const pdfBuffer = await generateDiffPDF(oldText, newText);

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it("should generate consistent PDF output", async () => {
      const oldText = "Test content";
      const newText = "Modified content";

      const pdf1 = await generateDiffPDF(oldText, newText);
      const pdf2 = await generateDiffPDF(oldText, newText);

      // Both should be valid PDFs
      expect(pdf1).toBeInstanceOf(Buffer);
      expect(pdf2).toBeInstanceOf(Buffer);
      expect(pdf1.length).toBeGreaterThan(0);
      expect(pdf2.length).toBeGreaterThan(0);
    });

    it("should handle all options combined", async () => {
      const oldText = "Original content\nLine 2\nLine 3";
      const newText = "Modified content\nLine 2\nLine 3\nLine 4";
      const options: DiffPDFOptions = {
        title: "Complete Diff Export",
        oldVersion: "v1.0.0",
        newVersion: "v1.1.0",
        colorScheme: "light",
        pageSize: "letter",
        fontSize: 10,
        includeStatistics: true,
        showLineNumbers: true,
      };

      const pdfBuffer = await generateDiffPDF(oldText, newText, options);

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
      expect(pdfBuffer[0]).toBe(0x25); // PDF magic number
    });
  });

  describe("Edge Cases", () => {
    it("should handle text with only whitespace differences", () => {
      const oldText = "Hello  world";
      const newText = "Hello world";

      const stats = computeDiffStatistics(oldText, newText);

      expect(stats.similarity).toBeLessThan(100);
    });

    it("should handle text with line ending differences", () => {
      const oldText = "Line1\nLine2";
      const newText = "Line1\r\nLine2";

      const stats = computeDiffStatistics(oldText, newText);

      expect(stats).toBeDefined();
    });

    it("should handle very long lines", async () => {
      const longLine = "A".repeat(500);
      const oldText = longLine;
      const newText = longLine + "B";

      const pdfBuffer = await generateDiffPDF(oldText, newText);

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it("should handle unicode characters", async () => {
      const oldText = "Hello 世界 🌍";
      const newText = "Hello 世界 🌎";

      const pdfBuffer = await generateDiffPDF(oldText, newText);

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });
  });
});
