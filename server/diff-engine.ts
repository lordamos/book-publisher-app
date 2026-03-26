/**
 * Diff Engine - Text comparison and visualization
 * Implements Myers' diff algorithm for efficient text comparison
 */

export type DiffType = "add" | "remove" | "equal";

export interface DiffSegment {
  type: DiffType;
  content: string;
  lineNumber?: number;
  charStart?: number;
  charEnd?: number;
}

export interface LineDiff {
  lineNumber: number;
  type: DiffType;
  oldContent?: string;
  newContent?: string;
  changes: DiffSegment[];
}

export interface DiffResult {
  oldText: string;
  newText: string;
  lineDiffs: LineDiff[];
  wordDiffs: DiffSegment[];
  statistics: DiffStatistics;
}

export interface DiffStatistics {
  totalLines: number;
  linesAdded: number;
  linesRemoved: number;
  linesModified: number;
  totalWords: number;
  wordsAdded: number;
  wordsRemoved: number;
  totalCharacters: number;
  charactersAdded: number;
  charactersRemoved: number;
  similarity: number; // 0-100 percentage
}

/**
 * Split text into lines
 */
function splitLines(text: string): string[] {
  return text.split("\n");
}

/**
 * Split text into words
 */
function splitWords(text: string): string[] {
  return text.match(/\S+|\s+/g) || [];
}

/**
 * Myers' diff algorithm - finds longest common subsequence
 */
function myersDiff(oldLines: string[], newLines: string[]): Array<[DiffType, string]> {
  const diffs: Array<[DiffType, string]> = [];
  const oldLen = oldLines.length;
  const newLen = newLines.length;

  // Create a 2D array for dynamic programming
  const dp: number[][] = Array(oldLen + 1)
    .fill(null)
    .map(() => Array(newLen + 1).fill(0));

  // Fill the DP table
  for (let i = 1; i <= oldLen; i++) {
    for (let j = 1; j <= newLen; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find the diff
  let i = oldLen;
  let j = newLen;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      diffs.unshift(["equal", oldLines[i - 1]]);
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diffs.unshift(["add", newLines[j - 1]]);
      j--;
    } else if (i > 0) {
      diffs.unshift(["remove", oldLines[i - 1]]);
      i--;
    }
  }

  return diffs;
}

/**
 * Compare two texts at word level
 */
