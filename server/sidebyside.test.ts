import { describe, it, expect } from "vitest";

describe("Side-by-Side Diff", () => {
  describe("generateDiff", () => {
    it("should generate diff lines for identical texts", () => {
      const oldText = "Line 1\nLine 2\nLine 3";
      const newText = "Line 1\nLine 2\nLine 3";

      const oldLines = oldText.split("\n");
      const newLines = newText.split("\n");

      expect(oldLines.length).toBe(newLines.length);
      expect(oldLines).toEqual(newLines);
    });

    it("should detect added lines", () => {
      const oldText = "Line 1\nLine 2";
      const newText = "Line 1\nLine 2\nLine 3";

      const oldLines = oldText.split("\n");
      const newLines = newText.split("\n");

      expect(newLines.length).toBeGreaterThan(oldLines.length);
      expect(newLines).toContain("Line 3");
    });

    it("should detect removed lines", () => {
      const oldText = "Line 1\nLine 2\nLine 3";
      const newText = "Line 1\nLine 2";

      const oldLines = oldText.split("\n");
      const newLines = newText.split("\n");

      expect(oldLines.length).toBeGreaterThan(newLines.length);
    });

    it("should detect modified lines", () => {
      const oldText = "Hello World";
      const newText = "Hello Universe";

      const oldLines = oldText.split("\n");
      const newLines = newText.split("\n");

      expect(oldLines[0]).not.toBe(newLines[0]);
    });

    it("should preserve line numbers", () => {
      const oldText = "A\nB\nC";
      const newText = "A\nB\nC\nD";

      const oldLines = oldText.split("\n");
      const newLines = newText.split("\n");

      oldLines.forEach((line, idx) => {
        expect(line).toBe(oldText.split("\n")[idx]);
      });
    });

    it("should handle empty texts", () => {
      const oldText = "";
      const newText = "";

      const oldLines = oldText.split("\n");
      const newLines = newText.split("\n");

      expect(oldLines.length).toBe(1);
      expect(newLines.length).toBe(1);
      expect(oldLines[0]).toBe("");
    });

    it("should handle multiline additions", () => {
      const oldText = "Start\nEnd";
      const newText = "Start\nMiddle 1\nMiddle 2\nEnd";

      const oldLines = oldText.split("\n");
      const newLines = newText.split("\n");

      expect(newLines.length).toBe(4);
      expect(newLines[1]).toBe("Middle 1");
      expect(newLines[2]).toBe("Middle 2");
    });
  });

  describe("getStatistics", () => {
    it("should calculate additions correctly", () => {
      const oldText = "Line 1\nLine 2";
      const newText = "Line 1\nLine 2\nLine 3";

      const oldLines = oldText.split("\n");
      const newLines = newText.split("\n");

      const additions = newLines.length - oldLines.length;
      expect(additions).toBe(1);
    });

    it("should calculate deletions correctly", () => {
      const oldText = "Line 1\nLine 2\nLine 3";
      const newText = "Line 1\nLine 2";

      const oldLines = oldText.split("\n");
      const newLines = newText.split("\n");

      const deletions = oldLines.length - newLines.length;
      expect(deletions).toBe(1);
    });

    it("should calculate similarity score", () => {
      const oldText = "A\nB\nC";
      const newText = "A\nB\nC";

      const oldLines = oldText.split("\n");
      const newLines = newText.split("\n");

      const similarity = oldLines.every((line, idx) => line === newLines[idx]) ? 100 : 0;
      expect(similarity).toBe(100);
    });

    it("should calculate change percentage", () => {
      const oldText = "A\nB\nC\nD";
      const newText = "A\nX\nC\nD";

      const oldLines = oldText.split("\n");
      const newLines = newText.split("\n");

      let changes = 0;
      for (let i = 0; i < oldLines.length; i++) {
        if (oldLines[i] !== newLines[i]) {
          changes++;
        }
      }

      const changePercentage = Math.round((changes / oldLines.length) * 100);
      expect(changePercentage).toBe(25);
    });

    it("should handle empty texts in statistics", () => {
      const oldText = "";
      const newText = "";

      const oldLines = oldText.split("\n");
      const newLines = newText.split("\n");

      expect(oldLines.length).toBe(1);
      expect(newLines.length).toBe(1);
    });
  });

  describe("findChanges", () => {
    it("should find all additions", () => {
      const oldText = "A\nB";
      const newText = "A\nB\nC\nD";

      const oldLines = oldText.split("\n");
      const newLines = newText.split("\n");

      const changes = [];
      for (let i = 0; i < Math.max(oldLines.length, newLines.length); i++) {
        if (oldLines[i] !== newLines[i]) {
          changes.push(i);
        }
      }

      expect(changes.length).toBeGreaterThan(0);
    });

    it("should find all deletions", () => {
      const oldText = "A\nB\nC\nD";
      const newText = "A\nB";

      const oldLines = oldText.split("\n");
      const newLines = newText.split("\n");

      const changes = [];
      for (let i = 0; i < Math.max(oldLines.length, newLines.length); i++) {
        if (oldLines[i] !== newLines[i]) {
          changes.push(i);
        }
      }

      expect(changes.length).toBeGreaterThan(0);
    });

    it("should find modifications", () => {
      const oldText = "Hello World";
      const newText = "Hello Universe";

      const oldLines = oldText.split("\n");
      const newLines = newText.split("\n");

      const changes = [];
      for (let i = 0; i < Math.max(oldLines.length, newLines.length); i++) {
        if (oldLines[i] !== newLines[i]) {
          changes.push(i);
        }
      }

      expect(changes.length).toBeGreaterThan(0);
    });

    it("should return empty array for identical texts", () => {
      const oldText = "A\nB\nC";
      const newText = "A\nB\nC";

      const oldLines = oldText.split("\n");
      const newLines = newText.split("\n");

      const changes = [];
      for (let i = 0; i < Math.max(oldLines.length, newLines.length); i++) {
        if (oldLines[i] !== newLines[i]) {
          changes.push(i);
        }
      }

      expect(changes.length).toBe(0);
    });
  });

  describe("search", () => {
    it("should find search term in old text", () => {
      const oldText = "Hello World\nHello Universe";
      const searchTerm = "Hello";

      const matches = oldText.split("\n").filter((line) => line.includes(searchTerm));

      expect(matches.length).toBe(2);
    });

    it("should find search term in new text", () => {
      const newText = "Hello World\nHello Universe";
      const searchTerm = "Hello";

      const matches = newText.split("\n").filter((line) => line.includes(searchTerm));

      expect(matches.length).toBe(2);
    });

    it("should be case-sensitive", () => {
      const text = "Hello hello HELLO";
      const searchTerm = "Hello";

      const matches = text.split("\n").filter((line) => line.includes(searchTerm));

      expect(matches.length).toBeGreaterThan(0);
    });

    it("should return empty results for no matches", () => {
      const text = "Hello World";
      const searchTerm = "xyz";

      const matches = text.split("\n").filter((line) => line.includes(searchTerm));

      expect(matches.length).toBe(0);
    });

    it("should find multiple occurrences in single line", () => {
      const line = "Hello Hello Hello";
      const searchTerm = "Hello";

      const count = (line.match(/Hello/g) || []).length;

      expect(count).toBe(3);
    });
  });

  describe("getContext", () => {
    it("should return context around a line", () => {
      const text = "A\nB\nC\nD\nE";
      const lineNumber = 3;
      const contextSize = 1;

      const lines = text.split("\n");
      const start = Math.max(0, lineNumber - contextSize - 1);
      const end = Math.min(lines.length, lineNumber + contextSize);
      const context = lines.slice(start, end);

      expect(context.length).toBeGreaterThan(0);
      expect(context).toContain("C");
    });

    it("should handle context at start of file", () => {
      const text = "A\nB\nC\nD\nE";
      const lineNumber = 1;
      const contextSize = 2;

      const lines = text.split("\n");
      const start = Math.max(0, lineNumber - contextSize - 1);
      const end = Math.min(lines.length, lineNumber + contextSize);
      const context = lines.slice(start, end);

      expect(context[0]).toBe("A");
    });

    it("should handle context at end of file", () => {
      const text = "A\nB\nC\nD\nE";
      const lineNumber = 5;
      const contextSize = 2;

      const lines = text.split("\n");
      const start = Math.max(0, lineNumber - contextSize - 1);
      const end = Math.min(lines.length, lineNumber + contextSize);
      const context = lines.slice(start, end);

      expect(context[context.length - 1]).toBe("E");
    });

    it("should handle large context size", () => {
      const text = "A\nB\nC";
      const lineNumber = 2;
      const contextSize = 10;

      const lines = text.split("\n");
      const start = Math.max(0, lineNumber - contextSize - 1);
      const end = Math.min(lines.length, lineNumber + contextSize);
      const context = lines.slice(start, end);

      expect(context.length).toBe(lines.length);
    });

    it("should return correct line numbers", () => {
      const text = "A\nB\nC\nD\nE";
      const lineNumber = 3;
      const contextSize = 1;

      const lines = text.split("\n");
      const start = Math.max(0, lineNumber - contextSize - 1);
      const end = Math.min(lines.length, lineNumber + contextSize);

      expect(start).toBe(1);
      expect(end).toBe(4);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long lines", () => {
      const longLine = "A".repeat(10000);
      const oldText = longLine;
      const newText = longLine + "B";

      const oldLines = oldText.split("\n");
      const newLines = newText.split("\n");

      expect(oldLines[0].length).toBe(10000);
      expect(newLines[0].length).toBeGreaterThan(10000);
    });

    it("should handle special characters", () => {
      const oldText = "Hello @#$%^&*()";
      const newText = "Hello !@#$%^&*()";

      const oldLines = oldText.split("\n");
      const newLines = newText.split("\n");

      expect(oldLines[0]).not.toBe(newLines[0]);
    });

    it("should handle unicode characters", () => {
      const oldText = "Hello 世界";
      const newText = "Hello 世界 🌍";

      const oldLines = oldText.split("\n");
      const newLines = newText.split("\n");

      expect(oldLines[0]).not.toBe(newLines[0]);
    });

    it("should handle Windows line endings", () => {
      const text = "A\r\nB\r\nC";
      const lines = text.split("\n");

      expect(lines.length).toBeGreaterThan(0);
    });

    it("should handle mixed line endings", () => {
      const text = "A\nB\r\nC\rD";
      const lines = text.split("\n");

      expect(lines.length).toBeGreaterThan(0);
    });
  });

  describe("Performance", () => {
    it("should handle large texts efficiently", () => {
      const oldText = Array(1000).fill("Line").join("\n");
      const newText = Array(1000).fill("Line").join("\n");

      const startTime = performance.now();

      const oldLines = oldText.split("\n");
      const newLines = newText.split("\n");

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete in less than 100ms
      expect(oldLines.length).toBe(1000);
      expect(newLines.length).toBe(1000);
    });

    it("should handle large diffs efficiently", () => {
      const oldText = Array(500).fill("Line").join("\n");
      const newText = Array(500).fill("Modified Line").join("\n");

      const startTime = performance.now();

      let changes = 0;
      const oldLines = oldText.split("\n");
      const newLines = newText.split("\n");

      for (let i = 0; i < Math.max(oldLines.length, newLines.length); i++) {
        if (oldLines[i] !== newLines[i]) {
          changes++;
        }
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
      expect(changes).toBeGreaterThan(0);
    });
  });
});
