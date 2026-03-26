import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";

export const sideBySideRouter = router({
  /**
   * Generate side-by-side diff lines from two texts
   */
  generateDiff: protectedProcedure
    .input(
      z.object({
        oldText: z.string(),
        newText: z.string(),
      })
    )
    .query(({ input }) => {
      const oldLines = input.oldText.split("\n");
      const newLines = input.newText.split("\n");

      const leftLines: Array<{
        type: "add" | "remove" | "context";
        content: string;
        lineNumber: number;
      }> = [];
      const rightLines: Array<{
        type: "add" | "remove" | "context";
        content: string;
        lineNumber: number;
      }> = [];

      let oldIdx = 0;
      let newIdx = 0;
      let leftLineNum = 1;
      let rightLineNum = 1;

      // Simple diff algorithm
      while (oldIdx < oldLines.length || newIdx < newLines.length) {
        if (oldIdx < oldLines.length && newIdx < newLines.length) {
          if (oldLines[oldIdx] === newLines[newIdx]) {
            // Context line
            leftLines.push({
              type: "context",
              content: oldLines[oldIdx],
              lineNumber: leftLineNum++,
            });
            rightLines.push({
              type: "context",
              content: newLines[newIdx],
              lineNumber: rightLineNum++,
            });
            oldIdx++;
            newIdx++;
          } else {
            // Different lines
            if (oldIdx < oldLines.length) {
              leftLines.push({
                type: "remove",
                content: oldLines[oldIdx],
                lineNumber: leftLineNum++,
              });
              oldIdx++;
            }
            if (newIdx < newLines.length) {
              rightLines.push({
                type: "add",
                content: newLines[newIdx],
                lineNumber: rightLineNum++,
              });
              newIdx++;
            }
          }
        } else if (oldIdx < oldLines.length) {
          leftLines.push({
            type: "remove",
            content: oldLines[oldIdx],
            lineNumber: leftLineNum++,
          });
          oldIdx++;
        } else {
          rightLines.push({
            type: "add",
            content: newLines[newIdx],
            lineNumber: rightLineNum++,
          });
          newIdx++;
        }
      }

      return {
        leftLines,
        rightLines,
        statistics: {
          additions: rightLines.filter((l) => l.type === "add").length,
          deletions: leftLines.filter((l) => l.type === "remove").length,
          contextLines: leftLines.filter((l) => l.type === "context").length,
        },
      };
    }),

  /**
   * Get comparison statistics
   */
  getStatistics: protectedProcedure
    .input(
      z.object({
        oldText: z.string(),
        newText: z.string(),
      })
    )
    .query(({ input }) => {
      const oldLines = input.oldText.split("\n");
      const newLines = input.newText.split("\n");

      let additions = 0;
      let deletions = 0;
      let modifications = 0;
      let contextLines = 0;

      const maxLen = Math.max(oldLines.length, newLines.length);

      for (let i = 0; i < maxLen; i++) {
        const oldLine = oldLines[i];
        const newLine = newLines[i];

        if (oldLine === undefined) {
          additions++;
        } else if (newLine === undefined) {
          deletions++;
        } else if (oldLine === newLine) {
          contextLines++;
        } else {
          modifications++;
        }
      }

      const totalChanges = additions + deletions + modifications;
      const changePercentage =
        oldLines.length > 0 ? Math.round((totalChanges / oldLines.length) * 100) : 0;

      return {
        additions,
        deletions,
        modifications,
        contextLines,
        totalChanges,
        changePercentage,
        oldLineCount: oldLines.length,
        newLineCount: newLines.length,
        similarity: Math.round(
          ((oldLines.length - totalChanges) / Math.max(oldLines.length, 1)) * 100
        ),
      };
    }),

  /**
   * Find changes for navigation
   */
  findChanges: protectedProcedure
    .input(
      z.object({
        oldText: z.string(),
        newText: z.string(),
      })
    )
    .query(({ input }) => {
      const oldLines = input.oldText.split("\n");
      const newLines = input.newText.split("\n");

      const changes: Array<{
        index: number;
        type: "add" | "remove" | "modify";
        oldContent: string;
        newContent: string;
      }> = [];

      const maxLen = Math.max(oldLines.length, newLines.length);

      for (let i = 0; i < maxLen; i++) {
        const oldLine = oldLines[i];
        const newLine = newLines[i];

        if (oldLine !== newLine) {
          changes.push({
            index: i,
            type:
              oldLine === undefined
                ? "add"
                : newLine === undefined
                  ? "remove"
                  : "modify",
            oldContent: oldLine || "",
            newContent: newLine || "",
          });
        }
      }

      return {
        changes,
        changeCount: changes.length,
      };
    }),

  /**
   * Search within diff
   */
  search: protectedProcedure
    .input(
      z.object({
        oldText: z.string(),
        newText: z.string(),
        searchTerm: z.string(),
      })
    )
    .query(({ input }) => {
      const oldLines = input.oldText.split("\n");
      const newLines = input.newText.split("\n");

      const results = {
        oldMatches: oldLines
          .map((line, idx) => ({
            lineNumber: idx + 1,
            content: line,
            matches: line.includes(input.searchTerm),
          }))
          .filter((l) => l.matches),
        newMatches: newLines
          .map((line, idx) => ({
            lineNumber: idx + 1,
            content: line,
            matches: line.includes(input.searchTerm),
          }))
          .filter((l) => l.matches),
      };

      return {
        ...results,
        totalMatches: results.oldMatches.length + results.newMatches.length,
      };
    }),

  /**
   * Get context around a specific line
   */
  getContext: protectedProcedure
    .input(
      z.object({
        text: z.string(),
        lineNumber: z.number(),
        contextSize: z.number().default(3),
      })
    )
    .query(({ input }) => {
      const lines = input.text.split("\n");
      const start = Math.max(0, input.lineNumber - input.contextSize - 1);
      const end = Math.min(lines.length, input.lineNumber + input.contextSize);

      return {
        context: lines.slice(start, end).map((line, idx) => ({
          lineNumber: start + idx + 1,
          content: line,
          isTarget: start + idx === input.lineNumber - 1,
        })),
        startLine: start + 1,
        endLine: end,
      };
    }),
});
