import { diffTexts } from "./diff-engine";

export interface MergeChange {
  id: string;
  type: "add" | "remove" | "modify";
  lineNumber: number;
  oldContent: string;
  newContent: string;
  accepted: boolean;
}

export interface MergeConflict {
  id: string;
  lineNumber: number;
  oldContent: string;
  newContent: string;
  conflictType: "edit-edit" | "edit-delete" | "delete-edit";
  resolution?: "keep-old" | "use-new" | "custom";
  customResolution?: string;
}

export interface MergeResult {
  mergedText: string;
  acceptedChanges: MergeChange[];
  rejectedChanges: MergeChange[];
  conflicts: MergeConflict[];
  statistics: {
    totalChanges: number;
    acceptedCount: number;
    rejectedCount: number;
    conflictCount: number;
    successRate: number;
  };
}

export interface MergePreview {
  originalText: string;
  mergedText: string;
  changes: MergeChange[];
  conflicts: MergeConflict[];
}

/**
 * Merge engine for selective change acceptance/rejection
 */
export class MergeEngine {
  /**
   * Extract changes from diff for selective merging
   */
  static extractChanges(oldText: string, newText: string): MergeChange[] {
    const diff = diffTexts(oldText, newText);
    const changes: MergeChange[] = [];
    let changeId = 0;

    diff.lineDiffs.forEach((lineDiff) => {
      if (lineDiff.type === "add") {
        changes.push({
          id: `change-${changeId++}`,
          type: "add",
          lineNumber: lineDiff.lineNumber,
          oldContent: "",
          newContent: lineDiff.newContent || "",
          accepted: false,
        });
      } else if (lineDiff.type === "remove") {
        changes.push({
          id: `change-${changeId++}`,
          type: "remove",
          lineNumber: lineDiff.lineNumber,
          oldContent: lineDiff.oldContent || "",
          newContent: "",
          accepted: false,
        });
      } else if (lineDiff.type === "equal") {
        // Mark equal lines as automatically accepted
        changes.push({
          id: `change-${changeId++}`,
          type: "modify",
          lineNumber: lineDiff.lineNumber,
          oldContent: lineDiff.oldContent || "",
          newContent: lineDiff.newContent || "",
          accepted: true,
        });
      }
    });

    return changes;
  }

  /**
   * Apply selective changes to create merged text
   */
  static applyChanges(
    originalText: string,
    changes: MergeChange[],
    conflicts: MergeConflict[] = []
  ): string {
    const lines = originalText.split("\n");
    const resultLines: string[] = [];
    const processedLines = new Set<number>();

    // Process each change
    changes.forEach((change) => {
      if (change.accepted) {
        if (change.type === "add") {
          resultLines.push(change.newContent);
        } else if (change.type === "modify") {
          resultLines.push(change.newContent);
          processedLines.add(change.lineNumber);
        }
        // Skip removed lines
      }
    });

    // Add original lines that weren't modified
    lines.forEach((line, idx) => {
      if (!processedLines.has(idx + 1)) {
        const hasChange = changes.some((c) => c.lineNumber === idx + 1);
        if (!hasChange) {
          resultLines.push(line);
        }
      }
    });

    // Apply conflict resolutions
    conflicts.forEach((conflict) => {
      if (conflict.resolution === "keep-old") {
        // Keep old content (already in result)
      } else if (conflict.resolution === "use-new") {
        const idx = resultLines.findIndex((l) => l === conflict.oldContent);
        if (idx !== -1) {
          resultLines[idx] = conflict.newContent;
        }
      } else if (conflict.resolution === "custom" && conflict.customResolution) {
        const idx = resultLines.findIndex((l) => l === conflict.oldContent);
        if (idx !== -1) {
          resultLines[idx] = conflict.customResolution;
        }
      }
    });

    return resultLines.join("\n");
  }

