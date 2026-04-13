import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  PDFExportOptions,
  DEFAULT_PDF_OPTIONS,
  validatePDFOptions,
  sanitizeFilename,
  generatePDFFilename,
  estimatePDFSize,
  formatFileSize,
  getEstimatedExportTime,
} from "@/lib/pdfExport";
import { FileDown, AlertCircle } from "lucide-react";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: PDFExportOptions) => void;
  isLoading?: boolean;
  bookTitle?: string;
  totalPages?: number;
}

export function ExportDialog({
  isOpen,
  onClose,
  onExport,
  isLoading = false,
  bookTitle = "book",
  totalPages = 0,
}: ExportDialogProps) {
  const [options, setOptions] = useState<PDFExportOptions>({
    ...DEFAULT_PDF_OPTIONS,
    filename: generatePDFFilename(bookTitle),
  });

  const [errors, setErrors] = useState<string[]>([]);

  const handleExport = () => {
    const validation = validatePDFOptions(options);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors([]);
    onExport(options);
  };

  const estimatedSize = estimatePDFSize(
    options.pageRange === "all"
      ? totalPages
      : options.pageRange === "current"
        ? 1
        : (options.endPage || 1) - (options.startPage || 1) + 1,
    options.quality
  );

  const estimatedTime = getEstimatedExportTime(
    options.pageRange === "all"
      ? totalPages
      : options.pageRange === "current"
        ? 1
        : (options.endPage || 1) - (options.startPage || 1) + 1,
    options.quality
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="w-5 h-5" />
            Export to PDF
          </DialogTitle>
          <DialogDescription>
            Configure your PDF export settings and download your book
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 space-y-1">
              {errors.map((error, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="pages">Pages</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-4">
              <div>
                <Label htmlFor="filename">Filename</Label>
                <Input
                  id="filename"
                  value={options.filename}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      filename: sanitizeFilename(e.target.value),
                    })
                  }
                  placeholder="book.pdf"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="quality">Quality</Label>
                <Select
                  value={options.quality}
                  onValueChange={(value: any) =>
                    setOptions({ ...options, quality: value })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger id="quality">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (Smaller file, faster)</SelectItem>
                    <SelectItem value="medium">Medium (Balanced)</SelectItem>
                    <SelectItem value="high">High (Better quality, larger file)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="paperSize">Paper Size</Label>
                <Select
                  value={options.paperSize}
                  onValueChange={(value: any) =>
                    setOptions({ ...options, paperSize: value })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger id="paperSize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="letter">Letter (8.5" × 11")</SelectItem>
                    <SelectItem value="a4">A4 (210 × 297 mm)</SelectItem>
                    <SelectItem value="a5">A5 (148 × 210 mm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includePageNumbers"
                    checked={options.includePageNumbers}
                    onCheckedChange={(checked) =>
                      setOptions({
                        ...options,
                        includePageNumbers: checked as boolean,
                      })
                    }
                    disabled={isLoading}
                  />
                  <Label htmlFor="includePageNumbers" className="font-normal cursor-pointer">
                    Include page numbers
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeMetadata"
                    checked={options.includeMetadata}
                    onCheckedChange={(checked) =>
                      setOptions({
                        ...options,
                        includeMetadata: checked as boolean,
                      })
                    }
                    disabled={isLoading}
                  />
                  <Label htmlFor="includeMetadata" className="font-normal cursor-pointer">
                    Include metadata (title, author, etc.)
                  </Label>
                </div>
              </div>
            </TabsContent>

            {/* Pages Tab */}
            <TabsContent value="pages" className="space-y-4">
              <div>
                <Label htmlFor="pageRange">Page Range</Label>
                <Select
                  value={options.pageRange}
                  onValueChange={(value: any) =>
                    setOptions({ ...options, pageRange: value })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger id="pageRange">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Pages ({totalPages})</SelectItem>
                    <SelectItem value="current">Current Page Only</SelectItem>
                    <SelectItem value="range">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {options.pageRange === "range" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startPage">Start Page</Label>
                    <Input
                      id="startPage"
                      type="number"
                      min="1"
                      max={totalPages}
                      value={options.startPage || 1}
                      onChange={(e) =>
                        setOptions({
                          ...options,
                          startPage: Math.max(1, parseInt(e.target.value) || 1),
                        })
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endPage">End Page</Label>
                    <Input
                      id="endPage"
                      type="number"
                      min="1"
                      max={totalPages}
                      value={options.endPage || totalPages}
                      onChange={(e) =>
                        setOptions({
                          ...options,
                          endPage: Math.min(totalPages, parseInt(e.target.value) || totalPages),
                        })
                      }
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Layout Tab */}
            <TabsContent value="layout" className="space-y-6">
              <div>
                <Label className="mb-3 block">Top Margin: {options.marginTop} mm</Label>
                <Slider
                  value={[options.marginTop]}
                  onValueChange={(value) =>
                    setOptions({ ...options, marginTop: value[0] })
                  }
                  min={0}
                  max={50}
                  step={1}
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label className="mb-3 block">Bottom Margin: {options.marginBottom} mm</Label>
                <Slider
                  value={[options.marginBottom]}
                  onValueChange={(value) =>
                    setOptions({ ...options, marginBottom: value[0] })
                  }
                  min={0}
                  max={50}
                  step={1}
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label className="mb-3 block">Left Margin: {options.marginLeft} mm</Label>
                <Slider
                  value={[options.marginLeft]}
                  onValueChange={(value) =>
                    setOptions({ ...options, marginLeft: value[0] })
                  }
                  min={0}
                  max={50}
                  step={1}
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label className="mb-3 block">Right Margin: {options.marginRight} mm</Label>
                <Slider
                  value={[options.marginRight]}
                  onValueChange={(value) =>
                    setOptions({ ...options, marginRight: value[0] })
                  }
                  min={0}
                  max={50}
                  step={1}
                  disabled={isLoading}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Export Preview */}
          <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated file size:</span>
              <span className="font-semibold">{formatFileSize(estimatedSize)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated export time:</span>
              <span className="font-semibold">{estimatedTime.toFixed(1)}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quality:</span>
              <span className="font-semibold capitalize">{options.quality}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isLoading}>
            {isLoading ? "Exporting..." : "Export to PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
