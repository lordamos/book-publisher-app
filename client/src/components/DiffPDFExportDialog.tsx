import React, { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Download,
  Eye,
  FileText,
  Zap,
  Settings,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface DiffPDFExportDialogProps {
  oldText: string;
  newText: string;
  oldVersion?: string;
  newVersion?: string;
  onExport?: () => void;
}

export default function DiffPDFExportDialog({
  oldText,
  newText,
  oldVersion = "Original",
  newVersion = "Modified",
  onExport,
}: DiffPDFExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("Version Comparison");
  const [colorScheme, setColorScheme] = useState<"light" | "dark">("light");
  const [pageSize, setPageSize] = useState<"letter" | "a4">("letter");
  const [fontSize, setFontSize] = useState(9);
  const [includeStatistics, setIncludeStatistics] = useState(true);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("settings");

  const generatePDFMutation = trpc.diffexport.generatePDF.useMutation();

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      const result = await generatePDFMutation.mutateAsync({
        oldText,
        newText,
        title,
        oldVersion,
        newVersion,
        colorScheme,
        pageSize,
        fontSize,
        includeStatistics,
        showLineNumbers,
      });

      if (result.success && result.data) {
        const binaryString = atob(result.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success("✨ PDF exported successfully");
        onExport?.();
        setOpen(false);
      } else {
        toast.error(result.error || "Failed to export PDF");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to export PDF"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 hover:bg-accent transition-all duration-200"
        >
          <FileText className="w-4 h-4" />
          Export PDF
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl bg-gradient-to-br from-background via-background to-accent/5 border-accent/20">
        <DialogHeader className="border-b border-accent/10 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Export as PDF
              </DialogTitle>
              <DialogDescription className="text-sm mt-1">
                Configure and download your diff comparison as a PDF
              </DialogDescription>
            </div>
            <Badge
              variant="secondary"
              className="bg-accent/10 text-accent border-accent/20"
            >
              <FileText className="w-3 h-3 mr-1" />
              PDF
            </Badge>
          </div>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 bg-accent/5 border-b border-accent/10 rounded-none">
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-accent rounded-none transition-all duration-200"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-accent rounded-none transition-all duration-200"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 p-6">
            {/* Title Section */}
            <div className="space-y-3">
              <Label htmlFor="title" className="text-sm font-semibold">
                Document Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter PDF title"
                className="border-accent/20 focus:border-accent/40 transition-colors"
              />
            </div>

            {/* Version Info */}
            <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
              <p className="text-xs font-semibold text-accent mb-3">
                Version Information
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">From</p>
                  <p className="text-sm font-semibold">{oldVersion}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">To</p>
                  <p className="text-sm font-semibold">{newVersion}</p>
                </div>
              </div>
            </div>

            {/* Format Options Grid */}
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

              {/* Placeholder */}
              <div />
            </div>

            {/* Content Options */}
            <div className="space-y-3 p-4 bg-accent/5 rounded-lg border border-accent/20">
              <p className="text-xs font-semibold text-accent">Content Options</p>
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
                  <span className="text-xs text-muted-foreground ml-auto">
                    (additions, deletions, etc.)
                  </span>
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
                  <span className="text-xs text-muted-foreground ml-auto">
                    (for reference)
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-4 p-6">
            <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Export Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-background/50 rounded-lg border border-accent/10">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      Title
                    </p>
                    <p className="text-sm font-semibold truncate">{title}</p>
                  </div>

                  <div className="p-3 bg-background/50 rounded-lg border border-accent/10">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      Format
                    </p>
                    <p className="text-sm font-semibold">
                      {pageSize.toUpperCase()}
                    </p>
                  </div>

                  <div className="p-3 bg-background/50 rounded-lg border border-accent/10">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      Font Size
                    </p>
                    <p className="text-sm font-semibold">{fontSize}pt</p>
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

                <div className="pt-2 border-t border-accent/10">
                  <p className="text-xs text-muted-foreground mb-2">
                    Content Included:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {includeStatistics && (
                      <Badge variant="secondary" className="bg-accent/10">
                        Statistics
                      </Badge>
                    )}
                    {showLineNumbers && (
                      <Badge variant="secondary" className="bg-accent/10">
                        Line Numbers
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/20 bg-background/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent" />
                  Quick Info
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-muted-foreground">
                <p>
                  • Your diff will be formatted as a professional side-by-side
                  PDF
                </p>
                <p>
                  • Changes are color-coded: green for additions, red for
                  deletions
                </p>
                <p>• The PDF includes headers with version information</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="border-t border-accent/10 p-4 bg-gradient-to-r from-background to-accent/5 flex gap-3">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="flex-1"
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className="flex-1 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 transition-all duration-200"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
