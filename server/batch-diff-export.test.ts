import { describe, it, expect } from "vitest";
import {
  batchExportDiffReports,
  validateBatchExportOptions,
  calculateBatchExportStats,
  createZipFromPDFs,
  mergePDFs,
  type DiffReport,
  type BatchExportOptions,
} from "./batch-diff-export";

describe("Batch Diff Export", () => {
  describe("validateBatchExportOptions", () => {
    it("should validate correct options", () => {
      const reports: DiffReport[] = [
        {
          id: "1",
          oldText: "Hello",
          newText: "World",
          title: "Test 1",
        },
      ];

      const options: BatchExportOptions = {
        format: "zip",
      };

      const result = validateBatchExportOptions(reports, options);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject empty reports", () => {
      const result = validateBatchExportOptions([], { format: "zip" });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("At least one report is required");
    });

    it("should reject invalid format", () => {
      const reports: DiffReport[] = [
        {
          id: "1",
          oldText: "Hello",
          newText: "World",
          title: "Test",
        },
      ];

      const result = validateBatchExportOptions(reports, {
        format: "invalid" as any,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Format must be 'pdf' or 'zip'");
    });

    it("should reject too many reports", () => {
      const reports = Array(1001)
        .fill(null)
        .map((_, i) => ({
          id: `${i}`,
          oldText: "Hello",
          newText: "World",
          title: `Report ${i}`,
        }));

      const result = validateBatchExportOptions(reports, { format: "zip" });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Maximum 1000 reports allowed per batch export");
    });

    it("should reject invalid font size", () => {
      const reports: DiffReport[] = [
        {
          id: "1",
          oldText: "Hello",
          newText: "World",
          title: "Test",
        },
      ];

      const result = validateBatchExportOptions(reports, {
        format: "pdf",
        fontSize: 20,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Font size must be between 6 and 14");
    });

    it("should reject invalid color scheme", () => {
      const reports: DiffReport[] = [
        {
          id: "1",
          oldText: "Hello",
          newText: "World",
          title: "Test",
        },
      ];

      const result = validateBatchExportOptions(reports, {
        format: "pdf",
        colorScheme: "invalid" as any,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Color scheme must be 'light' or 'dark'");
    });

    it("should reject invalid page size", () => {
      const reports: DiffReport[] = [
        {
          id: "1",
          oldText: "Hello",
          newText: "World",
          title: "Test",
        },
      ];

      const result = validateBatchExportOptions(reports, {
        format: "pdf",
        pageSize: "invalid" as any,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Page size must be 'letter' or 'a4'");
    });

    it("should reject oversized total content", () => {
      const largeText = "A".repeat(60 * 1024 * 1024); // 60MB
      const reports: DiffReport[] = [
        {
          id: "1",
          oldText: largeText,
          newText: largeText,
          title: "Test",
        },
      ];

      const result = validateBatchExportOptions(reports, { format: "zip" });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("exceeds maximum"))).toBe(true);
    });
  });

  describe("calculateBatchExportStats", () => {
    it("should calculate stats for single report", () => {
      const reports: DiffReport[] = [
        {
          id: "1",
          oldText: "Hello world",
          newText: "Hello universe",
          title: "Test",
        },
      ];

      const stats = calculateBatchExportStats(reports);

      expect(stats.totalReports).toBe(1);
      expect(stats.totalSize).toBeGreaterThan(0);
      expect(stats.estimatedPDFSize).toBeGreaterThan(stats.totalSize);
      expect(stats.estimatedZipSize).toBeLessThan(stats.totalSize);
    });

    it("should calculate stats for multiple reports", () => {
      const reports: DiffReport[] = [
        {
          id: "1",
          oldText: "Hello",
          newText: "World",
          title: "Test 1",
        },
        {
          id: "2",
          oldText: "Foo",
          newText: "Bar",
          title: "Test 2",
        },
        {
          id: "3",
          oldText: "Baz",
          newText: "Qux",
          title: "Test 3",
        },
      ];

      const stats = calculateBatchExportStats(reports);

      expect(stats.totalReports).toBe(3);
      expect(stats.totalSize).toBeGreaterThan(0);
    });

    it("should estimate compression ratio", () => {
      const reports: DiffReport[] = [
        {
          id: "1",
          oldText: "A".repeat(1000),
          newText: "B".repeat(1000),
          title: "Test",
        },
      ];

      const stats = calculateBatchExportStats(reports);

      // ZIP should compress highly repetitive content
      expect(stats.estimatedZipSize).toBeLessThan(stats.totalSize * 0.5);
    });
  });

  describe("createZipFromPDFs", () => {
    it("should create zip from PDF buffers", async () => {
      const pdfBuffers = [
        { filename: "report1.pdf", buffer: Buffer.from("PDF1") },
        { filename: "report2.pdf", buffer: Buffer.from("PDF2") },
      ];

      const zipBuffer = await createZipFromPDFs(pdfBuffers);

      expect(zipBuffer).toBeInstanceOf(Buffer);
      expect(zipBuffer.length).toBeGreaterThan(0);
      // ZIP files start with PK signature
      expect(zipBuffer[0]).toBe(0x50); // 'P'
      expect(zipBuffer[1]).toBe(0x4b); // 'K'
    });

    it("should create zip with multiple files", async () => {
      const pdfBuffers = Array(5)
        .fill(null)
        .map((_, i) => ({
          filename: `report${i}.pdf`,
          buffer: Buffer.from(`PDF${i}`),
        }));

      const zipBuffer = await createZipFromPDFs(pdfBuffers);

      expect(zipBuffer).toBeInstanceOf(Buffer);
      expect(zipBuffer.length).toBeGreaterThan(0);
    });

    it("should handle large PDF buffers", async () => {
      const largePDF = Buffer.alloc(1024 * 1024); // 1MB
      largePDF.fill(0x25); // PDF magic number

      const pdfBuffers = [
        { filename: "large.pdf", buffer: largePDF },
      ];

      const zipBuffer = await createZipFromPDFs(pdfBuffers);

      expect(zipBuffer).toBeInstanceOf(Buffer);
      expect(zipBuffer.length).toBeGreaterThan(0);
    });

    it("should sanitize filenames", async () => {
      const pdfBuffers = [
        { filename: "../../evil.pdf", buffer: Buffer.from("PDF") },
        { filename: "report<script>.pdf", buffer: Buffer.from("PDF") },
      ];

      const zipBuffer = await createZipFromPDFs(pdfBuffers);

      expect(zipBuffer).toBeInstanceOf(Buffer);
      expect(zipBuffer.length).toBeGreaterThan(0);
    });
  });

  describe("mergePDFs", () => {
    it("should merge PDF buffers", async () => {
      const pdfBuffers = [
        Buffer.from("%PDF-1.4\n"),
        Buffer.from("%PDF-1.4\n"),
      ];

      const mergedBuffer = await mergePDFs(pdfBuffers);

      expect(mergedBuffer).toBeInstanceOf(Buffer);
      expect(mergedBuffer.length).toBeGreaterThan(0);
      expect(mergedBuffer[0]).toBe(0x25); // PDF magic number
    });

    it("should merge with title", async () => {
      const pdfBuffers = [Buffer.from("%PDF-1.4\n")];

      const mergedBuffer = await mergePDFs(pdfBuffers, {
        title: "Merged Report",
      });

      expect(mergedBuffer).toBeInstanceOf(Buffer);
      expect(mergedBuffer.length).toBeGreaterThan(0);
    });

    it("should merge with table of contents", async () => {
      const pdfBuffers = Array(3)
        .fill(null)
        .map(() => Buffer.from("%PDF-1.4\n"));

      const mergedBuffer = await mergePDFs(pdfBuffers, {
        title: "Merged Report",
        includeTableOfContents: true,
      });

      expect(mergedBuffer).toBeInstanceOf(Buffer);
      expect(mergedBuffer.length).toBeGreaterThan(0);
    });
  });

  describe("batchExportDiffReports", () => {
    it("should export reports as ZIP", async () => {
      const reports: DiffReport[] = [
        {
          id: "1",
          oldText: "Hello world",
          newText: "Hello universe",
          title: "Report 1",
          oldVersion: "v1.0",
          newVersion: "v1.1",
        },
      ];

      const result = await batchExportDiffReports(reports, {
        format: "zip",
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Buffer);
      expect(result.filename).toContain(".zip");
      expect(result.reportCount).toBe(1);
    });

    it("should export reports as PDF", async () => {
      const reports: DiffReport[] = [
        {
          id: "1",
          oldText: "Hello world",
          newText: "Hello universe",
          title: "Report 1",
        },
      ];

      const result = await batchExportDiffReports(reports, {
        format: "pdf",
        mergeIntoSinglePDF: false,
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Buffer);
      expect(result.filename).toContain(".pdf");
    });

    it("should export multiple reports as ZIP", async () => {
      const reports: DiffReport[] = [
        {
          id: "1",
          oldText: "Hello",
          newText: "World",
          title: "Report 1",
        },
        {
          id: "2",
          oldText: "Foo",
          newText: "Bar",
          title: "Report 2",
        },
        {
          id: "3",
          oldText: "Baz",
          newText: "Qux",
          title: "Report 3",
        },
      ];

      const result = await batchExportDiffReports(reports, {
        format: "zip",
      });

      expect(result.success).toBe(true);
      expect(result.reportCount).toBe(3);
    });

    it("should apply color scheme option", async () => {
      const reports: DiffReport[] = [
        {
          id: "1",
          oldText: "Hello",
          newText: "World",
          title: "Report 1",
        },
      ];

      const result = await batchExportDiffReports(reports, {
        format: "zip",
        colorScheme: "dark",
      });

      expect(result.success).toBe(true);
    });

    it("should apply page size option", async () => {
      const reports: DiffReport[] = [
        {
          id: "1",
          oldText: "Hello",
          newText: "World",
          title: "Report 1",
        },
      ];

      const result = await batchExportDiffReports(reports, {
        format: "zip",
        pageSize: "a4",
      });

      expect(result.success).toBe(true);
    });

    it("should apply font size option", async () => {
      const reports: DiffReport[] = [
        {
          id: "1",
          oldText: "Hello",
          newText: "World",
          title: "Report 1",
        },
      ];

      const result = await batchExportDiffReports(reports, {
        format: "zip",
        fontSize: 12,
      });

      expect(result.success).toBe(true);
    });

    it("should include statistics when requested", async () => {
      const reports: DiffReport[] = [
        {
          id: "1",
          oldText: "Hello",
          newText: "World",
          title: "Report 1",
        },
      ];

      const result = await batchExportDiffReports(reports, {
        format: "zip",
        includeStatistics: true,
      });

      expect(result.success).toBe(true);
    });

    it("should include line numbers when requested", async () => {
      const reports: DiffReport[] = [
        {
          id: "1",
          oldText: "Line 1\nLine 2",
          newText: "Line 1\nLine 2 Modified",
          title: "Report 1",
        },
      ];

      const result = await batchExportDiffReports(reports, {
        format: "zip",
        showLineNumbers: true,
      });

      expect(result.success).toBe(true);
    });

    it("should handle empty reports", async () => {
      const result = await batchExportDiffReports([], {
        format: "zip",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("No reports provided");
    });

    it("should handle large batch exports", async () => {
      const reports: DiffReport[] = Array(50)
        .fill(null)
        .map((_, i) => ({
          id: `${i}`,
          oldText: `Content ${i}`,
          newText: `Modified content ${i}`,
          title: `Report ${i}`,
        }));

      const result = await batchExportDiffReports(reports, {
        format: "zip",
      });

      expect(result.success).toBe(true);
      expect(result.reportCount).toBe(50);
    });

    it("should handle special characters in titles", async () => {
      const reports: DiffReport[] = [
        {
          id: "1",
          oldText: "Hello",
          newText: "World",
          title: "Report <script>alert('xss')</script>",
        },
      ];

      const result = await batchExportDiffReports(reports, {
        format: "zip",
      });

      expect(result.success).toBe(true);
      expect(result.filename).not.toContain("<");
      expect(result.filename).not.toContain(">");
    });

    it("should merge PDFs when requested", async () => {
      const reports: DiffReport[] = [
        {
          id: "1",
          oldText: "Hello",
          newText: "World",
          title: "Report 1",
        },
        {
          id: "2",
          oldText: "Foo",
          newText: "Bar",
          title: "Report 2",
        },
      ];

      const result = await batchExportDiffReports(reports, {
        format: "pdf",
        mergeIntoSinglePDF: true,
        includeTableOfContents: true,
      });

      expect(result.success).toBe(true);
      expect(result.filename).toContain("batch-diff-report");
    });

    it("should handle all options combined", async () => {
      const reports: DiffReport[] = [
        {
          id: "1",
          oldText: "Original content\nLine 2\nLine 3",
          newText: "Modified content\nLine 2\nLine 3\nLine 4",
          title: "Complete Report",
          oldVersion: "v1.0.0",
          newVersion: "v1.1.0",
        },
      ];

      const result = await batchExportDiffReports(reports, {
        format: "zip",
        colorScheme: "light",
        pageSize: "letter",
        fontSize: 10,
        includeStatistics: true,
        showLineNumbers: true,
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Buffer);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long report titles", async () => {
      const reports: DiffReport[] = [
        {
          id: "1",
          oldText: "Hello",
          newText: "World",
          title: "A".repeat(500),
        },
      ];

      const result = await batchExportDiffReports(reports, {
        format: "zip",
      });

      expect(result.success).toBe(true);
      expect(result.filename.length).toBeLessThan(300); // Filename should be sanitized
    });

    it("should handle unicode in report content", async () => {
      const reports: DiffReport[] = [
        {
          id: "1",
          oldText: "Hello 世界 🌍",
          newText: "Hello 世界 🌎",
          title: "Unicode Report",
        },
      ];

      const result = await batchExportDiffReports(reports, {
        format: "zip",
      });

      expect(result.success).toBe(true);
    });

    it("should handle empty text content", async () => {
      const reports: DiffReport[] = [
        {
          id: "1",
          oldText: "",
          newText: "",
          title: "Empty Report",
        },
      ];

      const result = await batchExportDiffReports(reports, {
        format: "zip",
      });

      expect(result.success).toBe(true);
    });
  });
});
