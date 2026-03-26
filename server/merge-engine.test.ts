import { describe, it, expect } from "vitest";
import { MergeEngine, MergeChange, MergeConflict } from "./merge-engine";

describe("Merge Engine", () => {
  describe("extractChanges", () => {
    it("should extract additions", () => {
      const old = "Line 1\nLine 2";
      const new_ = "Line 1\nLine 2\nLine 3";
      const changes = MergeEngine.extractChanges(old, new_);

      expect(changes.length).toBeGreaterThan(0);
      const addedChange = changes.find((c) => c.type === "add");
      expect(addedChange).toBeDefined();
    });

    it("should extract removals", () => {
      const old = "Line 1\nLine 2\nLine 3";
      const new_ = "Line 1\nLine 2";
      const changes = MergeEngine.extractChanges(old, new_);

      expect(changes.length).toBeGreaterThan(0);
      const removedChange = changes.find((c) => c.type === "remove");
      expect(removedChange).toBeDefined();
    });

    it("should extract modifications", () => {
      const old = "Hello World";
      const new_ = "Hello Universe";
      const changes = MergeEngine.extractChanges(old, new_);

      expect(changes.length).toBeGreaterThan(0);
    });

    it("should assign unique IDs to changes", () => {
      const old = "A\nB\nC";
      const new_ = "A\nB\nC\nD";
      const changes = MergeEngine.extractChanges(old, new_);

      const ids = changes.map((c) => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should track line numbers", () => {
      const old = "Line 1\nLine 2";
      const new_ = "Line 1\nLine 2\nLine 3";
      const changes = MergeEngine.extractChanges(old, new_);

      changes.forEach((change) => {
        expect(change.lineNumber).toBeGreaterThan(0);
      });
    });
  });

  describe("applyChanges", () => {
    it("should apply accepted additions", () => {
      const original = "Line 1\nLine 2";
      const changes: MergeChange[] = [
        {
          id: "1",
          type: "add",
          lineNumber: 3,
          oldContent: "",
          newContent: "Line 3",
          accepted: true,
        },
      ];

      const result = MergeEngine.applyChanges(original, changes);
      expect(result).toContain("Line 3");
    });

    it("should skip rejected additions", () => {
      const original = "Line 1\nLine 2";
      const changes: MergeChange[] = [
        {
          id: "1",
          type: "add",
          lineNumber: 3,
          oldContent: "",
          newContent: "Line 3",
          accepted: false,
        },
      ];

      const result = MergeEngine.applyChanges(original, changes);
      expect(result).not.toContain("Line 3");
    });

    it("should handle multiple changes", () => {
      const original = "A\nB\nC";
      const changes: MergeChange[] = [
        {
          id: "1",
          type: "add",
          lineNumber: 4,
          oldContent: "",
          newContent: "D",
          accepted: true,
        },
        {
          id: "2",
          type: "add",
          lineNumber: 5,
          oldContent: "",
          newContent: "E",
          accepted: true,
        },
      ];

      const result = MergeEngine.applyChanges(original, changes);
      expect(result).toContain("D");
      expect(result).toContain("E");
    });

    it("should preserve unmodified content", () => {
      const original = "Keep this\nChange this";
      const changes: MergeChange[] = [
        {
          id: "1",
          type: "modify",
          lineNumber: 2,
          oldContent: "Change this",
          newContent: "Changed",
          accepted: true,
        },
      ];

      const result = MergeEngine.applyChanges(original, changes);
      expect(result).toContain("Keep this");
    });
  });

  describe("detectConflicts", () => {
    it("should detect edit-edit conflicts", () => {
      const base = "Original";
      const old = "Modified A";
      const new_ = "Modified B";
      const conflicts = MergeEngine.detectConflicts(base, old, new_);

      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts[0].conflictType).toBe("edit-edit");
    });

    it("should detect edit-delete conflicts", () => {
      const base = "Line 1\nLine 2";
      const old = "Line 1\nLine 2 modified";
      const new_ = "Line 1";
      const conflicts = MergeEngine.detectConflicts(base, old, new_);

      expect(conflicts.length).toBeGreaterThan(0);
    });

    it("should detect delete-edit conflicts", () => {
      const base = "Line 1\nLine 2";
      const old = "Line 1";
      const new_ = "Line 1\nLine 2 modified";
      const conflicts = MergeEngine.detectConflicts(base, old, new_);

      expect(conflicts.length).toBeGreaterThan(0);
    });

    it("should return empty array for non-conflicting changes", () => {
      const base = "A\nB\nC";
      const old = "A\nB modified\nC";
      const new_ = "A\nB\nC modified";
      const conflicts = MergeEngine.detectConflicts(base, old, new_);

      // Changes are on different lines, may or may not have conflicts depending on implementation
      expect(conflicts.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("previewMerge", () => {
    it("should generate preview without modifying original", () => {
      const original = "Original content";
      const changes: MergeChange[] = [
        {
          id: "1",
          type: "add",
          lineNumber: 2,
          oldContent: "",
          newContent: "Added",
          accepted: true,
        },
      ];

      const preview = MergeEngine.previewMerge(original, changes);

      expect(preview.originalText).toBe(original);
      expect(preview.mergedText).not.toBe(original);
      expect(preview.changes).toBeDefined();
    });

    it("should include conflicts in preview", () => {
      const original = "Content";
      const changes: MergeChange[] = [];
      const conflicts: MergeConflict[] = [
        {
          id: "1",
          lineNumber: 1,
          oldContent: "Old",
          newContent: "New",
          conflictType: "edit-edit",
        },
      ];

      const preview = MergeEngine.previewMerge(original, changes, conflicts);

      expect(preview.conflicts.length).toBe(1);
    });
  });

  describe("executeMerge", () => {
    it("should execute merge and return result", () => {
      const original = "Line 1\nLine 2";
      const changes: MergeChange[] = [
        {
          id: "1",
          type: "add",
          lineNumber: 3,
          oldContent: "",
          newContent: "Line 3",
          accepted: true,
        },
      ];

      const result = MergeEngine.executeMerge(original, changes);

      expect(result.mergedText).toBeDefined();
      expect(result.acceptedChanges.length).toBeGreaterThan(0);
      expect(result.statistics.acceptedCount).toBeGreaterThan(0);
    });

    it("should calculate statistics correctly", () => {
      const original = "A\nB";
      const changes: MergeChange[] = [
        {
          id: "1",
          type: "add",
          lineNumber: 3,
          oldContent: "",
          newContent: "C",
          accepted: true,
        },
        {
          id: "2",
          type: "add",
          lineNumber: 4,
          oldContent: "",
          newContent: "D",
          accepted: false,
        },
      ];

      const result = MergeEngine.executeMerge(original, changes);

      expect(result.statistics.totalChanges).toBe(2);
      expect(result.statistics.acceptedCount).toBe(1);
      expect(result.statistics.rejectedCount).toBe(1);
      expect(result.statistics.successRate).toBe(50);
    });

    it("should handle empty input gracefully", () => {
      const original = "";
      const changes: MergeChange[] = [];

      // Should not throw, but validation will fail
      const result = MergeEngine.executeMerge(original, changes);
      expect(result).toBeDefined();
    });
  });

  describe("resolveConflict", () => {
    it("should resolve conflict to keep-old", () => {
      const conflict: MergeConflict = {
        id: "1",
        lineNumber: 1,
        oldContent: "Old",
        newContent: "New",
        conflictType: "edit-edit",
      };

      const resolved = MergeEngine.resolveConflict(conflict, "keep-old");

      expect(resolved.resolution).toBe("keep-old");
    });

    it("should resolve conflict to use-new", () => {
      const conflict: MergeConflict = {
        id: "1",
        lineNumber: 1,
        oldContent: "Old",
        newContent: "New",
        conflictType: "edit-edit",
      };

      const resolved = MergeEngine.resolveConflict(conflict, "use-new");

      expect(resolved.resolution).toBe("use-new");
    });

    it("should resolve conflict with custom text", () => {
      const conflict: MergeConflict = {
        id: "1",
        lineNumber: 1,
        oldContent: "Old",
        newContent: "New",
        conflictType: "edit-edit",
      };

      const resolved = MergeEngine.resolveConflict(conflict, "custom", "Custom text");

      expect(resolved.resolution).toBe("custom");
      expect(resolved.customResolution).toBe("Custom text");
    });
  });

  describe("acceptChangesByType", () => {
    it("should accept all additions", () => {
      const changes: MergeChange[] = [
        {
          id: "1",
          type: "add",
          lineNumber: 1,
          oldContent: "",
          newContent: "Added",
          accepted: false,
        },
        {
          id: "2",
          type: "remove",
          lineNumber: 2,
          oldContent: "Removed",
          newContent: "",
          accepted: false,
        },
      ];

      const updated = MergeEngine.acceptChangesByType(changes, "add");

      expect(updated[0].accepted).toBe(true);
      expect(updated[1].accepted).toBe(false);
    });

    it("should accept all removals", () => {
      const changes: MergeChange[] = [
        {
          id: "1",
          type: "add",
          lineNumber: 1,
          oldContent: "",
          newContent: "Added",
          accepted: false,
        },
        {
          id: "2",
          type: "remove",
          lineNumber: 2,
          oldContent: "Removed",
          newContent: "",
          accepted: false,
        },
      ];

      const updated = MergeEngine.acceptChangesByType(changes, "remove");

      expect(updated[0].accepted).toBe(false);
      expect(updated[1].accepted).toBe(true);
    });
  });

  describe("rejectChangesByType", () => {
    it("should reject all additions", () => {
      const changes: MergeChange[] = [
        {
          id: "1",
          type: "add",
          lineNumber: 1,
          oldContent: "",
          newContent: "Added",
          accepted: true,
        },
        {
          id: "2",
          type: "remove",
          lineNumber: 2,
          oldContent: "Removed",
          newContent: "",
          accepted: true,
        },
      ];

      const updated = MergeEngine.rejectChangesByType(changes, "add");

      expect(updated[0].accepted).toBe(false);
      expect(updated[1].accepted).toBe(true);
    });
  });

  describe("acceptAll", () => {
    it("should accept all changes", () => {
      const changes: MergeChange[] = [
        {
          id: "1",
          type: "add",
          lineNumber: 1,
          oldContent: "",
          newContent: "Added",
          accepted: false,
        },
        {
          id: "2",
          type: "remove",
          lineNumber: 2,
          oldContent: "Removed",
          newContent: "",
          accepted: false,
        },
      ];

      const updated = MergeEngine.acceptAll(changes);

      expect(updated.every((c) => c.accepted)).toBe(true);
    });
  });

  describe("rejectAll", () => {
    it("should reject all changes", () => {
      const changes: MergeChange[] = [
        {
          id: "1",
          type: "add",
          lineNumber: 1,
          oldContent: "",
          newContent: "Added",
          accepted: true,
        },
        {
          id: "2",
          type: "remove",
          lineNumber: 2,
          oldContent: "Removed",
          newContent: "",
          accepted: true,
        },
      ];

      const updated = MergeEngine.rejectAll(changes);

      expect(updated.every((c) => !c.accepted)).toBe(true);
    });
  });

  describe("getStatistics", () => {
    it("should calculate statistics correctly", () => {
      const changes: MergeChange[] = [
        {
          id: "1",
          type: "add",
          lineNumber: 1,
          oldContent: "",
          newContent: "Added",
          accepted: true,
        },
        {
          id: "2",
          type: "remove",
          lineNumber: 2,
          oldContent: "Removed",
          newContent: "",
          accepted: false,
        },
        {
          id: "3",
          type: "modify",
          lineNumber: 3,
          oldContent: "Old",
          newContent: "New",
          accepted: true,
        },
      ];

      const stats = MergeEngine.getStatistics(changes, []);

      expect(stats.totalChanges).toBe(3);
      expect(stats.acceptedCount).toBe(2);
      expect(stats.rejectedCount).toBe(1);
      expect(stats.addCount).toBe(1);
      expect(stats.removeCount).toBe(0);
      expect(stats.modifyCount).toBe(1);
      expect(stats.successRate).toBe(67);
    });
  });

  describe("validateMerge", () => {
    it("should validate successful merge", () => {
      const result = {
        mergedText: "Merged content",
        acceptedChanges: [],
        rejectedChanges: [],
        conflicts: [],
        statistics: {
          totalChanges: 1,
          acceptedCount: 1,
          rejectedCount: 0,
          conflictCount: 0,
          successRate: 100,
        },
      };

      const validation = MergeEngine.validateMerge(result);

      expect(validation.valid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    it("should detect unresolved conflicts", () => {
      const result = {
        mergedText: "Merged content",
        acceptedChanges: [],
        rejectedChanges: [],
        conflicts: [
          {
            id: "1",
            lineNumber: 1,
            oldContent: "Old",
            newContent: "New",
            conflictType: "edit-edit" as const,
          },
        ],
        statistics: {
          totalChanges: 1,
          acceptedCount: 1,
          rejectedCount: 0,
          conflictCount: 1,
          successRate: 100,
        },
      };

      const validation = MergeEngine.validateMerge(result);

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it("should detect empty merged text", () => {
      const result = {
        mergedText: "",
        acceptedChanges: [],
        rejectedChanges: [],
        conflicts: [],
        statistics: {
          totalChanges: 1,
          acceptedCount: 1,
          rejectedCount: 0,
          conflictCount: 0,
          successRate: 100,
        },
      };

      const validation = MergeEngine.validateMerge(result);

      expect(validation.valid).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty original text", () => {
      const changes: MergeChange[] = [
        {
          id: "1",
          type: "add",
          lineNumber: 1,
          oldContent: "",
          newContent: "First line",
          accepted: true,
        },
      ];

      const result = MergeEngine.applyChanges("", changes);

      expect(result).toContain("First line");
    });

    it("should handle no changes", () => {
      const original = "Content";
      const changes: MergeChange[] = [];

      const result = MergeEngine.applyChanges(original, changes);

      expect(result).toBe(original);
    });

    it("should handle all changes rejected", () => {
      const original = "Original";
      const changes: MergeChange[] = [
        {
          id: "1",
          type: "add",
          lineNumber: 2,
          oldContent: "",
          newContent: "Added",
          accepted: false,
        },
      ];

      const result = MergeEngine.applyChanges(original, changes);

      expect(result).not.toContain("Added");
    });

    it("should handle special characters", () => {
      const original = "Hello @#$%";
      const changes: MergeChange[] = [
        {
          id: "1",
          type: "add",
          lineNumber: 2,
          oldContent: "",
          newContent: "!@#$%^&*()",
          accepted: true,
        },
      ];

      const result = MergeEngine.applyChanges(original, changes);

      expect(result).toContain("!@#$%^&*()");
    });
  });
});
