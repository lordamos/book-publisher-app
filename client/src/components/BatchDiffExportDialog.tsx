import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Loader2, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface DiffReportItem {
  id: string;
  oldText: string;
  newText: string;
  title: string;
  oldVersion?: string;
  newVersion?: string;
  selected?: boolean;
}

interface BatchDiffExportDialogProps {
  reports: DiffReportItem[];
  onExport?: () => void;
}

export default function BatchDiffExportDialog({
  reports,
  onExport,
}: BatchDiffExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedReports, setSelectedReports] = useState<Set<string>>(
    new Set(reports.map((r) => r.id))
  );
  const [format, setFormat] = useState<"pdf" | "zip">("zip");
  const [colorScheme, setColorScheme] = useState<"light" | "dark">("light");
  const [pageSize, setPageSize] = useState<"letter" | "a4">("letter");
  const [fontSize, setFontSize] = useState(9);
  const [includeStatistics, setIncludeStatistics] = useState(true);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [mergeIntoSinglePDF, setMergeIntoSinglePDF] = useState(false);
  const [includeTableOfContents, setIncludeTableOfContents] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const exportMutation = trpc.batchexport.exportReports.useMutation();
  const statsQuery = trpc.batchexport.getStatistics.useQuery(
    {
      reports: Array.from(selectedReports)
        .map((id) => reports.find((r) => r.id === id))
        .filter((r) => r !== undefined)
        .map((r) => ({
          oldText: r!.oldText,
          newText: r!.newText,
        })),
    },
    { enabled: selectedReports.size > 0 }
  );

  const selectedReportsList = useMemo(
    () =>
      Array.from(selectedReports)
        .map((id) => reports.find((r) => r.id === id))
        .filter((r) => r !== undefined) as DiffReportItem[],
    [selectedReports, reports]
  );

  const handleSelectAll = () => {
    if (selectedReports.size === reports.length) {
      setSelectedReports(new Set());
    } else {
      setSelectedReports(new Set(reports.map((r) => r.id)));
    }
  };

  const handleToggleReport = (reportId: string) => {
    const newSelected = new Set(selectedReports);
    if (newSelected.has(reportId)) {
      newSelected.delete(reportId);
    } else {
      newSelected.add(reportId);
    }
    setSelectedReports(newSelected);
  };

  const handleExport = async () => {
    if (selectedReportsList.length === 0) {
      toast.error("Please select at least one report");
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const result = await exportMutation.mutateAsync({
        reports: selectedReportsList,
        format,
        colorScheme,
        pageSize,
        fontSize,
        includeStatistics,
        showLineNumbers,
        mergeIntoSinglePDF: format === "pdf" ? mergeIntoSinglePDF : false,
        includeTableOfContents: format === "pdf" && mergeIntoSinglePDF ? includeTableOfContents : false,
      });

      clearInterval(progressInterval);
      setExportProgress(100);

      if (result.success && result.data) {
        // Convert base64 to blob and download
        const binaryString = atob(result.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: result.mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success(
          `Exported ${result.reportCount} report(s) successfully`
        );
        onExport?.();
        setOpen(false);
      } else {
        toast.error(result.error || "Failed to export reports");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to export reports");
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const estimatedSize =
    format === "zip"
      ? statsQuery.data?.estimatedZipSizeMB || "0"
      : statsQuery.data?.estimatedPDFSizeMB || "0";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Batch Export
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Batch Export Diff Reports</DialogTitle>
          <DialogDescription>
            Select multiple reports and configure export options
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="selection" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="selection">Selection</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          {/* Selection Tab */}
          <TabsContent value="selection" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-semibold">
                Reports ({selectedReports.size}/{reports.length})
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedReports.size === reports.length ? "Deselect All" : "Select All"}
              </Button>
            </div>

            <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
              {reports.length === 0 ? (
                <p className="text-sm text-muted-foreground">No reports available</p>
              ) : (
                reports.map((report) => (
                  <div key={report.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={report.id}
                      checked={selectedReports.has(report.id)}
                      onCheckedChange={() => handleToggleReport(report.id)}
                    />
                    <Label
                      htmlFor={report.id}
                      className="font-normal cursor-pointer flex-1"
                    >
                      {report.title}
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {report.oldVersion} → {report.newVersion}
                    </span>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            {/* Format Selection */}
            <div className="space-y-2">
              <Label htmlFor="format">Export Format</Label>
              <Select value={format} onValueChange={(v) => setFormat(v as "pdf" | "zip")}>
                <SelectTrigger id="format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zip">ZIP (Individual PDFs)</SelectItem>
                  <SelectItem value="pdf">PDF (Single or Merged)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* PDF-specific options */}
            {format === "pdf" && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mergeIntoSinglePDF"
                    checked={mergeIntoSinglePDF}
                    onCheckedChange={(checked) =>
                      setMergeIntoSinglePDF(checked as boolean)
                    }
                  />
                  <Label htmlFor="mergeIntoSinglePDF" className="font-normal cursor-pointer">
                    Merge into single PDF
                  </Label>
                </div>

                {mergeIntoSinglePDF && (
                  <div className="flex items-center space-x-2 ml-6">
                    <Checkbox
                      id="includeTableOfContents"
                      checked={includeTableOfContents}
                      onCheckedChange={(checked) =>
                        setIncludeTableOfContents(checked as boolean)
                      }
                    />
                    <Label
                      htmlFor="includeTableOfContents"
                      className="font-normal cursor-pointer"
                    >
                      Include table of contents
                    </Label>
                  </div>
                )}
              </div>
            )}

            {/* Color Scheme */}
            <div className="space-y-2">
              <Label htmlFor="colorScheme">Color Scheme</Label>
              <Select value={colorScheme} onValueChange={(v) => setColorScheme(v as "light" | "dark")}>
                <SelectTrigger id="colorScheme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Page Size */}
            <div className="space-y-2">
              <Label htmlFor="pageSize">Page Size</Label>
              <Select value={pageSize} onValueChange={(v) => setPageSize(v as "letter" | "a4")}>
                <SelectTrigger id="pageSize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="letter">Letter (8.5" x 11")</SelectItem>
                  <SelectItem value="a4">A4 (210 x 297mm)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <Label htmlFor="fontSize">Font Size</Label>
              <Select value={fontSize.toString()} onValueChange={(v) => setFontSize(parseInt(v))}>
                <SelectTrigger id="fontSize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[8, 9, 10, 11, 12].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}pt
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="statistics"
                  checked={includeStatistics}
                  onCheckedChange={(checked) => setIncludeStatistics(checked as boolean)}
                />
                <Label htmlFor="statistics" className="font-normal cursor-pointer">
                  Include Statistics
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lineNumbers"
                  checked={showLineNumbers}
                  onCheckedChange={(checked) => setShowLineNumbers(checked as boolean)}
                />
                <Label htmlFor="lineNumbers" className="font-normal cursor-pointer">
                  Show Line Numbers
                </Label>
              </div>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Export Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Format</p>
                    <p className="text-sm text-muted-foreground">
                      {format === "zip" ? "ZIP Archive" : "PDF Document"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Reports</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedReports.size} selected
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Estimated Size</p>
                    <p className="text-sm text-muted-foreground">
                      {estimatedSize} MB
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Color Scheme</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {colorScheme}
                    </p>
                  </div>
                </div>

                {selectedReports.size > 0 && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      Ready to export {selectedReports.size} report(s)
                    </AlertDescription>
                  </Alert>
                )}

                {selectedReports.size === 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please select at least one report to export
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Progress Bar */}
        {isExporting && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Exporting...</span>
              <span>{exportProgress}%</span>
            </div>
            <Progress value={exportProgress} className="w-full" />
          </div>
        )}

        {/* Export Button */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleExport}
            disabled={isExporting || selectedReports.size === 0}
            className="flex-1"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export {selectedReports.size > 0 ? `(${selectedReports.size})` : ""}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
