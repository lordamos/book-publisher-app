import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Edit,
  AlertCircle,
} from "lucide-react";

interface MergeChange {
  id: string;
  type: "add" | "remove" | "modify";
  lineNumber: number;
  oldContent: string;
  newContent: string;
  accepted: boolean;
}

interface MergeConflict {
  id: string;
  lineNumber: number;
  oldContent: string;
  newContent: string;
  conflictType: "edit-edit" | "edit-delete" | "delete-edit";
  resolution?: "keep-old" | "use-new" | "custom";
  customResolution?: string;
}

interface MergeInterfaceProps {
  changes: MergeChange[];
  conflicts?: MergeConflict[];
  onChangeAcceptance?: (changeId: string, accepted: boolean) => void;
  onAcceptAll?: () => void;
  onRejectAll?: () => void;
  onAcceptByType?: (type: "add" | "remove" | "modify") => void;
  onRejectByType?: (type: "add" | "remove" | "modify") => void;
  onResolveConflict?: (conflictId: string, resolution: string) => void;
  onExecuteMerge?: () => void;
}

/**
 * Change row component
 */
function ChangeRow({
  change,
  onAcceptanceChange,
}: {
  change: MergeChange;
  onAcceptanceChange: (accepted: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const getTypeIcon = () => {
    switch (change.type) {
      case "add":
        return <Plus className="w-4 h-4 text-green-600" />;
      case "remove":
        return <Minus className="w-4 h-4 text-red-600" />;
      case "modify":
        return <Edit className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTypeLabel = () => {
    switch (change.type) {
      case "add":
        return "Added";
      case "remove":
        return "Removed";
      case "modify":
        return "Modified";
    }
  };

  const getTypeColor = () => {
    switch (change.type) {
      case "add":
        return "bg-green-100 dark:bg-green-950";
      case "remove":
        return "bg-red-100 dark:bg-red-950";
      case "modify":
        return "bg-blue-100 dark:bg-blue-950";
    }
  };

  return (
    <div className={`border border-border rounded-lg p-3 ${getTypeColor()}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 flex-1">
          <Checkbox
            checked={change.accepted}
            onCheckedChange={(checked) => onAcceptanceChange(checked as boolean)}
            className="mt-1"
          />
          <div className="flex items-center gap-2">
            {getTypeIcon()}
            <Badge variant="outline">{getTypeLabel()}</Badge>
            <span className="text-sm text-muted-foreground">Line {change.lineNumber}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="h-8 w-8 p-0"
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-2 pt-3 border-t border-border">
          {change.oldContent && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-1">Original:</div>
              <div className="bg-background p-2 rounded text-sm font-mono break-words">
                {change.oldContent}
              </div>
            </div>
          )}
          {change.newContent && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-1">New:</div>
              <div className="bg-background p-2 rounded text-sm font-mono break-words">
                {change.newContent}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Conflict resolution component
 */
function ConflictResolver({
  conflict,
  onResolve,
}: {
  conflict: MergeConflict;
  onResolve: (resolution: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [customText, setCustomText] = useState(conflict.customResolution || "");

  return (
    <div className="border border-yellow-500 bg-yellow-50 dark:bg-yellow-950 rounded-lg p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <div>
            <div className="font-semibold text-sm">Conflict at Line {conflict.lineNumber}</div>
            <div className="text-xs text-muted-foreground capitalize">
              {conflict.conflictType.replace(/-/g, " ")}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="h-8 w-8 p-0"
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-3 pt-3 border-t border-yellow-200">
          <div className="space-y-2">
            <div className="text-xs font-semibold">Original:</div>
            <div className="bg-white dark:bg-slate-900 p-2 rounded text-sm font-mono break-words">
              {conflict.oldContent}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold">New:</div>
            <div className="bg-white dark:bg-slate-900 p-2 rounded text-sm font-mono break-words">
              {conflict.newContent}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant={conflict.resolution === "keep-old" ? "default" : "outline"}
              onClick={() => onResolve("keep-old")}
            >
              Keep Original
            </Button>
            <Button
              size="sm"
              variant={conflict.resolution === "use-new" ? "default" : "outline"}
              onClick={() => onResolve("use-new")}
            >
              Use New
            </Button>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold">Custom Resolution:</div>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full p-2 border border-border rounded text-sm font-mono"
              rows={3}
              placeholder="Enter custom resolution..."
            />
            <Button
              size="sm"
              variant={conflict.resolution === "custom" ? "default" : "outline"}
              onClick={() => onResolve("custom")}
              className="w-full"
            >
              Use Custom
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Main merge interface component
 */
export default function MergeInterface({
  changes,
  conflicts = [],
  onChangeAcceptance,
  onAcceptAll,
  onRejectAll,
  onAcceptByType,
  onRejectByType,
  onResolveConflict,
  onExecuteMerge,
}: MergeInterfaceProps) {
  const statistics = useMemo(() => {
    const accepted = changes.filter((c) => c.accepted).length;
    const rejected = changes.filter((c) => !c.accepted).length;
    const added = changes.filter((c) => c.type === "add" && c.accepted).length;
    const removed = changes.filter((c) => c.type === "remove" && c.accepted).length;
    const modified = changes.filter((c) => c.type === "modify" && c.accepted).length;

    return {
      total: changes.length,
      accepted,
      rejected,
      added,
      removed,
      modified,
      successRate: changes.length > 0 ? Math.round((accepted / changes.length) * 100) : 0,
    };
  }, [changes]);

  const addedChanges = changes.filter((c) => c.type === "add");
  const removedChanges = changes.filter((c) => c.type === "remove");
  const modifiedChanges = changes.filter((c) => c.type === "modify");

  return (
    <div className="space-y-4">
      {/* Header with statistics */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Merge Changes</h2>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>Total: {statistics.total}</span>
            <span className="text-green-600">Accepted: {statistics.accepted}</span>
            <span className="text-red-600">Rejected: {statistics.rejected}</span>
            <span className="text-blue-600">Success: {statistics.successRate}%</span>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" onClick={onAcceptAll} variant="outline">
          <Check className="w-4 h-4 mr-2" />
          Accept All
        </Button>
        <Button size="sm" onClick={onRejectAll} variant="outline">
          <X className="w-4 h-4 mr-2" />
          Reject All
        </Button>
        {addedChanges.length > 0 && (
          <Button
            size="sm"
            onClick={() => onAcceptByType?.("add")}
            variant="outline"
            className="text-green-600"
          >
            Accept Additions ({addedChanges.length})
          </Button>
        )}
        {removedChanges.length > 0 && (
          <Button
            size="sm"
            onClick={() => onAcceptByType?.("remove")}
            variant="outline"
            className="text-red-600"
          >
            Accept Removals ({removedChanges.length})
          </Button>
        )}
        {modifiedChanges.length > 0 && (
          <Button
            size="sm"
            onClick={() => onAcceptByType?.("modify")}
            variant="outline"
            className="text-blue-600"
          >
            Accept Modifications ({modifiedChanges.length})
          </Button>
        )}
      </div>

      {/* Tabs for changes and conflicts */}
      <Tabs defaultValue="changes">
        <TabsList>
          <TabsTrigger value="changes">Changes ({changes.length})</TabsTrigger>
          {conflicts.length > 0 && (
            <TabsTrigger value="conflicts">Conflicts ({conflicts.length})</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="changes" className="space-y-3">
          <ScrollArea className="h-96 border border-border rounded-lg p-4">
            <div className="space-y-3">
              {changes.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No changes to merge
                </div>
              ) : (
                changes.map((change) => (
                  <ChangeRow
                    key={change.id}
                    change={change}
                    onAcceptanceChange={(accepted) => onChangeAcceptance?.(change.id, accepted)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {conflicts.length > 0 && (
          <TabsContent value="conflicts" className="space-y-3">
            <ScrollArea className="h-96 border border-border rounded-lg p-4">
              <div className="space-y-3">
                {conflicts.map((conflict) => (
                  <ConflictResolver
                    key={conflict.id}
                    conflict={conflict}
                    onResolve={(resolution) => onResolveConflict?.(conflict.id, resolution)}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        )}
      </Tabs>

      {/* Execute merge button */}
      <div className="flex justify-end gap-2">
        <Button onClick={onExecuteMerge} size="lg">
          <Check className="w-4 h-4 mr-2" />
          Execute Merge
        </Button>
      </div>
    </div>
  );
}
