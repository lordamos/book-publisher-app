import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createVersionSnapshot,
  getBookVersions,
  getVersion,
  restoreVersion,
  deleteVersion,
  tagVersion,
  getVersionMetadata,
  cleanupOldVersions,
} from "../version-manager";

export const versionsRouter = router({
  /**
   * Create a new version snapshot
   */
  create: protectedProcedure
    .input(
      z.object({
        bookId: z.number(),
        changesSummary: z.string().optional(),
        isAutoSave: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const version = await createVersionSnapshot(
        input.bookId,
        ctx.user!.id,
        input.changesSummary,
        input.isAutoSave
      );
      return version;
    }),

  /**
   * Get list of versions for a book
   */
  list: protectedProcedure
    .input(
      z.object({
        bookId: z.number(),
        limit: z.number().optional().default(50),
      })
    )
    .query(async ({ input }) => {
      const versions = await getBookVersions(input.bookId, input.limit);
      return versions;
    }),

  /**
   * Get a specific version
   */
  get: protectedProcedure
    .input(
      z.object({
        versionId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const version = await getVersion(input.versionId);
      return version;
    }),

  /**
   * Restore a book to a specific version
   */
  restore: protectedProcedure
    .input(
      z.object({
        bookId: z.number(),
        versionId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const success = await restoreVersion(input.bookId, input.versionId, ctx.user!.id);
      if (success) {
        // Create a new version marking the restore action
        await createVersionSnapshot(
          input.bookId,
          ctx.user!.id,
          `Restored from version ${input.versionId}`,
          false
        );
      }
      return { success };
    }),

  /**
   * Delete a version
   */
  delete: protectedProcedure
    .input(
      z.object({
        versionId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await deleteVersion(input.versionId);
      return { success };
    }),

  /**
   * Tag a version
   */
  tag: protectedProcedure
    .input(
      z.object({
        versionId: z.number(),
        tag: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await tagVersion(input.versionId, input.tag, input.description);
      return { success };
    }),

  /**
   * Get version metadata and diff
   */
  getMetadata: protectedProcedure
    .input(
      z.object({
        versionId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const metadata = await getVersionMetadata(input.versionId);
      return metadata;
    }),

  /**
   * Clean up old versions
   */
  cleanup: protectedProcedure
    .input(
      z.object({
        bookId: z.number(),
        keepCount: z.number().optional().default(50),
      })
    )
    .mutation(async ({ input }) => {
      const deletedCount = await cleanupOldVersions(input.bookId, input.keepCount);
      return { deletedCount };
    }),

  /**
   * Compare two versions
   */
  compare: protectedProcedure
    .input(
      z.object({
        versionId1: z.number(),
        versionId2: z.number(),
      })
    )
    .query(async ({ input }) => {
      const version1 = await getVersion(input.versionId1);
      const version2 = await getVersion(input.versionId2);

      if (!version1 || !version2) {
        throw new Error("One or both versions not found");
      }

      return {
        version1,
        version2,
        diff: {
          pagesChanged: Math.abs((version1.pages?.length || 0) - (version2.pages?.length || 0)),
          chaptersChanged: Math.abs((version1.chapters?.length || 0) - (version2.chapters?.length || 0)),
          imagesChanged: Math.abs((version1.images?.length || 0) - (version2.images?.length || 0)),
        },
      };
    }),
});
