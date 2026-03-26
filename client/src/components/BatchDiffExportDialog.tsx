import React, { useState, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import {
  Loader2,
  Download,
  AlertCircle,
  CheckCircle2,
  FileArchive,
  FileText,
  Settings,
  Eye,
  ChevronRight,
  Zap,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  useKeyboardShortcuts,
  useDialogKeyboardInteractions,
  formatKeyboardShortcut,
} from "@/hooks/useKeyboardShortcuts";

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
  const [activeTab, setActiveTab] = useState("selection");
  const dialogRef = useRef<HTMLDivElement>(null);
  const exportButtonRef = useRef<HTMLButtonElement>(null);

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

  // Keyboard shortcuts
  useKeyboardShortcuts(
    [
      {
        key: "e",
        meta: true,
        callback: () => {
          if (!open) {
            setOpen(true);
          } else if (selectedReportsList.length > 0 && !isExporting) {
            handleExport();
          }
        },
        description: "Quick export",
      },
    ],
    true
  );

  useDialogKeyboardInteractions(
    () => setOpen(false),
    dialogRef as React.RefObject<HTMLElement>,
    open
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
        includeTableOfContents:
          format === "pdf" && mergeIntoSinglePDF ? includeTableOfContents : false,
      });

      clearInterval(progressInterval);
      setExportProgress(100);

      if (result.success && result.data) {
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

        toast.success(`✨ Exported ${result.reportCount} report(s) successfully`);
        onExport?.();
        setOpen(false);
      } else {
        toast.error(result.error || "Failed to export reports");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to export reports"
      );
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const estimatedSize =
    format === "zip"
      ? statsQuery.data?.estimatedZipSizeMB || "0"
      : statsQuery.data?.estimatedPDFSizeMB || "0";

  const formatLabel = format === "zip" ? "ZIP Archive" : "PDF Document";
  const formatIcon = format === "zip" ? FileArchive : FileText;
  const FormatIcon = formatIcon;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 hover:bg-accent transition-all duration-200"
        >
          <Package className="w-4 h-4" />
          Batch Export
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-background via-background to-accent/5 border-accent/20">
        <DialogHeader className="border-b border-accent/10 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Batch Export Reports
              </DialogTitle>
              <DialogDescription className="text-sm mt-1">
                Export multiple diff reports in one go
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-lg border border-accent/20">
              <FormatIcon className="w-4 h-4 text-accent" />
              <span className="text-xs font-semibold text-accent">
                {formatLabel}
              </span>
            </div>
          </div>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid w-full grid-cols-3 bg-accent/5 border-b border-accent/10 rounded-none">
            <TabsTrigger
              value="selection"
              className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-accent rounded-none transition-all duration-200"
            >
              <span className="flex items-center gap-2">
                <span className="text-xs font-semibold">1</span>
                Select
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-accent rounded-none transition-all duration-200"
            >
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="text-xs font-semibold">2</span>
                Settings
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-accent rounded-none transition-all duration-200"
            >
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span className="text-xs font-semibold">3</span>
                Review
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Selection Tab */}
          <TabsContent
            value="selection"
            className="flex-1 overflow-hidden flex flex-col space-y-4 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">
                  Reports ({selectedReports.size}/{reports.length})
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedReports.size === 0
                    ? "No reports selected"
                    : `${selectedReports.size} report${selectedReports.size !== 1 ? "s" : ""} ready to export`}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="transition-all duration-200 hover:bg-accent/10"
              >
                {selectedReports.size === reports.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>

            <div className="border border-accent/20 rounded-lg overflow-hidden bg-background/50 flex-1 flex flex-col">
              {reports.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No reports available
                    </p>
                  </div>
                </div>
              ) : (
                <div className="overflow-y-auto flex-1">
                  {reports.map((report, index) => (
                    <div
                      key={report.id}
                      className={`flex items-center gap-3 p-3 hover:bg-accent/5 transition-colors duration-150 ${
                        index !== reports.length - 1
                          ? "border-b border-accent/10"
                          : ""
                      }`}
                    >
                      <Checkbox
                        id={report.id}
                        checked={selectedReports.has(report.id)}
                        onCheckedChange={() => handleToggleReport(report.id)}
                        className="transition-all duration-200"
                      />
                      <div className="flex-1 min-w-0">
                        <Label
                          htmlFor={report.id}
                          className="font-medium text-sm cursor-pointer block truncate"
                        >
                          {report.title}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {report.oldVersion} → {report.newVersion}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/30 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent
            value="settings"
            className="flex-1 overflow-y-auto space-y-5 p-6"
          >
            {/* Format Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent" />
                <Label className="font-semibold text-sm">Export Format</Label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    value: "zip",
                    label: "ZIP Archive",
                    desc: "Individual PDFs",
                    icon: FileArchive,
                  },
                  {
                    value: "pdf",
                    label: "PDF Document",
                    desc: "Single or merged",
                    icon: FileText,
                  },
                ].map(({ value, label, desc, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setFormat(value as "pdf" | "zip")}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                      format === value
                        ? "border-accent bg-accent/10"
                        : "border-accent/20 bg-background/50 hover:border-accent/40"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4" />
                      <span className="font-semibold text-sm">{label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* PDF Options */}
            {format === "pdf" && (
              <div className="space-y-3 p-4 bg-accent/5 rounded-lg border border-accent/20">
                <p className="text-xs font-semibold text-accent">PDF Options</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="mergeIntoSinglePDF"
                      checked={mergeIntoSinglePDF}
                      onCheckedChange={(checked) =>
                        setMergeIntoSinglePDF(checked as boolean)
                      }
                    />
                    <Label
                      htmlFor="mergeIntoSinglePDF"
                      className="font-medium text-sm cursor-pointer"
                    >
                      Merge into single PDF
                    </Label>
                  </div>

                  {mergeIntoSinglePDF && (
                    <div className="ml-6 p-3 bg-background/50 rounded border border-accent/10">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="includeTableOfContents"
                          checked={includeTableOfContents}
                          onCheckedChange={(checked) =>
                            setIncludeTableOfContents(checked as boolean)
                          }
                        />
                        <Label
                          htmlFor="includeTableOfContents"
                          className="font-medium text-sm cursor-pointer"
                        >
                          Include table of contents
                        </Label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Display Options Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Color Scheme */}
              <div className="space-y-2">
                <Label htmlFor="colorScheme" className="text-sm font-semibold">
                  Color Scheme
                </Label>
                <Select
                  value={colorScheme}
                  onValueChange={(v) => setColorScheme(v as "light" | "dark")}
                >
                  <SelectTrigger
                    id="colorScheme"
                    className="border-accent/20 hover:border-accent/40 transition-colors"
                  >
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
                <Label htmlFor="pageSize" className="text-sm font-semibold">
                  Page Size
                </Label>
                <Select
                  value={pageSize}
                  onValueChange={(v) => setPageSize(v as "letter" | "a4")}
                >
                  <SelectTrigger
                    id="pageSize"
                    className="border-accent/20 hover:border-accent/40 transition-colors"
                  >
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
                <Label htmlFor="fontSize" className="text-sm font-semibold">
                  Font Size
                </Label>
                <Select
                  value={fontSize.toString()}
                  onValueChange={(v) => setFontSize(parseInt(v))}
                >
                  <SelectTrigger
                    id="fontSize"
                    className="border-accent/20 hover:border-accent/40 transition-colors"
                  >
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

              {/* Placeholder for alignment */}
              <div />
            </div>

            {/* Content Options */}
            <div className="space-y-3 p-4 bg-accent/5 rounded-lg border border-accent/20">
              <p className="text-xs font-semibold text-accent">Content</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="statistics"
                    checked={includeStatistics}
                    onCheckedChange={(checked) =>
                      setIncludeStatistics(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="statistics"
                    className="font-medium text-sm cursor-pointer"
                  >
                    Include Statistics
                  </Label>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox
                    id="lineNumbers"
                    checked={showLineNumbers}
                    onCheckedChange={(checked) =>
                      setShowLineNumbers(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="lineNumbers"
                    className="font-medium text-sm cursor-pointer"
                  >
                    Show Line Numbers
                  </Label>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {/* Summary Card */}
              <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Export Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-background/50 rounded-lg border border-accent/10">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Format
                      </p>
                      <p className="text-sm font-semibold flex items-center gap-2">
                        <FormatIcon className="w-4 h-4 text-accent" />
                        {formatLabel}
                      </p>
                    </div>

                    <div className="p-3 bg-background/50 rounded-lg border border-accent/10">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Reports
                      </p>
                      <p className="text-sm font-semibold">
                        {selectedReports.size} selected
                      </p>
                    </div>

                    <div className="p-3 bg-background/50 rounded-lg border border-accent/10">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Est. Size
                      </p>
                      <p className="text-sm font-semibold">{estimatedSize} MB</p>
                    </div>

                    <div className="p-3 bg-background/50 rounded-lg border border-accent/10">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Color
                      </p>
                      <p className="text-sm font-semibold capitalize">
                        {colorScheme}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Alert */}
              {selectedReports.size > 0 ? (
                <Alert className="border-green-500/30 bg-green-500/5">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-700 dark:text-green-400">
                    Ready to export {selectedReports.size} report
                    {selectedReports.size !== 1 ? "s" : ""}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive" className="bg-red-500/5">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please select at least one report to export
                  </AlertDescription>
                </Alert>
              )}

              {/* Settings Summary */}
              <Card className="border-accent/10 bg-background/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Page Size:</span>
                    <span className="font-semibold">{pageSize.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Font Size:</span>
                    <span className="font-semibold">{fontSize}pt</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Statistics:</span>
                    <span className="font-semibold">
                      {includeStatistics ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Line Numbers:</span>
                    <span className="font-semibold">
                      {showLineNumbers ? "Yes" : "No"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Progress Bar */}
        {isExporting && (
          <div className="border-t border-accent/10 p-4 space-y-3 bg-accent/5">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold">Exporting...</span>
              <span className="text-xs font-semibold text-accent">
                {exportProgress}%
              </span>
            </div>
            <Progress value={exportProgress} className="h-2" />
          </div>
        )}

        {/* Export Button */}
        <div className="border-t border-accent/10 p-4 bg-gradient-to-r from-background to-accent/5 flex gap-3">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="flex-1"
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || selectedReports.size === 0}
            className="flex-1 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 transition-all duration-200"
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
