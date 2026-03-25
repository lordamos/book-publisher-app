import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PrintPreviewViewer } from "./PrintPreviewViewer";

interface PrintPreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  pdfData: string | ArrayBuffer;
  fileName?: string;
  title?: string;
}

export function PrintPreviewDialog({
  isOpen,
  onOpenChange,
  pdfData,
  fileName = "document.pdf",
  title = "Print Preview",
}: PrintPreviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Preview how your book will look when printed. Use the controls to navigate, zoom, and adjust the view.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <PrintPreviewViewer
            pdfData={pdfData}
            fileName={fileName}
            onClose={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
