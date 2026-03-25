import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface PDFThumbnailsProps {
  pdfData: string | ArrayBuffer;
  currentPage: number;
  onPageSelect: (page: number) => void;
  totalPages: number;
}

export function PDFThumbnails({
  pdfData,
  currentPage,
  onPageSelect,
  totalPages,
}: PDFThumbnailsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [pdf, setPdf] = useState<any>(null);

  // Load PDF
  useEffect(() => {
    const loadPDF = async () => {
      try {
        let data: ArrayBuffer;

        if (typeof pdfData === "string") {
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
      } catch (error) {
        console.error("Failed to load PDF:", error);
      }
    };

    loadPDF();
  }, [pdfData]);

  // Generate thumbnails
  useEffect(() => {
    if (!pdf) return;

    const generateThumbnails = async () => {
      const thumbs: string[] = [];

      for (let i = 1; i <= Math.min(totalPages, 10); i++) {
        try {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.5 });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) continue;

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: context,
            viewport,
          }).promise;

          thumbs.push(canvas.toDataURL("image/png"));
        } catch (error) {
          console.error(`Failed to generate thumbnail for page ${i}:`, error);
        }
      }

      setThumbnails(thumbs);
    };

    generateThumbnails();
  }, [pdf, totalPages]);

  // Scroll to current page
  useEffect(() => {
    if (containerRef.current && currentPage > 0) {
      const thumbnail = containerRef.current.querySelector(
        `[data-page="${currentPage}"]`
      ) as HTMLElement;
      if (thumbnail) {
        thumbnail.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [currentPage]);

  return (
    <ScrollArea className="w-24 border-r bg-gray-50">
      <div ref={containerRef} className="flex flex-col gap-2 p-2">
        {thumbnails.map((thumb, index) => (
          <button
            key={index}
            data-page={index + 1}
            onClick={() => onPageSelect(index + 1)}
            className={cn(
              "relative overflow-hidden rounded border-2 transition-all hover:border-primary",
              currentPage === index + 1
                ? "border-primary shadow-md"
                : "border-gray-300"
            )}
            title={`Page ${index + 1}`}
          >
            <img
              src={thumb}
              alt={`Page ${index + 1}`}
              className="w-full h-auto"
            />
            <span className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-1 rounded">
              {index + 1}
            </span>
          </button>
        ))}
        {totalPages > 10 && (
          <div className="text-center text-xs text-gray-500 py-2">
            +{totalPages - 10} more pages
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