  /**
   * Detect conflicts between versions
   */
  static detectConflicts(
    baseText: string,
    oldText: string,
    newText: string
  ): MergeConflict[] {
    const conflicts: MergeConflict[] = [];
    const baseDiff = diffTexts(baseText, oldText);
    const newDiff = diffTexts(baseText, newText);

    // Find lines that were modified in both versions
    const baseLines = baseText.split("\n");
    const oldLines = oldText.split("\n");
    const newLines = newText.split("\n");

    baseLines.forEach((baseLine, idx) => {
      const oldLine = oldLines[idx];
      const newLine = newLines[idx];

      if (baseLine !== oldLine && baseLine !== newLine && oldLine !== newLine) {
        // Edit-edit conflict
        conflicts.push({
          id: `conflict-${idx}`,
          lineNumber: idx + 1,
          oldContent: oldLine || "",
          newContent: newLine || "",
          conflictType: "edit-edit",
        });
      } else if (baseLine !== oldLine && baseLine === newLine) {
        // Edit-delete conflict (deleted in new, modified in old)
        conflicts.push({
          id: `conflict-${idx}`,
          lineNumber: idx + 1,
          oldContent: oldLine || "",
          newContent: newLine || "",
          conflictType: "edit-delete",
        });
      } else if (baseLine === oldLine && baseLine !== newLine) {
        // Delete-edit conflict (deleted in old, modified in new)
        conflicts.push({
          id: `conflict-${idx}`,
          lineNumber: idx + 1,
          oldContent: oldLine || "",
          newContent: newLine || "",
          conflictType: "delete-edit",
        });
      }
    });

    return conflicts;
  }

  /**
   * Preview merge result before applying
   */
  static previewMerge(
    originalText: string,
    changes: MergeChange[],
    conflicts: MergeConflict[] = []
  ): MergePreview {
    const mergedText = this.applyChanges(originalText, changes, conflicts);

    return {
      originalText,
      mergedText,
      changes,
      conflicts,
    };
  }

  /**
   * Execute merge and return result
   */
  static executeMerge(
    originalText: string,
    changes: MergeChange[],
    conflicts: MergeConflict[] = []
  ): MergeResult {
    const mergedText = this.applyChanges(originalText, changes, conflicts);
    const acceptedChanges = changes.filter((c) => c.accepted);
    const rejectedChanges = changes.filter((c) => !c.accepted);

    const statistics = {
      totalChanges: changes.length,
      acceptedCount: acceptedChanges.length,
      rejectedCount: rejectedChanges.length,
      conflictCount: conflicts.length,
      successRate:
        changes.length > 0 ? Math.round((acceptedChanges.length / changes.length) * 100) : 0,
    };

    return {
      mergedText,
      acceptedChanges,
      rejectedChanges,
      conflicts,
      statistics,
    };
  }

  /**
   * Resolve a specific conflict
   */
  static resolveConflict(
    conflict: MergeConflict,
    resolution: "keep-old" | "use-new" | "custom",
    customText?: string
  ): MergeConflict {
    return {
      ...conflict,
      resolution,
      customResolution: customText,
    };
  }

  /**
   * Batch accept changes by type
   */
  static acceptChangesByType(changes: MergeChange[], type: "add" | "remove" | "modify"): MergeChange[] {
    return changes.map((c) => ({
      ...c,
      accepted: c.type === type ? true : c.accepted,
    }));
  }

  /**
   * Batch reject changes by type
   */
  static rejectChangesByType(changes: MergeChange[], type: "add" | "remove" | "modify"): MergeChange[] {
    return changes.map((c) => ({
      ...c,
      accepted: c.type === type ? false : c.accepted,
    }));
  }

  /**
   * Accept all changes
   */
  static acceptAll(changes: MergeChange[]): MergeChange[] {
    return changes.map((c) => ({ ...c, accepted: true }));
  }

  /**
   * Reject all changes
   */
  static rejectAll(changes: MergeChange[]): MergeChange[] {
    return changes.map((c) => ({ ...c, accepted: false }));
  }

  /**
   * Get merge statistics
   */
  static getStatistics(changes: MergeChange[], conflicts: MergeConflict[]) {
    const acceptedCount = changes.filter((c) => c.accepted).length;
    const rejectedCount = changes.filter((c) => !c.accepted).length;
    const addCount = changes.filter((c) => c.type === "add" && c.accepted).length;
    const removeCount = changes.filter((c) => c.type === "remove" && c.accepted).length;
    const modifyCount = changes.filter((c) => c.type === "modify" && c.accepted).length;

    return {
      totalChanges: changes.length,
      acceptedCount,
      rejectedCount,
      conflictCount: conflicts.length,
      addCount,
      removeCount,
      modifyCount,
      successRate: changes.length > 0 ? Math.round((acceptedCount / changes.length) * 100) : 0,
    };
  }

  /**
   * Validate merge result
   */
  static validateMerge(mergeResult: MergeResult): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!mergeResult.mergedText) {
      errors.push("Merged text is empty");
    }

    if (mergeResult.conflicts.length > 0) {
      const unresolvedConflicts = mergeResult.conflicts.filter((c) => !c.resolution);
      if (unresolvedConflicts.length > 0) {
        errors.push(`${unresolvedConflicts.length} unresolved conflicts`);
      }
    }

    if (mergeResult.statistics.totalChanges === 0) {
      errors.push("No changes to merge");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
