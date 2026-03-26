import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  generateDiffPDF,
  generateDiffHTML,
  type DiffPDFOptions,
} from "../diff-pdf-export";

export const diffExportRouter = router({
  /**
   * Generate PDF for side-by-side diff
   */
  generatePDF: protectedProcedure
    .input(
      z.object({
        oldText: z.string(),
        newText: z.string(),
        title: z.string().optional(),
        oldVersion: z.string().optional(),
        newVersion: z.string().optional(),
        includeStatistics: z.boolean().optional(),
        colorScheme: z.enum(["light", "dark"]).optional(),
        pageSize: z.enum(["letter", "a4"]).optional(),
        fontSize: z.number().optional(),
        showLineNumbers: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const options: DiffPDFOptions = {
        title: input.title,
        oldVersion: input.oldVersion,
        newVersion: input.newVersion,
        includeStatistics: input.includeStatistics,
        colorScheme: input.colorScheme,
        pageSize: input.pageSize,
        fontSize: input.fontSize,
        showLineNumbers: input.showLineNumbers,
      };

      try {
        const pdfBuffer = await generateDiffPDF(input.oldText, input.newText, options);

        return {
          success: true,
          data: pdfBuffer.toString("base64"),
          filename: `diff-${Date.now()}.pdf`,
          mimeType: "application/pdf",
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to generate PDF",
        };
      }
    }),

  /**
   * Generate HTML preview for diff
   */
  generateHTML: protectedProcedure
    .input(
      z.object({
        oldText: z.string(),
        newText: z.string(),
        title: z.string().optional(),
        oldVersion: z.string().optional(),
        newVersion: z.string().optional(),
      })
    )
    .query(({ input }) => {
      const options: DiffPDFOptions = {
        title: input.title,
        oldVersion: input.oldVersion,
        newVersion: input.newVersion,
      };

      try {
        const html = generateDiffHTML(input.oldText, input.newText, options);

        return {
          success: true,
          html,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to generate HTML",
        };
      }
    }),

  /**
   * Get PDF export options
   */
  getExportOptions: protectedProcedure.query(() => {
    return {
      colorSchemes: ["light", "dark"],
      pageSizes: ["letter", "a4"],
      fontSizes: [8, 9, 10, 11, 12],
      defaultOptions: {
        colorScheme: "light",
        pageSize: "letter",
        fontSize: 9,
        includeStatistics: true,
        showLineNumbers: true,
      },
    };
  }),

  /**
   * Validate PDF export parameters
   */
  validateOptions: protectedProcedure
    .input(
      z.object({
        oldText: z.string(),
        newText: z.string(),
        fontSize: z.number().optional(),
      })
    )
    .query(({ input }) => {
      const errors: string[] = [];

      if (!input.oldText) {
        errors.push("Old text is required");
      }

      if (!input.newText) {
        errors.push("New text is required");
      }

      if (input.fontSize && (input.fontSize < 6 || input.fontSize > 14)) {
        errors.push("Font size must be between 6 and 14");
      }

      const oldSize = new Blob([input.oldText]).size;
      const newSize = new Blob([input.newText]).size;
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (oldSize > maxSize || newSize > maxSize) {
        errors.push("Text size exceeds maximum limit (5MB)");
      }

      return {
        valid: errors.length === 0,
        errors,
        oldTextSize: oldSize,
        newTextSize: newSize,
      };
    }),
});
