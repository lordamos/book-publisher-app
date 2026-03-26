import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Copy, Download } from "lucide-react";

interface DiffSegment {
  type: "add" | "remove" | "equal";
  content: string;
}

interface DiffStatistics {
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
  similarity: number;
}

interface LineDiff {
  lineNumber: number;
  type: "add" | "remove" | "equal";
  oldContent?: string;
  newContent?: string;
  changes: DiffSegment[];
}

interface DiffResult {
  oldText: string;
  newText: string;
  lineDiffs: LineDiff[];
  wordDiffs: DiffSegment[];
  statistics: DiffStatistics;
}

interface VisualDiffViewerProps {
  diff: DiffResult;
  viewMode?: "side-by-side" | "unified";
  onCopy?: () => void;
  onDownload?: () => void;
}

/**
 * Renders a single diff segment with appropriate styling
 */
function DiffSegmentRenderer({ segment }: { segment: DiffSegment }) {
  if (segment.type === "equal") {
    return <span className="text-foreground">{segment.content}</span>;
  } else if (segment.type === "add") {
    return (
      <span className="bg-green-200 dark:bg-green-900 text-green-900 dark:text-green-200 px-1 rounded">
        {segment.content}
      </span>
    );
  } else {
    return (
      <span className="bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-200 px-1 rounded line-through">
        {segment.content}
      </span>
    );
  }
}

/**
 * Side-by-side diff view
 */
function SideBySideDiffView({ diff }: { diff: DiffResult }) {
  const oldLines = diff.oldText.split("\n");
  const newLines = diff.newText.split("\n");

  return (
    <div className="grid grid-cols-2 gap-4 font-mono text-sm">
      {/* Old version */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="bg-muted p-2 border-b border-border font-semibold">Original</div>
        <div className="p-4 space-y-1 max-h-96 overflow-y-auto">
          {oldLines.map((line, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-muted-foreground w-8 text-right">{idx + 1}</span>
              <span className="flex-1 break-words">{line}</span>
            </div>
          ))}
        </div>
      </div>

      {/* New version */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="bg-muted p-2 border-b border-border font-semibold">Modified</div>
        <div className="p-4 space-y-1 max-h-96 overflow-y-auto">
          {newLines.map((line, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-muted-foreground w-8 text-right">{idx + 1}</span>
              <span className="flex-1 break-words">{line}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Unified diff view (git-style)
 */
function UnifiedDiffView({ diff }: { diff: DiffResult }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden font-mono text-sm">
      <div className="bg-muted p-2 border-b border-border font-semibold">Unified Diff</div>
      <div className="p-4 space-y-1 max-h-96 overflow-y-auto">
        {diff.lineDiffs.map((lineDiff, idx) => {
          if (lineDiff.type === "equal") {
            return (
              <div key={idx} className="flex gap-2 text-foreground">
                <span className="w-8 text-right text-muted-foreground">{lineDiff.lineNumber}</span>
                <span className="text-muted-foreground">•</span>
                <span className="flex-1 break-words">{lineDiff.oldContent}</span>
              </div>
            );
          } else if (lineDiff.type === "add") {
            return (
              <div key={idx} className="flex gap-2 bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-200">
                <span className="w-8 text-right">+</span>
                <span className="text-muted-foreground">+</span>
                <span className="flex-1 break-words">{lineDiff.newContent}</span>
              </div>
            );
          } else {
            return (
              <div key={idx} className="flex gap-2 bg-red-100 dark:bg-red-950 text-red-900 dark:text-red-200">
                <span className="w-8 text-right">-</span>
                <span className="text-muted-foreground">-</span>
                <span className="flex-1 break-words line-through">{lineDiff.oldContent}</span>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}

/**
 * Highlighted word-level diff view
 */
function WordLevelDiffView({ diff }: { diff: DiffResult }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden p-4">
      <div className="bg-muted p-2 border-b border-border font-semibold mb-4 rounded">
        Word-Level Changes
      </div>
      <div className="space-y-4">
        {diff.wordDiffs.map((segment, idx) => (
          <DiffSegmentRenderer key={idx} segment={segment} />
        ))}
      </div>
    </div>
  );
}

/**
 * Statistics panel
 */
function DiffStatisticsPanel({ stats }: { stats: DiffStatistics }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Lines Added</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.linesAdded}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Lines Removed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.linesRemoved}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Words Added</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.wordsAdded}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Words Removed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.wordsRemoved}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Characters Added</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.charactersAdded}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Characters Removed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.charactersRemoved}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Changes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {stats.linesAdded + stats.linesRemoved}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Similarity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.similarity}%</div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Main visual diff viewer component
 */
export default function VisualDiffViewer({
  diff,
  viewMode = "side-by-side",
  onCopy,
  onDownload,
}: VisualDiffViewerProps) {
  const [mode, setMode] = useState<"side-by-side" | "unified" | "word-level">(viewMode);
  const [expanded, setExpanded] = useState(true);

  const handleCopy = () => {
    const text = `Diff Summary:\n\nLines Added: ${diff.statistics.linesAdded}\nLines Removed: ${diff.statistics.linesRemoved}\nWords Added: ${diff.statistics.wordsAdded}\nWords Removed: ${diff.statistics.wordsRemoved}\nSimilarity: ${diff.statistics.similarity}%`;
    navigator.clipboard.writeText(text);
    onCopy?.();
  };

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Version Comparison</h2>
          <Badge variant="outline">
            {diff.statistics.similarity}% Similar
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {expanded && (
        <div>
          <h3 className="text-sm font-semibold mb-3">Statistics</h3>
          <DiffStatisticsPanel stats={diff.statistics} />
        </div>
      )}

      {/* View mode tabs */}
      {expanded && (
        <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
          <TabsList>
            <TabsTrigger value="side-by-side">Side-by-Side</TabsTrigger>
            <TabsTrigger value="unified">Unified</TabsTrigger>
            <TabsTrigger value="word-level">Word-Level</TabsTrigger>
          </TabsList>

          <TabsContent value="side-by-side">
            <SideBySideDiffView diff={diff} />
          </TabsContent>

          <TabsContent value="unified">
            <UnifiedDiffView diff={diff} />
          </TabsContent>

          <TabsContent value="word-level">
            <WordLevelDiffView diff={diff} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
