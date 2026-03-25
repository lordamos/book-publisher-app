import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Printer,
  RotateCw,
  Maximize2,
  X,
} from "lucide-react";
import { toast } from "sonner";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PrintPreviewViewerProps {
  pdfData: string | ArrayBuffer; // Base64 or binary data
  fileName?: string;
  onClose?: () => void;
  onDownload?: () => void;
}

export function PrintPreviewViewer({
  pdfData,
  fileName = "document.pdf",
  onClose,
  onDownload,
}: PrintPreviewViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdf, setPdf] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [pageInput, setPageInput] = useState("1");

  // Load PDF
  useEffect(() => {
    const loadPDF = async () => {
      try {
        let data: ArrayBuffer;

        if (typeof pdfData === "string") {
          // Handle base64 string
          const binaryString = atob(pdfData);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          data = bytes.buffer;
        } else {
          data = pdfData;
        }

        const loadedPdf = await pdfjsLib.getDocument({ data }).promise;
        setPdf(loadedPdf);
        setTotalPages(loadedPdf.numPages);
        setCurrentPage(1);
        setPageInput("1");
      } catch (error) {
        console.error("Failed to load PDF:", error);
        toast.error("Failed to load PDF");
      }
    };

    loadPDF();
  }, [pdfData]);

  // Render current page
  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        const page = await pdf.getPage(currentPage);
        const viewport = page.getViewport({ scale: zoom / 100, rotation });

        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;
      } catch (error) {
        console.error("Failed to render page:", error);
        toast.error("Failed to render page");
      }
    };

    renderPage();
  }, [pdf, currentPage, zoom, rotation]);

  // Handle page navigation
  const goToPage = (page: number) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(newPage);
    setPageInput(newPage.toString());
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = () => {
    const page = parseInt(pageInput, 10);
    if (!isNaN(page)) {
      goToPage(page);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  // Handle zoom
  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.max(50, Math.min(200, prev + delta)));
  };

  // Handle rotation
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Handle download
  const handleDownload = () => {
    if (typeof pdfData === "string") {
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${pdfData}`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    onDownload?.();
    toast.success("PDF downloaded successfully");
  };

  // Handle print
  const handlePrint = () => {
    if (typeof pdfData === "string") {
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${pdfData}`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    toast.success("Opening print dialog...");
  };

  // Toggle fullscreen
  const handleFullScreen = async () => {
    if (!isFullScreen && containerRef.current) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullScreen(true);
      } catch (error) {
        console.error("Failed to enter fullscreen:", error);
      }
    } else {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      setIsFullScreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-gray-100 ${isFullScreen ? "fixed inset-0 z-50" : "rounded-lg border"}`}
    >
      {/* Toolbar */}
      <div className="bg-white border-b p-4 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Page{" "}
            <Input
              type="number"
              min="1"
              max={totalPages}
              value={pageInput}
              onChange={handlePageInputChange}
              onBlur={handlePageInputSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handlePageInputSubmit();
                }
              }}
              className="w-12 h-8 text-center"
            />{" "}
            of {totalPages}
          </span>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            title="First page"
          >
            <ChevronFirst className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            title="Last page"
          >
            <ChevronLast className="w-4 h-4" />
          </Button>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoom(-10)}
            disabled={zoom === 50}
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-gray-700 w-12 text-center">
            {zoom}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoom(10)}
            disabled={zoom === 200}
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRotate}
            title="Rotate page"
          >
            <RotateCw className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFullScreen}
            title={isFullScreen ? "Exit fullscreen" : "Fullscreen"}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            title="Print"
          >
            <Printer className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            title="Download"
          >
            <Download className="w-4 h-4" />
          </Button>
          {onClose && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              title="Close"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        {pdf ? (
          <canvas
            ref={canvasRef}
            className="shadow-lg bg-white"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
            }}
          />
        ) : (
          <div className="text-center">
            <p className="text-gray-500">Loading PDF...</p>
          </div>
        )}
      </div>

      {/* Print Settings Panel */}
      <div className="bg-white border-t p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <p>
              <strong>File:</strong> {fileName}
            </p>
            <p>
              <strong>Pages:</strong> {totalPages}
            </p>
            <p>
              <strong>Current Zoom:</strong> {zoom}%
            </p>
            <p>
              <strong>Rotation:</strong> {rotation}°
            </p>
          </div>
          <div className="text-xs text-gray-500 text-right">
            <p>Print Tips:</p>
            <ul className="list-disc list-inside">
              <li>Use "Print to File" for PDF output</li>
              <li>Ensure margins are set correctly</li>
              <li>Preview shows actual print layout</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
