import { describe, it, expect } from "vitest";
import { diffTexts, generateUnifiedDiff, mergeDiffStatistics, diffPages } from "./diff-engine";

describe("Diff Engine", () => {
  describe("diffTexts - Basic Functionality", () => {
    it("should detect identical texts", () => {
      const text = "Hello World";
      const result = diffTexts(text, text);

      expect(result.statistics.similarity).toBe(100);
      expect(result.statistics.linesAdded).toBe(0);
      expect(result.statistics.linesRemoved).toBe(0);
    });

    it("should detect completely different texts", () => {
      const old = "Hello";
      const new_ = "Goodbye";
      const result = diffTexts(old, new_);

      expect(result.statistics.similarity).toBeLessThan(100);
      expect(result.statistics.linesAdded).toBeGreaterThan(0);
      expect(result.statistics.linesRemoved).toBeGreaterThan(0);
    });

    it("should detect added lines", () => {
      const old = "Line 1\nLine 2";
      const new_ = "Line 1\nLine 2\nLine 3";
      const result = diffTexts(old, new_);

      expect(result.statistics.linesAdded).toBeGreaterThan(0);
      expect(result.statistics.linesRemoved).toBe(0);
    });

    it("should detect removed lines", () => {
      const old = "Line 1\nLine 2\nLine 3";
      const new_ = "Line 1\nLine 2";
      const result = diffTexts(old, new_);

      expect(result.statistics.linesRemoved).toBeGreaterThan(0);
      expect(result.statistics.linesAdded).toBe(0);
    });

    it("should detect modified lines", () => {
      const old = "Hello World";
      const new_ = "Hello Universe";
      const result = diffTexts(old, new_);

      expect(result.statistics.linesModified).toBeGreaterThan(0);
    });
  });

  describe("diffTexts - Word-Level Detection", () => {
    it("should detect added words", () => {
      const old = "The quick fox";
      const new_ = "The quick brown fox";
      const result = diffTexts(old, new_);

      expect(result.statistics.wordsAdded).toBeGreaterThan(0);
    });

    it("should detect removed words", () => {
      const old = "The quick brown fox";
      const new_ = "The quick fox";
      const result = diffTexts(old, new_);

      expect(result.statistics.wordsRemoved).toBeGreaterThan(0);
    });

    it("should count word changes accurately", () => {
      const old = "cat dog bird";
      const new_ = "cat fish bird";
      const result = diffTexts(old, new_);

      expect(result.statistics.wordsAdded).toBeGreaterThan(0);
      expect(result.statistics.wordsRemoved).toBeGreaterThan(0);
    });
  });

  describe("diffTexts - Character-Level Detection", () => {
    it("should count added characters", () => {
      const old = "abc";
      const new_ = "abcdef";
      const result = diffTexts(old, new_);

      expect(result.statistics.charactersAdded).toBeGreaterThan(0);
    });

    it("should count removed characters", () => {
      const old = "abcdef";
      const new_ = "abc";
      const result = diffTexts(old, new_);

      expect(result.statistics.charactersRemoved).toBeGreaterThan(0);
    });

    it("should calculate character counts correctly", () => {
      const old = "Hello";
      const new_ = "Hello World";
      const result = diffTexts(old, new_);

      expect(result.statistics.charactersAdded).toBeGreaterThan(0);
    });
  });

  describe("diffTexts - Line Diffs", () => {
    it("should include line numbers in diffs", () => {
      const old = "Line 1\nLine 2";
      const new_ = "Line 1\nLine 2\nLine 3";
      const result = diffTexts(old, new_);

      result.lineDiffs.forEach((diff) => {
        expect(diff.lineNumber).toBeGreaterThan(0);
      });
    });

    it("should preserve line content in diffs", () => {
      const old = "Hello\nWorld";
      const new_ = "Hello\nWorld";
      const result = diffTexts(old, new_);

      expect(result.lineDiffs.length).toBeGreaterThan(0);
      result.lineDiffs.forEach((diff) => {
        expect(diff.oldContent || diff.newContent).toBeDefined();
      });
    });

    it("should mark equal lines correctly", () => {
      const old = "Same\nDifferent";
      const new_ = "Same\nChanged";
      const result = diffTexts(old, new_);

      const equalDiffs = result.lineDiffs.filter((d) => d.type === "equal");
      expect(equalDiffs.length).toBeGreaterThan(0);
    });
  });

  describe("diffTexts - Statistics", () => {
    it("should calculate similarity percentage", () => {
      const old = "The quick brown fox jumps over the lazy dog";
      const new_ = "The quick brown fox jumps over the lazy dog";
      const result = diffTexts(old, new_);

      expect(result.statistics.similarity).toBe(100);
    });

    it("should calculate total lines", () => {
      const old = "Line 1\nLine 2\nLine 3";
      const new_ = "Line 1\nLine 2\nLine 3";
      const result = diffTexts(old, new_);

      expect(result.statistics.totalLines).toBeGreaterThanOrEqual(3);
    });

    it("should calculate total words", () => {
      const old = "one two three";
      const new_ = "one two three";
      const result = diffTexts(old, new_);

      expect(result.statistics.totalWords).toBeGreaterThanOrEqual(3);
    });

    it("should calculate total characters", () => {
      const old = "abc";
      const new_ = "abc";
      const result = diffTexts(old, new_);

      expect(result.statistics.totalCharacters).toBeGreaterThanOrEqual(3);
    });
  });

  describe("generateUnifiedDiff", () => {
    it("should generate unified diff format", () => {
      const old = "Line 1\nLine 2\nLine 3";
      const new_ = "Line 1\nLine 2 modified\nLine 3";
      const unifiedDiff = generateUnifiedDiff(old, new_);

      expect(unifiedDiff).toContain("--- old");
      expect(unifiedDiff).toContain("+++ new");
      expect(unifiedDiff).toContain("@@");
    });

    it("should include context lines", () => {
      const old = "Line 1\nLine 2\nLine 3\nLine 4\nLine 5";
      const new_ = "Line 1\nLine 2\nLine 3 modified\nLine 4\nLine 5";
      const unifiedDiff = generateUnifiedDiff(old, new_, 2);

      expect(unifiedDiff.length).toBeGreaterThan(0);
    });

    it("should respect context parameter", () => {
      const old = "A\nB\nC\nD\nE";
      const new_ = "A\nB\nC modified\nD\nE";
      const diff1 = generateUnifiedDiff(old, new_, 1);
      const diff2 = generateUnifiedDiff(old, new_, 3);

      expect(diff1.length).toBeGreaterThan(0);
      expect(diff2.length).toBeGreaterThan(0);
    });
  });

  describe("diffPages", () => {
    it("should diff multiple pages", () => {
      const oldPages = [
        { id: 1, content: "Page 1 content" },
        { id: 2, content: "Page 2 content" },
      ];
      const newPages = [
        { id: 1, content: "Page 1 content" },
        { id: 2, content: "Page 2 modified content" },
      ];

      const diffs = diffPages(oldPages, newPages);

      expect(diffs.size).toBe(2);
      expect(diffs.has(1)).toBe(true);
      expect(diffs.has(2)).toBe(true);
    });

    it("should handle added pages", () => {
      const oldPages = [{ id: 1, content: "Page 1" }];
      const newPages = [
        { id: 1, content: "Page 1" },
        { id: 2, content: "Page 2" },
      ];

      const diffs = diffPages(oldPages, newPages);

      expect(diffs.size).toBe(2);
      expect(diffs.has(2)).toBe(true);
    });

    it("should handle removed pages", () => {
      const oldPages = [
        { id: 1, content: "Page 1" },
        { id: 2, content: "Page 2" },
      ];
      const newPages = [{ id: 1, content: "Page 1" }];

      const diffs = diffPages(oldPages, newPages);

      expect(diffs.size).toBe(2);
      expect(diffs.has(2)).toBe(true);
    });
  });

  describe("mergeDiffStatistics", () => {
    it("should merge multiple diff statistics", () => {
      const diff1 = diffTexts("Hello", "Hello World");
      const diff2 = diffTexts("Foo", "Foo Bar");

      const merged = mergeDiffStatistics([diff1, diff2]);

      expect(merged.linesAdded).toBeGreaterThan(0);
      expect(merged.similarity).toBeGreaterThan(0);
    });

    it("should calculate average similarity", () => {
      const diff1 = diffTexts("Same text", "Same text");
      const diff2 = diffTexts("Old", "New");

      const merged = mergeDiffStatistics([diff1, diff2]);

      expect(merged.similarity).toBeGreaterThan(0);
      expect(merged.similarity).toBeLessThanOrEqual(100);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty strings", () => {
      const result = diffTexts("", "");

      expect(result.statistics.similarity).toBe(100);
      expect(result.statistics.linesAdded).toBe(0);
    });

    it("should handle single character", () => {
      const result = diffTexts("a", "b");

      expect(result.statistics.similarity).toBeLessThan(100);
    });

    it("should handle very long texts", () => {
      const longText = "Line\n".repeat(1000);
      const result = diffTexts(longText, longText);

      expect(result.statistics.similarity).toBe(100);
    });

    it("should handle special characters", () => {
      const old = "Hello @#$%";
      const new_ = "Hello @#$% World";
      const result = diffTexts(old, new_);

      expect(result.statistics.linesAdded).toBeGreaterThan(0);
    });

    it("should handle unicode characters", () => {
      const old = "Hello 世界";
      const new_ = "Hello 世界 🌍";
      const result = diffTexts(old, new_);

      expect(result.statistics.charactersAdded).toBeGreaterThan(0);
    });

    it("should handle whitespace differences", () => {
      const old = "Hello World";
      const new_ = "Hello  World";
      const result = diffTexts(old, new_);

      expect(result.statistics.similarity).toBeGreaterThan(0);
    });

    it("should handle line ending differences", () => {
      const old = "Line 1\nLine 2";
      const new_ = "Line 1\r\nLine 2";
      const result = diffTexts(old, new_);

      expect(result.lineDiffs.length).toBeGreaterThan(0);
    });
  });

  describe("Performance", () => {
    it("should handle large text efficiently", () => {
      const largeText = "The quick brown fox jumps over the lazy dog. ".repeat(100);
      const modifiedText = largeText + "Extra content.";

      const start = Date.now();
      const result = diffTexts(largeText, modifiedText);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
      expect(result.statistics.linesAdded).toBeGreaterThan(0);
    });
  });

  describe("Diff Accuracy", () => {
    it("should correctly identify all changes", () => {
      const old = "The cat sat on the mat";
      const new_ = "The dog sat on the mat";
      const result = diffTexts(old, new_);

      expect(result.statistics.wordsRemoved).toBeGreaterThan(0);
      expect(result.statistics.wordsAdded).toBeGreaterThan(0);
    });

    it("should preserve unchanged content", () => {
      const old = "Line 1\nLine 2\nLine 3";
      const new_ = "Line 1\nLine 2 modified\nLine 3";
      const result = diffTexts(old, new_);

      const equalDiffs = result.lineDiffs.filter((d) => d.type === "equal");
      expect(equalDiffs.length).toBeGreaterThan(0);
    });

    it("should handle multiple consecutive changes", () => {
      const old = "A B C D E";
      const new_ = "A X Y Z E";
      const result = diffTexts(old, new_);

      expect(result.statistics.wordsRemoved).toBeGreaterThan(0);
      expect(result.statistics.wordsAdded).toBeGreaterThan(0);
    });
  });
});
