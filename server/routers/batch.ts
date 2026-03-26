import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  applyBatchUpdate,
  getUpdatePreview,
  validateBatchUpdateOptions,
  getBatchUpdateStats,
  type BatchUpdateOptions,
} from "../batch-update";

export const batchRouter = router({
  /**
   * Get preview of pages that would be updated
   */
  getPreview: protectedProcedure
    .input(
      z.object({
        bookId: z.number(),
        selectionMode: z.enum(["all", "type", "range", "custom"]),
        pageTypeFilter: z.enum(["cover", "chapter", "full_image", "text_only", "blank", "all"]).optional(),
        pageIds: z.array(z.number()).optional(),
        startPage: z.number().optional(),
        endPage: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const preview = await getUpdatePreview(input as BatchUpdateOptions);
      return preview;
    }),

  /**
   * Apply batch updates to multiple pages
   */
  applyUpdates: protectedProcedure
    .input(
      z.object({
        bookId: z.number(),
        selectionMode: z.enum(["all", "type", "range", "custom"]),
        pageTypeFilter: z.enum(["cover", "chapter", "full_image", "text_only", "blank", "all"]).optional(),
        pageIds: z.array(z.number()).optional(),
        startPage: z.number().optional(),
        endPage: z.number().optional(),
        updates: z.object({
          backgroundColor: z.string().optional(),
          textColor: z.string().optional(),
          fontFamily: z.string().optional(),
          fontSize: z.number().optional(),
          lineHeight: z.string().optional(),
          marginTop: z.string().optional(),
          marginBottom: z.string().optional(),
          marginLeft: z.string().optional(),
          marginRight: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      // Validate input
      const errors = validateBatchUpdateOptions(input as BatchUpdateOptions);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(", ")}`);
      }

      // Apply updates
      const result = await applyBatchUpdate(input as BatchUpdateOptions);
      return result;
    }),

  /**
   * Get batch update statistics
   */
  getStats: protectedProcedure
    .input(
      z.object({
        bookId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const stats = await getBatchUpdateStats(input.bookId);
      return stats;
    }),

  /**
   * Validate batch update options
   */
  validate: protectedProcedure
    .input(
      z.object({
        bookId: z.number(),
        selectionMode: z.enum(["all", "type", "range", "custom"]),
        pageTypeFilter: z.enum(["cover", "chapter", "full_image", "text_only", "blank", "all"]).optional(),
        pageIds: z.array(z.number()).optional(),
        startPage: z.number().optional(),
        endPage: z.number().optional(),
        updates: z.object({
          backgroundColor: z.string().optional(),
          textColor: z.string().optional(),
          fontFamily: z.string().optional(),
          fontSize: z.number().optional(),
          lineHeight: z.string().optional(),
          marginTop: z.string().optional(),
          marginBottom: z.string().optional(),
          marginLeft: z.string().optional(),
          marginRight: z.string().optional(),
        }),
      })
    )
    .query(async ({ input }) => {
      const errors = validateBatchUpdateOptions(input as BatchUpdateOptions);
      return {
        valid: errors.length === 0,
        errors,
      };
    }),
});
