import { Page } from "@shared/types";
import { PageThumbnail } from "./PageThumbnail";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PageManagementSidebarProps {
  pages: Page[];
  selectedPageId: number;
  onSelectPage: (pageId: number) => void;
  onDeletePage: (pageId: number) => void;
  onDuplicatePage: (pageId: number) => void;
  onAddPageAfter: (pageId: number) => void;
  onAddNewPage: () => void;
  onReorderPages: (pages: Page[]) => void;
}

export function PageManagementSidebar({
  pages,
  selectedPageId,
  onSelectPage,
  onDeletePage,
  onDuplicatePage,
  onAddPageAfter,
  onAddNewPage,
  onReorderPages,
}: PageManagementSidebarProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetPageId: number) => {
    e.preventDefault();
    const sourcePageId = parseInt(e.dataTransfer.getData("pageId"), 10);
    
    if (sourcePageId === targetPageId) return;

    const sourceIndex = pages.findIndex((p) => p.id === sourcePageId);
    const targetIndex = pages.findIndex((p) => p.id === targetPageId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const newPages = [...pages];
    const [movedPage] = newPages.splice(sourceIndex, 1);
    newPages.splice(targetIndex, 0, movedPage);

    onReorderPages(newPages);
  };

  return (
    <div className="w-48 bg-slate-50 border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Pages</h3>
          <span className="text-xs text-muted-foreground bg-slate-200 px-2 py-1 rounded">
            {pages.length}
          </span>
        </div>
        <Button
          onClick={onAddNewPage}
          size="sm"
          className="w-full"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Page
        </Button>
      </div>

      {/* Pages List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {pages.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-center">
              <p className="text-xs text-muted-foreground">
                No pages yet. Click "Add Page" to get started.
              </p>
            </div>
          ) : (
            pages.map((page, index) => (
              <div
                key={page.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, page.id)}
                className="transition-colors hover:bg-slate-100 rounded-lg p-1"
              >
                <PageThumbnail
                  page={page}
                  pageNumber={index + 1}
                  isSelected={selectedPageId === page.id}
                  onSelect={onSelectPage}
                  onDelete={onDeletePage}
                  onDuplicate={onDuplicatePage}
                  onAddAfter={onAddPageAfter}
                />
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer Stats */}
      {pages.length > 0 && (
        <div className="p-3 border-t border-border bg-white text-xs text-muted-foreground">
          <div className="space-y-1">
            <p>Total Pages: <span className="font-semibold">{pages.length}</span></p>
            <p>Selected: <span className="font-semibold">
              {pages.findIndex((p) => p.id === selectedPageId) + 1}
            </span></p>
          </div>
        </div>
      )}
    </div>
  );
}