function wordLevelDiff(oldText: string, newText: string): DiffSegment[] {
  const oldWords = splitWords(oldText);
  const newWords = splitWords(newText);

  const diffs: DiffSegment[] = [];
  const oldLen = oldWords.length;
  const newLen = newWords.length;

  // Create DP table for word-level diff
  const dp: number[][] = Array(oldLen + 1)
    .fill(null)
    .map(() => Array(newLen + 1).fill(0));

  for (let i = 1; i <= oldLen; i++) {
    for (let j = 1; j <= newLen; j++) {
      if (oldWords[i - 1] === newWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack
  let i = oldLen;
  let j = newLen;
  let charPos = 0;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldWords[i - 1] === newWords[j - 1]) {
      diffs.unshift({
        type: "equal",
        content: oldWords[i - 1],
        charStart: charPos,
        charEnd: charPos + oldWords[i - 1].length,
      });
      charPos += oldWords[i - 1].length;
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diffs.unshift({
        type: "add",
        content: newWords[j - 1],
        charStart: charPos,
        charEnd: charPos + newWords[j - 1].length,
      });
      charPos += newWords[j - 1].length;
      j--;
    } else if (i > 0) {
      diffs.unshift({
        type: "remove",
        content: oldWords[i - 1],
        charStart: charPos,
        charEnd: charPos + oldWords[i - 1].length,
      });
      charPos += oldWords[i - 1].length;
      i--;
    }
  }

  return diffs;
}

/**
 * Calculate similarity percentage between two texts
 */
function calculateSimilarity(oldText: string, newText: string): number {
  if (oldText === newText) return 100;

  const oldLen = oldText.length;
  const newLen = newText.length;
  const maxLen = Math.max(oldLen, newLen);

  if (maxLen === 0) return 100;

  // Levenshtein distance
  const dp: number[][] = Array(oldLen + 1)
    .fill(null)
    .map(() => Array(newLen + 1).fill(0));

  for (let i = 0; i <= oldLen; i++) dp[i][0] = i;
  for (let j = 0; j <= newLen; j++) dp[0][j] = j;

  for (let i = 1; i <= oldLen; i++) {
    for (let j = 1; j <= newLen; j++) {
      if (oldText[i - 1] === newText[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  const distance = dp[oldLen][newLen];
  const similarity = ((maxLen - distance) / maxLen) * 100;

  return Math.max(0, Math.min(100, similarity));
}

/**
 * Main diff function - compares two texts and returns detailed diff
 */
export function diffTexts(oldText: string, newText: string): DiffResult {
  const oldLines = splitLines(oldText);
  const newLines = splitLines(newText);

  // Get line-level diffs
  const lineDiffPairs = myersDiff(oldLines, newLines);

  // Convert to LineDiff format
  const lineDiffs: LineDiff[] = [];
  let oldLineNum = 0;
  let newLineNum = 0;

  for (const [type, content] of lineDiffPairs) {
    if (type === "equal") {
      oldLineNum++;
      newLineNum++;
      lineDiffs.push({
        lineNumber: newLineNum,
        type: "equal",
        oldContent: content,
        newContent: content,
        changes: [{ type: "equal", content }],
      });
    } else if (type === "remove") {
      oldLineNum++;
      lineDiffs.push({
        lineNumber: oldLineNum,
        type: "remove",
        oldContent: content,
        changes: [{ type: "remove", content }],
      });
    } else {
      newLineNum++;
      lineDiffs.push({
        lineNumber: newLineNum,
        type: "add",
        newContent: content,
        changes: [{ type: "add", content }],
      });
    }
  }

  // Get word-level diffs for modified lines
  const wordDiffs = wordLevelDiff(oldText, newText);

  // Calculate statistics
  const linesAdded = lineDiffs.filter((d) => d.type === "add").length;
  const linesRemoved = lineDiffs.filter((d) => d.type === "remove").length;
  const linesModified = lineDiffs.filter((d) => d.type !== "equal").length;

  const wordsAdded = wordDiffs.filter((d) => d.type === "add").length;
  const wordsRemoved = wordDiffs.filter((d) => d.type === "remove").length;

  const charsAdded = wordDiffs
    .filter((d) => d.type === "add")
    .reduce((sum, d) => sum + d.content.length, 0);
  const charsRemoved = wordDiffs
    .filter((d) => d.type === "remove")
    .reduce((sum, d) => sum + d.content.length, 0);

  const similarity = calculateSimilarity(oldText, newText);

  return {
    oldText,
    newText,
    lineDiffs,
    wordDiffs,
    statistics: {
      totalLines: Math.max(oldLines.length, newLines.length),
      linesAdded,
      linesRemoved,
      linesModified,
      totalWords: Math.max(splitWords(oldText).length, splitWords(newText).length),
      wordsAdded,
      wordsRemoved,
      totalCharacters: Math.max(oldText.length, newText.length),
      charactersAdded: charsAdded,
      charactersRemoved: charsRemoved,
      similarity: Math.round(similarity),
    },
  };
}

/**
 * Diff multiple pages from two versions
 */
export function diffPages(
  oldPages: Array<{ id: number; content: string }>,
  newPages: Array<{ id: number; content: string }>
): Map<number, DiffResult> {
  const diffs = new Map<number, DiffResult>();

  // Create maps for easy lookup
  const oldPageMap = new Map(oldPages.map((p) => [p.id, p.content]));
  const newPageMap = new Map(newPages.map((p) => [p.id, p.content]));

  // Get all page IDs
  const allPageIds = new Set<number>();
  oldPageMap.forEach((_, id) => allPageIds.add(id));
  newPageMap.forEach((_, id) => allPageIds.add(id));

  // Diff each page
  allPageIds.forEach((pageId) => {
    const oldContent = oldPageMap.get(pageId) || "";
    const newContent = newPageMap.get(pageId) || "";
    diffs.set(pageId, diffTexts(oldContent, newContent));
  });

  return diffs;
}

/**
 * Generate a unified diff format (like git diff)
 */
export function generateUnifiedDiff(oldText: string, newText: string, context = 3): string {
  const diff = diffTexts(oldText, newText);
  const lines: string[] = [];

  lines.push("--- old");
  lines.push("+++ new");

  let hunkStart = 0;
  let hunkLines: string[] = [];

  for (let i = 0; i < diff.lineDiffs.length; i++) {
    const lineDiff = diff.lineDiffs[i];

    if (lineDiff.type === "equal") {
      hunkLines.push(` ${lineDiff.oldContent}`);
    } else if (lineDiff.type === "remove") {
      hunkLines.push(`-${lineDiff.oldContent}`);
    } else {
      hunkLines.push(`+${lineDiff.newContent}`);
    }

    // Output hunk when we have enough context
    if (
      (lineDiff.type !== "equal" && hunkLines.length > context * 2) ||
      i === diff.lineDiffs.length - 1
    ) {
      if (hunkLines.length > 0) {
        lines.push(`@@ -${hunkStart},${hunkLines.length} +${hunkStart},${hunkLines.length} @@`);
        lines.push(...hunkLines);
        hunkLines = [];
        hunkStart = i + 1;
      }
    }
  }

  return lines.join("\n");
}


/**
 * Merge multiple diffs into a summary
 */
export function mergeDiffStatistics(diffs: DiffResult[]): DiffStatistics {
  return {
    totalLines: diffs.reduce((sum, d) => sum + d.statistics.totalLines, 0),
    linesAdded: diffs.reduce((sum, d) => sum + d.statistics.linesAdded, 0),
    linesRemoved: diffs.reduce((sum, d) => sum + d.statistics.linesRemoved, 0),
    linesModified: diffs.reduce((sum, d) => sum + d.statistics.linesModified, 0),
    totalWords: diffs.reduce((sum, d) => sum + d.statistics.totalWords, 0),
    wordsAdded: diffs.reduce((sum, d) => sum + d.statistics.wordsAdded, 0),
    wordsRemoved: diffs.reduce((sum, d) => sum + d.statistics.wordsRemoved, 0),
    totalCharacters: diffs.reduce((sum, d) => sum + d.statistics.totalCharacters, 0),
    charactersAdded: diffs.reduce((sum, d) => sum + d.statistics.charactersAdded, 0),
    charactersRemoved: diffs.reduce((sum, d) => sum + d.statistics.charactersRemoved, 0),
    similarity: Math.round(
      diffs.reduce((sum, d) => sum + d.statistics.similarity, 0) / diffs.length
    ),
  };
}
