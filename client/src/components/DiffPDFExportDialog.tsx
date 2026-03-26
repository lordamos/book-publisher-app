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
import { Loader2, Download, Eye } from "lucide-react";
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
  const [htmlPreview, setHtmlPreview] = useState<string | null>(null);

  const generatePDFMutation = trpc.diffexport.generatePDF.useMutation();
  const generateHTMLQuery = trpc.diffexport.generateHTML.useQuery(
    {
      oldText,
      newText,
      title,
      oldVersion,
      newVersion,
    },
    { enabled: false }
  );

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
        // Convert base64 to blob and download
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

        toast.success("PDF exported successfully");
        onExport?.();
        setOpen(false);
      } else {
        toast.error(result.error || "Failed to generate PDF");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewHTML = async () => {
    try {
      const result = await generateHTMLQuery.refetch();
      if (result.data?.success && result.data.html) {
        setHtmlPreview(result.data.html);
      } else {
        toast.error("Failed to generate preview");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate preview");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export as PDF
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Diff as PDF</DialogTitle>
          <DialogDescription>
            Configure PDF export options for your side-by-side comparison
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Document Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Version Comparison"
              />
            </div>

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

            {/* Export Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleGeneratePDF}
                disabled={isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>

              <Button
                onClick={handlePreviewHTML}
                variant="outline"
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {htmlPreview ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">HTML Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white p-4 rounded border max-h-96 overflow-auto">
                    <iframe
                      srcDoc={htmlPreview}
                      className="w-full h-96 border-0"
                      title="PDF Preview"
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <p>Click "Preview" in the Settings tab to generate a preview</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
