import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { diffTexts, diffPages, generateUnifiedDiff, mergeDiffStatistics } from "../diff-engine";
import { getDb } from "../db";
import { eq } from "drizzle-orm";
import { bookVersions } from "../../drizzle/schema";

export const diffRouter = router({
  /**
   * Compare two versions and get detailed diff
   */
  compareVersions: protectedProcedure
    .input(
      z.object({
        bookId: z.number(),
        versionId1: z.number(),
        versionId2: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [version1, version2] = await Promise.all([
        db
          .select()
          .from(bookVersions)
          .where(eq(bookVersions.id, input.versionId1))
          .limit(1),
        db
          .select()
          .from(bookVersions)
          .where(eq(bookVersions.id, input.versionId2))
          .limit(1),
      ]);

      if (!version1.length || !version2.length) {
        throw new Error("One or both versions not found");
      }

      const snapshot1 = JSON.parse(version1[0].snapshot as string);
      const snapshot2 = JSON.parse(version2[0].snapshot as string);

      // Compare text content from pages
      const oldText = (snapshot1.pages || [])
        .map((p: { content: string }) => p.content || "")
        .join("\n\n");
      const newText = (snapshot2.pages || [])
        .map((p: { content: string }) => p.content || "")
        .join("\n\n");

      const diff = diffTexts(oldText, newText);

      return {
        version1: {
          id: version1[0].id,
          versionNumber: version1[0].versionNumber,
          title: version1[0].title,
          createdAt: version1[0].createdAt,
        },
        version2: {
          id: version2[0].id,
          versionNumber: version2[0].versionNumber,
          title: version2[0].title,
          createdAt: version2[0].createdAt,
        },
        diff,
      };
    }),

  /**
   * Get diff between current and previous version
   */
  diffWithPrevious: protectedProcedure
    .input(
      z.object({
        bookId: z.number(),
        versionId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const currentVersion = await db
        .select()
        .from(bookVersions)
        .where(eq(bookVersions.id, input.versionId))
        .limit(1);

      if (!currentVersion.length) {
        throw new Error("Version not found");
      }

      // Get previous version
      const previousVersions = await db
        .select()
        .from(bookVersions)
        .where(eq(bookVersions.bookId, input.bookId))
        .orderBy(bookVersions.versionNumber)
        .limit(2);

      if (previousVersions.length < 2) {
        throw new Error("No previous version available");
      }

      const prevVersion = previousVersions[0];
      const currVersion = previousVersions[1];

      const snapshot1 = JSON.parse(prevVersion.snapshot as string);
      const snapshot2 = JSON.parse(currVersion.snapshot as string);

      const oldText = (snapshot1.pages || [])
        .map((p: { content: string }) => p.content || "")
        .join("\n\n");
      const newText = (snapshot2.pages || [])
        .map((p: { content: string }) => p.content || "")
        .join("\n\n");

      const diff = diffTexts(oldText, newText);

      return {
        previousVersion: {
          id: prevVersion.id,
          versionNumber: prevVersion.versionNumber,
          title: prevVersion.title,
          createdAt: prevVersion.createdAt,
        },
        currentVersion: {
          id: currVersion.id,
          versionNumber: currVersion.versionNumber,
          title: currVersion.title,
          createdAt: currVersion.createdAt,
        },
        diff,
      };
    }),

  /**
   * Get unified diff format (git-style)
   */
  getUnifiedDiff: protectedProcedure
    .input(
      z.object({
        bookId: z.number(),
        versionId1: z.number(),
        versionId2: z.number(),
        context: z.number().default(3),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [version1, version2] = await Promise.all([
        db
          .select()
          .from(bookVersions)
          .where(eq(bookVersions.id, input.versionId1))
          .limit(1),
        db
          .select()
          .from(bookVersions)
          .where(eq(bookVersions.id, input.versionId2))
          .limit(1),
      ]);

      if (!version1.length || !version2.length) {
        throw new Error("One or both versions not found");
      }

      const snapshot1 = JSON.parse(version1[0].snapshot as string);
      const snapshot2 = JSON.parse(version2[0].snapshot as string);

      const oldText = (snapshot1.pages || [])
        .map((p: { content: string }) => p.content || "")
        .join("\n\n");
      const newText = (snapshot2.pages || [])
        .map((p: { content: string }) => p.content || "")
        .join("\n\n");

      const unifiedDiff = generateUnifiedDiff(oldText, newText, input.context);

      return {
        format: "unified",
        context: input.context,
        diff: unifiedDiff,
        version1: {
          id: version1[0].id,
          versionNumber: version1[0].versionNumber,
        },
        version2: {
          id: version2[0].id,
          versionNumber: version2[0].versionNumber,
        },
      };
    }),

  /**
   * Get diff statistics for a version comparison
   */
  getDiffStatistics: protectedProcedure
    .input(
      z.object({
        bookId: z.number(),
        versionId1: z.number(),
        versionId2: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [version1, version2] = await Promise.all([
        db
          .select()
          .from(bookVersions)
          .where(eq(bookVersions.id, input.versionId1))
          .limit(1),
        db
          .select()
          .from(bookVersions)
          .where(eq(bookVersions.id, input.versionId2))
          .limit(1),
      ]);

      if (!version1.length || !version2.length) {
        throw new Error("One or both versions not found");
      }

      const snapshot1 = JSON.parse(version1[0].snapshot as string);
      const snapshot2 = JSON.parse(version2[0].snapshot as string);

      const oldText = (snapshot1.pages || [])
        .map((p: { content: string }) => p.content || "")
        .join("\n\n");
      const newText = (snapshot2.pages || [])
        .map((p: { content: string }) => p.content || "")
        .join("\n\n");

      const diff = diffTexts(oldText, newText);

      return diff.statistics;
    }),

  /**
   * Compare page-by-page diffs
   */
  comparePages: protectedProcedure
    .input(
      z.object({
        bookId: z.number(),
        versionId1: z.number(),
        versionId2: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [version1, version2] = await Promise.all([
        db
          .select()
          .from(bookVersions)
          .where(eq(bookVersions.id, input.versionId1))
          .limit(1),
        db
          .select()
          .from(bookVersions)
          .where(eq(bookVersions.id, input.versionId2))
          .limit(1),
      ]);

      if (!version1.length || !version2.length) {
        throw new Error("One or both versions not found");
      }

      const snapshot1 = JSON.parse(version1[0].snapshot as string);
      const snapshot2 = JSON.parse(version2[0].snapshot as string);

      const pages1 = (snapshot1.pages || []).map((p: { id: number; content: string }) => ({
        id: p.id,
        content: p.content || "",
      }));
      const pages2 = (snapshot2.pages || []).map((p: { id: number; content: string }) => ({
        id: p.id,
        content: p.content || "",
      }));

      const pageDiffs = diffPages(pages1, pages2);

      // Convert map to array for JSON serialization
      const pageDiffsArray = Array.from(pageDiffs.entries()).map(([pageId, diff]) => ({
        pageId,
        ...diff,
      }));

      return {
        version1: {
          id: version1[0].id,
          versionNumber: version1[0].versionNumber,
        },
        version2: {
          id: version2[0].id,
          versionNumber: version2[0].versionNumber,
        },
        pageDiffs: pageDiffsArray,
        summary: mergeDiffStatistics(pageDiffsArray.map((p) => p)),
      };
    }),
});
