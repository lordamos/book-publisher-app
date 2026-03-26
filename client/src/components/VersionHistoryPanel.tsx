import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock, Download, RotateCcw, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface VersionHistoryPanelProps {
  bookId: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onVersionRestored?: () => void;
}

export function VersionHistoryPanel({
  bookId,
  isOpen,
  onOpenChange,
  onVersionRestored,
}: VersionHistoryPanelProps) {
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersionId, setCompareVersionId] = useState<number | null>(null);

  // Fetch versions
  const { data: versions, isLoading, refetch } = trpc.versions.list.useQuery(
    { bookId, limit: 100 },
    { enabled: isOpen }
  );

  // Fetch selected version details
  const { data: selectedVersion } = trpc.versions.get.useQuery(
    { versionId: selectedVersionId || 0 },
    { enabled: isOpen && selectedVersionId !== null }
  );

  // Fetch version metadata
  const { data: versionMetadata } = trpc.versions.getMetadata.useQuery(
    { versionId: selectedVersionId || 0 },
    { enabled: isOpen && selectedVersionId !== null }
  );

  // Mutations
  const restoreMutation = trpc.versions.restore.useMutation();
  const deleteMutation = trpc.versions.delete.useMutation();
  const tagMutation = trpc.versions.tag.useMutation();

  const handleRestore = async (versionId: number) => {
    try {
      await restoreMutation.mutateAsync({
        bookId,
        versionId,
      });
      toast.success("Book restored to selected version");
      onVersionRestored?.();
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to restore version");
    }
  };

  const handleDelete = async (versionId: number) => {
    if (!confirm("Are you sure you want to delete this version?")) return;

    try {
      await deleteMutation.mutateAsync({ versionId });
      toast.success("Version deleted");
      setSelectedVersionId(null);
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete version");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>View, compare, and restore previous versions of your book</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="compare">Compare</TabsTrigger>
          </TabsList>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading versions...</div>
            ) : versions && versions.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {versions.map((version, index) => (
                  <Card
                    key={version.id}
                    className={`cursor-pointer transition-colors ${
                      selectedVersionId === version.id ? "border-primary bg-primary/5" : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedVersionId(version.id)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{version.title}</h4>
                            {version.isAutoSave && (
                              <Badge variant="secondary" className="text-xs">
                                Auto-save
                              </Badge>
                            )}
                            {index === 0 && (
                              <Badge variant="default" className="text-xs">
                                Latest
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            <Clock className="w-4 h-4 inline mr-1" />
                            {format(new Date(version.createdAt), "PPp")}
                          </p>
                          {version.changesSummary && (
                            <p className="text-sm text-gray-700 mt-2">{version.changesSummary}</p>
                          )}
                          <div className="flex gap-4 mt-2 text-xs text-gray-600">
                            <span>{version.pageCount} pages</span>
                            <span>{version.characterCount} characters</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestore(version.id);
                            }}
                            disabled={index === 0}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(version.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No versions found</div>
            )}
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            {selectedVersion ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Version Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Content</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-3 rounded">
                          <p className="text-sm text-gray-600">Pages</p>
                          <p className="text-2xl font-bold">{selectedVersion.pages?.length || 0}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded">
                          <p className="text-sm text-gray-600">Chapters</p>
                          <p className="text-2xl font-bold">{selectedVersion.chapters?.length || 0}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded">
                          <p className="text-sm text-gray-600">Images</p>
                          <p className="text-2xl font-bold">{selectedVersion.images?.length || 0}</p>
                        </div>
                      </div>
                    </div>

                    {versionMetadata && (
                      <div>
                        <h4 className="font-semibold mb-2">Changes from Previous Version</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {versionMetadata.pagesAdded > 0 && (
                            <div className="text-green-600">+{versionMetadata.pagesAdded} pages added</div>
                          )}
                          {versionMetadata.pagesDeleted > 0 && (
                            <div className="text-red-600">-{versionMetadata.pagesDeleted} pages deleted</div>
                          )}
                          {versionMetadata.imagesAdded > 0 && (
                            <div className="text-green-600">+{versionMetadata.imagesAdded} images added</div>
                          )}
                          {versionMetadata.imagesDeleted > 0 && (
                            <div className="text-red-600">-{versionMetadata.imagesDeleted} images deleted</div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">Select a version to view details</div>
            )}
          </TabsContent>

          {/* Compare Tab */}
          <TabsContent value="compare" className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">Select two versions to compare</div>
            {versions && versions.length >= 2 ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold">Version 1</label>
                  <select
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    onChange={(e) => setSelectedVersionId(parseInt(e.target.value))}
                  >
                    <option value="">Select a version</option>
                    {versions.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.title} - {format(new Date(v.createdAt), "PPp")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold">Version 2</label>
                  <select
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    onChange={(e) => setCompareVersionId(parseInt(e.target.value))}
                  >
                    <option value="">Select a version</option>
                    {versions.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.title} - {format(new Date(v.createdAt), "PPp")}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedVersionId && compareVersionId && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-4">
                      <p className="text-sm text-blue-900">
                        Comparison feature shows the differences between selected versions
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">Need at least 2 versions to compare</div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
