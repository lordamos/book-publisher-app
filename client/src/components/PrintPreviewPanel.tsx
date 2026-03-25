import { useState } from "react";
import { PrintPreviewViewer } from "./PrintPreviewViewer";
import { PDFThumbnails } from "./PDFThumbnails";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PrintPreviewPanelProps {
  pdfData: string | ArrayBuffer;
  fileName?: string;
  onClose?: () => void;
  onDownload?: () => void;
}

interface PrintSettings {
  paperSize: "letter" | "a4" | "a5" | "custom";
  orientation: "portrait" | "landscape";
  margins: "none" | "small" | "normal" | "large";
  colorMode: "color" | "grayscale" | "blackwhite";
  showThumbnails: boolean;
  showPageNumbers: boolean;
}

export function PrintPreviewPanel({
  pdfData,
  fileName = "document.pdf",
  onClose,
  onDownload,
}: PrintPreviewPanelProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<PrintSettings>({
    paperSize: "letter",
    orientation: "portrait",
    margins: "normal",
    colorMode: "color",
    showThumbnails: true,
    showPageNumbers: true,
  });

  const handleSettingChange = (key: keyof PrintSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const paperSizeSpecs: Record<string, { width: number; height: number }> = {
    letter: { width: 8.5, height: 11 },
    a4: { width: 8.27, height: 11.69 },
    a5: { width: 5.83, height: 8.27 },
    custom: { width: 6, height: 9 },
  };

  const marginSpecs: Record<string, number> = {
    none: 0,
    small: 0.5,
    normal: 0.75,
    large: 1,
  };

  const currentPaperSize = paperSizeSpecs[settings.paperSize];
  const currentMargin = marginSpecs[settings.margins];

  return (
    <div className="flex h-full bg-gray-100">
      {/* Thumbnails Sidebar */}
      {settings.showThumbnails && (
        <PDFThumbnails
          pdfData={pdfData}
          currentPage={currentPage}
          onPageSelect={setCurrentPage}
          totalPages={totalPages}
        />
      )}

      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col">
        {/* Preview Viewer */}
        <div className="flex-1 overflow-hidden">
          <PrintPreviewViewer
            pdfData={pdfData}
            fileName={fileName}
            onClose={onClose}
            onDownload={onDownload}
          />
        </div>

        {/* Settings Panel */}
        <div className="bg-white border-t">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Print Settings</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                {showSettings ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>

            {showSettings && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Paper Size */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Paper Size</Label>
                  <Select
                    value={settings.paperSize}
                    onValueChange={(value) =>
                      handleSettingChange("paperSize", value)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="letter">Letter (8.5×11")</SelectItem>
                      <SelectItem value="a4">A4 (8.27×11.69")</SelectItem>
                      <SelectItem value="a5">A5 (5.83×8.27")</SelectItem>
                      <SelectItem value="custom">Custom (6×9")</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Orientation */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Orientation</Label>
                  <Select
                    value={settings.orientation}
                    onValueChange={(value) =>
                      handleSettingChange("orientation", value)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Margins */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Margins</Label>
                  <Select
                    value={settings.margins}
                    onValueChange={(value) =>
                      handleSettingChange("margins", value)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="small">Small (0.5")</SelectItem>
                      <SelectItem value="normal">Normal (0.75")</SelectItem>
                      <SelectItem value="large">Large (1")</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Color Mode */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Color Mode</Label>
                  <Select
                    value={settings.colorMode}
                    onValueChange={(value) =>
                      handleSettingChange("colorMode", value)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="color">Color</SelectItem>
                      <SelectItem value="grayscale">Grayscale</SelectItem>
                      <SelectItem value="blackwhite">Black & White</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Checkboxes */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Options</Label>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="thumbnails"
                        checked={settings.showThumbnails}
                        onCheckedChange={(checked) =>
                          handleSettingChange("showThumbnails", checked)
                        }
                      />
                      <Label htmlFor="thumbnails" className="text-xs cursor-pointer">
                        Thumbnails
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="pageNumbers"
                        checked={settings.showPageNumbers}
                        onCheckedChange={(checked) =>
                          handleSettingChange("showPageNumbers", checked)
                        }
                      />
                      <Label htmlFor="pageNumbers" className="text-xs cursor-pointer">
                        Page Numbers
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Print Specs Summary */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-900">
                <strong>Print Specifications:</strong> {currentPaperSize.width}" × {currentPaperSize.height}" ({settings.orientation}),
                {currentMargin}" margins, {settings.colorMode} mode
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
