import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  batchExportDiffReports,
  validateBatchExportOptions,
  calculateBatchExportStats,
  type DiffReport,
  type BatchExportOptions,
} from "../batch-diff-export";

export const batchExportRouter = router({
  /**
   * Export multiple diff reports as PDF or ZIP
   */
  exportReports: protectedProcedure
    .input(
      z.object({
        reports: z.array(
          z.object({
            id: z.string(),
            oldText: z.string(),
            newText: z.string(),
            title: z.string(),
            oldVersion: z.string().optional(),
            newVersion: z.string().optional(),
          })
        ),
        format: z.enum(["pdf", "zip"]),
        colorScheme: z.enum(["light", "dark"]).optional(),
        pageSize: z.enum(["letter", "a4"]).optional(),
        fontSize: z.number().optional(),
        includeStatistics: z.boolean().optional(),
        showLineNumbers: z.boolean().optional(),
        mergeIntoSinglePDF: z.boolean().optional(),
        includeTableOfContents: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Validate options
      const validation = validateBatchExportOptions(input.reports, {
        format: input.format,
        colorScheme: input.colorScheme,
        pageSize: input.pageSize,
        fontSize: input.fontSize,
        includeStatistics: input.includeStatistics,
        showLineNumbers: input.showLineNumbers,
        mergeIntoSinglePDF: input.mergeIntoSinglePDF,
        includeTableOfContents: input.includeTableOfContents,
      });

      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors,
        };
      }

      try {
        const result = await batchExportDiffReports(input.reports, {
          format: input.format,
          colorScheme: input.colorScheme,
          pageSize: input.pageSize,
          fontSize: input.fontSize,
          includeStatistics: input.includeStatistics,
          showLineNumbers: input.showLineNumbers,
          mergeIntoSinglePDF: input.mergeIntoSinglePDF,
          includeTableOfContents: input.includeTableOfContents,
        });

        if (result.success && result.data) {
          return {
            success: true,
            filename: result.filename,
            data: result.data.toString("base64"),
            reportCount: result.reportCount,
            mimeType: input.format === "zip" ? "application/zip" : "application/pdf",
          };
        } else {
          return {
            success: false,
            error: result.error,
          };
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to export reports",
        };
      }
    }),

  /**
   * Validate batch export parameters
   */
  validateOptions: protectedProcedure
    .input(
      z.object({
        reportCount: z.number().min(1).max(1000),
        format: z.enum(["pdf", "zip"]),
        fontSize: z.number().optional(),
        totalSize: z.number().optional(),
      })
    )
    .query(({ input }) => {
      const errors: string[] = [];

      if (input.reportCount < 1) {
        errors.push("At least one report is required");
      }

      if (input.reportCount > 1000) {
        errors.push("Maximum 1000 reports allowed per batch export");
      }

      if (!["pdf", "zip"].includes(input.format)) {
        errors.push("Format must be 'pdf' or 'zip'");
      }

      if (input.fontSize && (input.fontSize < 6 || input.fontSize > 14)) {
        errors.push("Font size must be between 6 and 14");
      }

      const maxTotalSize = 50 * 1024 * 1024; // 50MB
      if (input.totalSize && input.totalSize > maxTotalSize) {
        errors.push(
          `Total size (${(input.totalSize / 1024 / 1024).toFixed(2)}MB) exceeds maximum (50MB)`
        );
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    }),

  /**
   * Get batch export statistics
   */
  getStatistics: protectedProcedure
    .input(
      z.object({
        reports: z.array(
          z.object({
            oldText: z.string(),
            newText: z.string(),
          })
        ),
      })
    )
    .query(({ input }) => {
      const stats = calculateBatchExportStats(
        input.reports.map((r, i) => ({
          id: `report-${i}`,
          oldText: r.oldText,
          newText: r.newText,
          title: `Report ${i + 1}`,
        }))
      );

      return {
        totalReports: stats.totalReports,
        totalSize: stats.totalSize,
        totalSizeMB: (stats.totalSize / 1024 / 1024).toFixed(2),
        estimatedPDFSize: stats.estimatedPDFSize,
        estimatedPDFSizeMB: (stats.estimatedPDFSize / 1024 / 1024).toFixed(2),
        estimatedZipSize: stats.estimatedZipSize,
        estimatedZipSizeMB: (stats.estimatedZipSize / 1024 / 1024).toFixed(2),
        compressionRatio: ((1 - stats.estimatedZipSize / stats.totalSize) * 100).toFixed(1),
      };
    }),

  /**
   * Get export format options
   */
  getExportOptions: protectedProcedure.query(() => {
    return {
      formats: ["pdf", "zip"],
      colorSchemes: ["light", "dark"],
      pageSizes: ["letter", "a4"],
      fontSizes: [8, 9, 10, 11, 12],
      maxReports: 1000,
      maxTotalSize: 50 * 1024 * 1024,
      defaultOptions: {
        format: "zip",
        colorScheme: "light",
        pageSize: "letter",
        fontSize: 9,
        includeStatistics: true,
        showLineNumbers: true,
        mergeIntoSinglePDF: false,
        includeTableOfContents: false,
      },
    };
  }),

  /**
   * Preview batch export (without generating actual files)
   */
  previewBatchExport: protectedProcedure
    .input(
      z.object({
        reportCount: z.number().min(1).max(1000),
        format: z.enum(["pdf", "zip"]),
        totalSize: z.number(),
      })
    )
    .query(({ input }) => {
      const validation = validateBatchExportOptions(
        Array(input.reportCount).fill({
          id: "preview",
          oldText: "",
          newText: "",
          title: "Preview",
        }),
        { format: input.format }
      );

      if (!validation.valid) {
        return {
          valid: false,
          errors: validation.errors,
        };
      }

      const estimatedSize =
        input.format === "zip"
          ? input.totalSize * 0.3 // ZIP compression
          : input.totalSize * 1.5; // PDF overhead

      return {
        valid: true,
        format: input.format,
        reportCount: input.reportCount,
        estimatedSize: estimatedSize,
        estimatedSizeMB: (estimatedSize / 1024 / 1024).toFixed(2),
        filename:
          input.format === "zip"
            ? `diff-reports-${Date.now()}.zip`
            : `batch-diff-report-${Date.now()}.pdf`,
      };
    }),
});
