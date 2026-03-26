import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface BatchUpdateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  bookId: number;
  onSuccess?: () => void;
}

export function BatchUpdateDialog({ isOpen, onOpenChange, bookId, onSuccess }: BatchUpdateDialogProps) {
  const [selectionMode, setSelectionMode] = useState<"all" | "type" | "range" | "custom">("all");
  const [pageTypeFilter, setPageTypeFilter] = useState<"cover" | "chapter" | "full_image" | "text_only" | "blank" | "all">("all");
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(10);
  const [selectedPageIds, setSelectedPageIds] = useState<number[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Fetch stats
  const { data: stats } = trpc.batch.getStats.useQuery({ bookId }, { enabled: isOpen });

  // Get preview
  const { data: preview } = trpc.batch.getPreview.useQuery(
    {
      bookId,
      selectionMode,
      pageTypeFilter: selectionMode === "type" ? pageTypeFilter : undefined,
      startPage: selectionMode === "range" ? startPage : undefined,
      endPage: selectionMode === "range" ? endPage : undefined,
      pageIds: selectionMode === "custom" ? selectedPageIds : undefined,
    },
    { enabled: isOpen }
  );

  // Apply updates mutation
  const applyUpdatesMutation = trpc.batch.applyUpdates.useMutation();

  const handleApplyToAll = async () => {
    setIsApplying(true);
    setProgress(0);

    try {
      const result = await applyUpdatesMutation.mutateAsync({
        bookId,
        selectionMode,
        pageTypeFilter: selectionMode === "type" ? pageTypeFilter : undefined,
        startPage: selectionMode === "range" ? startPage : undefined,
        endPage: selectionMode === "range" ? endPage : undefined,
        pageIds: selectionMode === "custom" ? selectedPageIds : undefined,
        updates: {
          // Add preset style updates here
        },
      });

      setProgress(100);
      toast.success(`Successfully updated ${result.pagesUpdated} pages`);
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to apply updates");
    } finally {
      setIsApplying(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Apply Preset to Multiple Pages</DialogTitle>
          <DialogDescription>
            Choose which pages to update with the new preset styles
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="selection" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="selection">Selection</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          {/* Selection Tab */}
          <TabsContent value="selection" className="space-y-6">
            {/* Selection Mode */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Selection Mode</Label>
              <RadioGroup value={selectionMode} onValueChange={(v: any) => setSelectionMode(v)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="font-normal cursor-pointer">
                    All Pages ({stats?.totalPages || 0} pages)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="type" id="type" />
                  <Label htmlFor="type" className="font-normal cursor-pointer">
                    By Page Type
                  </Label>
                </div>
                {selectionMode === "type" && (
                  <div className="ml-6 space-y-2">
                    <select
                      value={pageTypeFilter}
                      onChange={(e) => setPageTypeFilter(e.target.value as any)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="cover">Cover Pages ({stats?.pagesByType.cover || 0})</option>
                      <option value="chapter">Chapter Pages ({stats?.pagesByType.chapter || 0})</option>
                      <option value="full_image">Full Image Pages ({stats?.pagesByType.full_image || 0})</option>
                      <option value="text_only">Text Only Pages ({stats?.pagesByType.text_only || 0})</option>
                      <option value="blank">Blank Pages ({stats?.pagesByType.blank || 0})</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="range" id="range" />
                  <Label htmlFor="range" className="font-normal cursor-pointer">
                    By Page Range
                  </Label>
                </div>
                {selectionMode === "range" && (
                  <div className="ml-6 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm">Start Page</Label>
                        <Input
                          type="number"
                          min={stats?.pageRange.min || 1}
                          max={stats?.pageRange.max || 100}
                          value={startPage}
                          onChange={(e) => setStartPage(parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">End Page</Label>
                        <Input
                          type="number"
                          min={stats?.pageRange.min || 1}
                          max={stats?.pageRange.max || 100}
                          value={endPage}
                          onChange={(e) => setEndPage(parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="font-normal cursor-pointer">
                    Custom Selection
                  </Label>
                </div>
                {selectionMode === "custom" && (
                  <div className="ml-6 space-y-2">
                    <p className="text-sm text-gray-600">Select specific pages to update</p>
                    {/* Page selection would go here */}
                  </div>
                )}
              </RadioGroup>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Summary:</strong> {preview?.length || 0} pages will be updated with the new preset styles.
              </p>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-4">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {preview && preview.length > 0 ? (
                preview.map((page: any) => (
                  <div key={page.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Page {page.pageNumber}</p>
                      <p className="text-sm text-gray-600">{page.templateType}</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No pages selected
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Progress */}
        {isApplying && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-gray-600">Applying updates...</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isApplying}>
            Cancel
          </Button>
          <Button onClick={handleApplyToAll} disabled={isApplying || !preview || preview.length === 0}>
            {isApplying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Applying...
              </>
            ) : (
              "Apply to All"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
