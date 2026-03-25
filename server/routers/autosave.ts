import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import {
  autoSaveBook,
  createBookBackup,
  getBackupHistory,
  restoreFromBackup,
  getAutoSaveConfig,
  enableAutoSave,
  disableAutoSave,
  getBackupStats,
} from "../auto-save";

export const autosaveRouter = router({
  save: protectedProcedure
    .input(z.object({ bookId: z.number() }))
    .mutation(async ({ input }) => {
      return autoSaveBook(input.bookId);
    }),

  createBackup: protectedProcedure
    .input(z.object({ bookId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return createBookBackup(input.bookId, ctx.user.id);
    }),

  getBackupHistory: protectedProcedure
    .input(z.object({ bookId: z.number(), limit: z.number().default(10) }))
    .query(async ({ input }) => {
      return getBackupHistory(input.bookId, input.limit);
    }),

  restore: protectedProcedure
    .input(z.object({ backupId: z.string(), bookId: z.number() }))
    .mutation(async ({ input }) => {
      return restoreFromBackup(input.backupId, input.bookId);
    }),

  getConfig: protectedProcedure.query(async ({ ctx }) => {
    return getAutoSaveConfig(ctx.user.id);
  }),

  enableAutoSave: protectedProcedure
    .input(
      z.object({
        intervalSeconds: z.number().default(30),
        maxVersions: z.number().default(10),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return enableAutoSave(ctx.user.id, {
        enabled: true,
        intervalSeconds: input.intervalSeconds,
        maxVersions: input.maxVersions,
      });
    }),

  disableAutoSave: protectedProcedure.mutation(async ({ ctx }) => {
    await disableAutoSave(ctx.user.id);
    return { success: true };
  }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    return getBackupStats(ctx.user.id);
  }),
});
