import { Book } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Plus, Save, Download, FileDown } from "lucide-react";
import { useState } from "react";
import { KDPExportDialog } from "./KDPExportDialog";
import { ExportDialog } from "./ExportDialog";
import { PDFExportOptions } from "@/lib/pdfExport";
import { trpc } from "@/lib/trpc";

interface BookEditorToolbarProps {
  book: Book;
  currentPageIndex: number;
  totalPages: number;
  onPageChange: (index: number) => void;
  onAddNewPage?: () => void;
}

export function BookEditorToolbar({
  book,
  currentPageIndex,
  totalPages,
  onPageChange,
  onAddNewPage,
}: BookEditorToolbarProps) {
  const [isKDPDialogOpen, setIsKDPDialogOpen] = useState(false);
  const [isPDFDialogOpen, setIsPDFDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const exportPDFMutation = trpc.export.pdf.useMutation();

  return (
    <>
      <div className="flex items-center justify-between gap-4 p-4 bg-card border border-border rounded-lg">
        {/* Left: Book Info */}
        <div className="flex-1">
          <h2 className="font-semibold text-foreground">{book.title}</h2>
          <p className="text-sm text-muted-foreground">{book.author}</p>
        </div>

        {/* Center: Page Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(0, currentPageIndex - 1))}
            disabled={currentPageIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Input
            type="number"
            min="1"
            max={totalPages}
            value={currentPageIndex + 1}
            onChange={(e) => onPageChange(parseInt(e.target.value, 10) - 1)}
            className="w-16 text-center"
          />
          <span className="text-sm text-muted-foreground">/ {totalPages}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages - 1, currentPageIndex + 1))}
            disabled={currentPageIndex === totalPages - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            title="Add new page"
            onClick={onAddNewPage}
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" title="Save changes">
            <Save className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            title="Export to PDF"
            onClick={() => setIsPDFDialogOpen(true)}
            className="gap-2"
          >
            <FileDown className="w-4 h-4" />
            Export PDF
          </Button>
          <Button
            variant="default"
            size="sm"
            title="Export to Amazon KDP"
            onClick={() => setIsKDPDialogOpen(true)}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export KDP
          </Button>
        </div>
      </div>

      {/* PDF Export Dialog */}
      <ExportDialog
        isOpen={isPDFDialogOpen}
        onClose={() => setIsPDFDialogOpen(false)}
        onExport={(options: PDFExportOptions) => {
          setIsExporting(true);
          exportPDFMutation.mutate(
            {
              bookId: book.id.toString(),
              options,
            },
            {
              onSuccess: (result: any) => {
                if (result.url) {
                  // Download the PDF
                  const link = document.createElement("a");
                  link.href = result.url;
                  link.download = options.filename;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
                setIsExporting(false);
                setIsPDFDialogOpen(false);
              },
              onError: () => {
                setIsExporting(false);
              },
            }
          );
        }}
        isLoading={isExporting}
        bookTitle={book.title}
        totalPages={totalPages}
      />

      {/* KDP Export Dialog */}
      <KDPExportDialog
        book={book}
        isOpen={isKDPDialogOpen}
        onOpenChange={setIsKDPDialogOpen}
      />
    </>
  );
}
