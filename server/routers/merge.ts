import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  MergeEngine,
  MergeChange,
  MergeConflict,
} from "../merge-engine";

export const mergeRouter = router({
  /**
   * Extract changes from two versions for selective merging
   */
  extractChanges: protectedProcedure
    .input(
      z.object({
        oldText: z.string(),
        newText: z.string(),
      })
    )
    .query(({ input }) => {
      const changes = MergeEngine.extractChanges(input.oldText, input.newText);
      return {
        changes,
        statistics: MergeEngine.getStatistics(changes, []),
      };
    }),

  /**
   * Preview merge result before applying
   */
  previewMerge: protectedProcedure
    .input(
      z.object({
        originalText: z.string(),
        changes: z.array(
          z.object({
            id: z.string(),
            type: z.enum(["add", "remove", "modify"]),
            lineNumber: z.number(),
            oldContent: z.string(),
            newContent: z.string(),
            accepted: z.boolean(),
          })
        ),
        conflicts: z.array(
          z.object({
            id: z.string(),
            lineNumber: z.number(),
            oldContent: z.string(),
            newContent: z.string(),
            conflictType: z.enum(["edit-edit", "edit-delete", "delete-edit"]),
            resolution: z.enum(["keep-old", "use-new", "custom"]).optional(),
            customResolution: z.string().optional(),
          })
        ).optional(),
      })
    )
    .query(({ input }) => {
      const preview = MergeEngine.previewMerge(
        input.originalText,
        input.changes as MergeChange[],
        (input.conflicts as MergeConflict[]) || []
      );
      return preview;
    }),

  /**
   * Execute merge with selected changes
   */
  executeMerge: protectedProcedure
    .input(
      z.object({
        originalText: z.string(),
        changes: z.array(
          z.object({
            id: z.string(),
            type: z.enum(["add", "remove", "modify"]),
            lineNumber: z.number(),
            oldContent: z.string(),
            newContent: z.string(),
            accepted: z.boolean(),
          })
        ),
        conflicts: z.array(
          z.object({
            id: z.string(),
            lineNumber: z.number(),
            oldContent: z.string(),
            newContent: z.string(),
            conflictType: z.enum(["edit-edit", "edit-delete", "delete-edit"]),
            resolution: z.enum(["keep-old", "use-new", "custom"]).optional(),
            customResolution: z.string().optional(),
          })
        ).optional(),
      })
    )
    .mutation(({ input }) => {
      const result = MergeEngine.executeMerge(
        input.originalText,
        input.changes as MergeChange[],
        (input.conflicts as MergeConflict[]) || []
      );

      const validation = MergeEngine.validateMerge(result);
      if (!validation.valid) {
        throw new Error(`Merge validation failed: ${validation.errors.join(", ")}`);
      }

      return result;
    }),

  /**
   * Detect conflicts between base, old, and new versions
   */
  detectConflicts: protectedProcedure
    .input(
      z.object({
        baseText: z.string(),
        oldText: z.string(),
        newText: z.string(),
      })
    )
    .query(({ input }) => {
      const conflicts = MergeEngine.detectConflicts(input.baseText, input.oldText, input.newText);
      return {
        conflicts,
        conflictCount: conflicts.length,
      };
    }),

  /**
   * Resolve a specific conflict
   */
  resolveConflict: protectedProcedure
    .input(
      z.object({
        conflictId: z.string(),
        resolution: z.enum(["keep-old", "use-new", "custom"]),
        customText: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      // This would typically update the conflict in a database
      // For now, we just return the resolution
      return {
        conflictId: input.conflictId,
        resolution: input.resolution,
        customText: input.customText,
      };
    }),

  /**
   * Accept all changes of a specific type
   */
  acceptChangesByType: protectedProcedure
    .input(
      z.object({
        changes: z.array(
          z.object({
            id: z.string(),
            type: z.enum(["add", "remove", "modify"]),
            lineNumber: z.number(),
            oldContent: z.string(),
            newContent: z.string(),
            accepted: z.boolean(),
          })
        ),
        changeType: z.enum(["add", "remove", "modify"]),
      })
    )
    .mutation(({ input }) => {
      const updated = MergeEngine.acceptChangesByType(
        input.changes as MergeChange[],
        input.changeType
      );
      return {
        changes: updated,
        statistics: MergeEngine.getStatistics(updated, []),
      };
    }),

  /**
   * Reject all changes of a specific type
   */
  rejectChangesByType: protectedProcedure
    .input(
      z.object({
        changes: z.array(
          z.object({
            id: z.string(),
            type: z.enum(["add", "remove", "modify"]),
            lineNumber: z.number(),
            oldContent: z.string(),
            newContent: z.string(),
            accepted: z.boolean(),
          })
        ),
        changeType: z.enum(["add", "remove", "modify"]),
      })
    )
    .mutation(({ input }) => {
      const updated = MergeEngine.rejectChangesByType(
        input.changes as MergeChange[],
        input.changeType
      );
      return {
        changes: updated,
        statistics: MergeEngine.getStatistics(updated, []),
      };
    }),

  /**
   * Accept all changes
   */
  acceptAll: protectedProcedure
    .input(
      z.object({
        changes: z.array(
          z.object({
            id: z.string(),
            type: z.enum(["add", "remove", "modify"]),
            lineNumber: z.number(),
            oldContent: z.string(),
            newContent: z.string(),
            accepted: z.boolean(),
          })
        ),
      })
    )
    .mutation(({ input }) => {
      const updated = MergeEngine.acceptAll(input.changes as MergeChange[]);
      return {
        changes: updated,
        statistics: MergeEngine.getStatistics(updated, []),
      };
    }),

  /**
   * Reject all changes
   */
  rejectAll: protectedProcedure
    .input(
      z.object({
        changes: z.array(
          z.object({
            id: z.string(),
            type: z.enum(["add", "remove", "modify"]),
            lineNumber: z.number(),
            oldContent: z.string(),
            newContent: z.string(),
            accepted: z.boolean(),
          })
        ),
      })
    )
    .mutation(({ input }) => {
      const updated = MergeEngine.rejectAll(input.changes as MergeChange[]);
      return {
        changes: updated,
        statistics: MergeEngine.getStatistics(updated, []),
      };
    }),

  /**
   * Get merge statistics
   */
  getStatistics: protectedProcedure
    .input(
      z.object({
        changes: z.array(
          z.object({
            id: z.string(),
            type: z.enum(["add", "remove", "modify"]),
            lineNumber: z.number(),
            oldContent: z.string(),
            newContent: z.string(),
            accepted: z.boolean(),
          })
        ),
        conflicts: z.array(
          z.object({
            id: z.string(),
            lineNumber: z.number(),
            oldContent: z.string(),
            newContent: z.string(),
            conflictType: z.enum(["edit-edit", "edit-delete", "delete-edit"]),
            resolution: z.enum(["keep-old", "use-new", "custom"]).optional(),
            customResolution: z.string().optional(),
          })
        ).optional(),
      })
    )
    .query(({ input }) => {
      return MergeEngine.getStatistics(
        input.changes as MergeChange[],
        (input.conflicts as MergeConflict[]) || []
      );
    }),
});
