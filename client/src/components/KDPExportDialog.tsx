import { Book } from "@shared/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle2, Download, Loader2 } from "lucide-react";
import { useState } from "react";

interface KDPExportDialogProps {
  book: Book;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KDPExportDialog({ book, isOpen, onOpenChange }: KDPExportDialogProps) {
  const [includeFrontMatter, setIncludeFrontMatter] = useState(true);
  const [includeTableOfContents, setIncludeTableOfContents] = useState(true);
  const [includeBackMatter, setIncludeBackMatter] = useState(false);

  const validateQuery = trpc.kdp.validate.useQuery({ bookId: book.id }, { enabled: isOpen });
  const exportMutation = trpc.kdp.export.useMutation();

  const handleExport = async () => {
    try {
      const result = await exportMutation.mutateAsync({
        bookId: book.id,
        includeFrontMatter,
        includeTableOfContents,
        includeBackMatter,
      });

      // In a real implementation, this would trigger a download
      console.log("Export successful:", result);
      onOpenChange(false);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const validation = validateQuery.data;
  const isValid = validation?.valid ?? false;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export to Amazon KDP</DialogTitle>
          <DialogDescription>
            Prepare your book for Amazon Kindle Direct Publishing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Validation Status */}
          {validateQuery.isLoading ? (
            <Card className="p-4 flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <p className="text-sm">Validating your book...</p>
            </Card>
          ) : validation ? (
            <>
              {!isValid && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-semibold">Validation Issues:</p>
                      <ul className="list-disc list-inside text-sm">
                        {validation.errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {validation.warnings.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-semibold">Recommendations:</p>
                      <ul className="list-disc list-inside text-sm">
                        {validation.warnings.map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {isValid && (
                <Card className="p-4 flex items-center gap-3 bg-green-50 border-green-200">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-700">Your book is ready for KDP export!</p>
                </Card>
              )}
            </>
          ) : null}

          {/* Export Options */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Export Options</Label>

            <div className="flex items-center gap-3">
              <Checkbox
                id="frontMatter"
                checked={includeFrontMatter}
                onCheckedChange={(checked) => setIncludeFrontMatter(checked as boolean)}
              />
              <label htmlFor="frontMatter" className="text-sm cursor-pointer">
                Include Front Matter (title page, copyright, etc.)
              </label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="toc"
                checked={includeTableOfContents}
                onCheckedChange={(checked) => setIncludeTableOfContents(checked as boolean)}
              />
              <label htmlFor="toc" className="text-sm cursor-pointer">
                Include Table of Contents
              </label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="backMatter"
                checked={includeBackMatter}
                onCheckedChange={(checked) => setIncludeBackMatter(checked as boolean)}
              />
              <label htmlFor="backMatter" className="text-sm cursor-pointer">
                Include Back Matter (about author, etc.)
              </label>
            </div>
          </div>

          {/* Export Info */}
          <Card className="p-3 bg-muted">
            <p className="text-xs text-muted-foreground">
              <strong>Book Details:</strong>
              <br />
              Title: {book.title}
              <br />
              Pages: {book.pageCount || "0"}
              <br />
              Format: 6x9 inches (standard KDP)
            </p>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={!isValid || exportMutation.isPending}
              className="flex-1 gap-2"
            >
              {exportMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
