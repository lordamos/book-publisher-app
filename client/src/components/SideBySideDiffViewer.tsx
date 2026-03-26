import React, { useState, useRef, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  ChevronUp,
  ChevronDown,
  Copy,
  Search,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff,
} from "lucide-react";

interface DiffLine {
  type: "add" | "remove" | "context";
  content: string;
  lineNumber: number;
  originalLineNumber?: number;
}

interface SideBySideDiffViewerProps {
  oldText: string;
  newText: string;
  oldVersion?: string;
  newVersion?: string;
  onNavigateToChange?: (index: number) => void;
}

/**
 * Generate diff lines for side-by-side comparison
 */
function generateDiffLines(oldText: string, newText: string) {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");

  const leftLines: DiffLine[] = [];
  const rightLines: DiffLine[] = [];

  let oldIdx = 0;
  let newIdx = 0;
  let leftLineNum = 1;
  let rightLineNum = 1;

  // Simple diff algorithm (LCS-based)
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
        // Different lines - check if next lines match
        let foundMatch = false;

        // Look ahead for matching lines
        for (let i = 1; i < 3 && oldIdx + i < oldLines.length; i++) {
          if (oldLines[oldIdx + i] === newLines[newIdx]) {
            // Lines between don't match
            leftLines.push({
              type: "remove",
              content: oldLines[oldIdx],
              lineNumber: leftLineNum++,
            });
            rightLines.push({
              type: "add",
              content: newLines[newIdx],
              lineNumber: rightLineNum++,
            });
            oldIdx++;
            newIdx++;
            foundMatch = true;
            break;
          }
        }

        if (!foundMatch) {
          // Default: treat as removal and addition
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

  return { leftLines, rightLines };
}

/**
 * Line component for side-by-side display
 */
function DiffLineRow({
  leftLine,
  rightLine,
  searchTerm,
}: {
  leftLine?: DiffLine;
  rightLine?: DiffLine;
  searchTerm: string;
}) {
  const getLineClass = (type: string) => {
    switch (type) {
      case "add":
        return "bg-green-50 dark:bg-green-950";
      case "remove":
        return "bg-red-50 dark:bg-red-950";
      default:
        return "bg-background";
    }
  };

  const getLineNumberClass = (type: string) => {
    switch (type) {
      case "add":
        return "text-green-600 dark:text-green-400";
      case "remove":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  const highlightSearchTerm = (text: string) => {
    if (!searchTerm) return text;

    const parts = text.split(new RegExp(`(${searchTerm})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase()
        ? `[HIGHLIGHT]${part}[/HIGHLIGHT]`
        : part
    );
  };

  return (
    <div className="flex border-b border-border">
      {/* Left pane */}
      <div className={`flex-1 flex ${getLineClass(leftLine?.type || "context")}`}>
        <div
          className={`w-12 px-2 py-1 text-right text-xs font-mono ${getLineNumberClass(leftLine?.type || "context")} border-r border-border bg-muted`}
        >
          {leftLine?.lineNumber || ""}
        </div>
        <div className="flex-1 px-3 py-1 text-sm font-mono whitespace-pre-wrap break-words">
          {leftLine ? highlightSearchTerm(leftLine.content) : ""}
        </div>
      </div>

      {/* Right pane */}
      <div className={`flex-1 flex ${getLineClass(rightLine?.type || "context")}`}>
        <div
          className={`w-12 px-2 py-1 text-right text-xs font-mono ${getLineNumberClass(rightLine?.type || "context")} border-r border-border bg-muted`}
        >
          {rightLine?.lineNumber || ""}
        </div>
        <div className="flex-1 px-3 py-1 text-sm font-mono whitespace-pre-wrap break-words">
          {rightLine ? highlightSearchTerm(rightLine.content) : ""}
        </div>
      </div>
    </div>
  );
}

/**
 * Main side-by-side diff viewer component
 */
export default function SideBySideDiffViewer({
  oldText,
  newText,
  oldVersion = "Original",
  newVersion = "Modified",
  onNavigateToChange,
}: SideBySideDiffViewerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [zoom, setZoom] = useState(100);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);

  const { leftLines, rightLines } = useMemo(
    () => generateDiffLines(oldText, newText),
    [oldText, newText]
  );

  // Synchronized scrolling
  const handleLeftScroll = () => {
    if (leftScrollRef.current && rightScrollRef.current) {
      rightScrollRef.current.scrollTop = leftScrollRef.current.scrollTop;
    }
  };

  const handleRightScroll = () => {
    if (rightScrollRef.current && leftScrollRef.current) {
      leftScrollRef.current.scrollTop = rightScrollRef.current.scrollTop;
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const additions = rightLines.filter((l) => l.type === "add").length;
    const deletions = leftLines.filter((l) => l.type === "remove").length;
    const contextLines = leftLines.filter((l) => l.type === "context").length;

    return {
      additions,
      deletions,
      contextLines,
      totalChanges: additions + deletions,
    };
  }, [leftLines, rightLines]);

  // Find changes for navigation
  const changes = useMemo(() => {
    const changeIndices: number[] = [];
    const maxLen = Math.max(leftLines.length, rightLines.length);

    for (let i = 0; i < maxLen; i++) {
      const left = leftLines[i];
      const right = rightLines[i];

      if ((left && left.type !== "context") || (right && right.type !== "context")) {
        changeIndices.push(i);
      }
    }

    return changeIndices;
  }, [leftLines, rightLines]);

  const navigateToChange = (direction: "next" | "prev") => {
    // Implementation would navigate to next/previous change
  };

  const maxLen = Math.max(leftLines.length, rightLines.length);
  const displayLines = Array.from({ length: maxLen }, (_, i) => ({
    left: leftLines[i],
    right: rightLines[i],
  }));

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Side-by-Side Comparison</h2>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span className="text-red-600">Deletions: {stats.deletions}</span>
            <span className="text-green-600">Additions: {stats.additions}</span>
            <span className="text-blue-600">Context: {stats.contextLines}</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search in diff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-8"
              />
            </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom(Math.max(50, zoom - 10))}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm w-12 text-center">{zoom}%</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom(Math.min(200, zoom + 10))}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowLineNumbers(!showLineNumbers)}
          >
            {showLineNumbers ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => navigateToChange("prev")}
            disabled={changes.length === 0}
          >
            <ChevronUp className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => navigateToChange("next")}
            disabled={changes.length === 0}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Diff viewer */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between">
            <div className="flex-1">
              <Badge variant="outline">{oldVersion}</Badge>
            </div>
            <div className="flex-1 text-right">
              <Badge variant="outline">{newVersion}</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div
            className="overflow-hidden border border-border rounded-b"
            style={{ fontSize: `${zoom}%` }}
          >
            <div className="flex">
              {/* Left pane */}
              <ScrollArea
                className="flex-1 h-96 border-r border-border"
                onScroll={handleLeftScroll}
                ref={leftScrollRef}
              >
                <div className="min-w-full">
                  {displayLines.map((line, i) => (
                    <DiffLineRow
                      key={`left-${i}`}
                      leftLine={line.left}
                      searchTerm={searchTerm}
                    />
                  ))}
                </div>
              </ScrollArea>

              {/* Right pane */}
              <ScrollArea
                className="flex-1 h-96"
                onScroll={handleRightScroll}
                ref={rightScrollRef}
              >
                <div className="min-w-full">
                  {displayLines.map((line, i) => (
                    <DiffLineRow
                      key={`right-${i}`}
                      rightLine={line.right}
                      searchTerm={searchTerm}
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Comparison Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.deletions}</div>
              <div className="text-xs text-muted-foreground">Lines Removed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.additions}</div>
              <div className="text-xs text-muted-foreground">Lines Added</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.contextLines}</div>
              <div className="text-xs text-muted-foreground">Context Lines</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.totalChanges}</div>
              <div className="text-xs text-muted-foreground">Total Changes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
