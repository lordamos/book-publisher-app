import { Page } from "@shared/types";
import { Trash2, Copy, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageThumbnailProps {
  page: Page;
  pageNumber: number;
  isSelected: boolean;
  onSelect: (pageId: number) => void;
  onDelete: (pageId: number) => void;
  onDuplicate: (pageId: number) => void;
  onAddAfter: (pageId: number) => void;
  isDragging?: boolean;
}

export function PageThumbnail({
  page,
  pageNumber,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onAddAfter,
  isDragging,
}: PageThumbnailProps) {
  const renderThumbnailContent = () => {
    try {
      const content = typeof page.content === "string" ? JSON.parse(page.content) : page.content;
      const hasContent = content?.textBlocks?.length > 0 || content?.images?.length > 0;
      
      return (
        <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 p-2 flex flex-col">
          {/* Page Number */}
          <div className="text-xs font-semibold text-slate-600 mb-1">Page {pageNumber}</div>
          
          {/* Content Preview */}
          {hasContent ? (
            <div className="flex-1 text-xs text-slate-500 overflow-hidden">
              {content?.textBlocks?.[0]?.text && (
                <p className="line-clamp-2 text-slate-700 font-medium mb-1">
                  {content.textBlocks[0].text}
                </p>
              )}
              {content?.images?.length > 0 && (
                <div className="flex items-center gap-1 text-slate-600">
                  <div className="w-3 h-3 bg-slate-300 rounded" />
                  <span>{content.images.length} image{content.images.length > 1 ? "s" : ""}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <span className="text-xs">Empty page</span>
            </div>
          )}
        </div>
      );
    } catch {
      return (
        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
          <span className="text-xs text-slate-500">Page {pageNumber}</span>
        </div>
      );
    }
  };

  return (
    <div
      className={`relative group transition-all ${
        isDragging ? "opacity-50" : ""
      }`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("pageId", page.id.toString());
      }}
    >
      {/* Thumbnail */}
      <button
        onClick={() => onSelect(page.id)}
        className={`w-full aspect-[7/9] rounded-lg border-2 overflow-hidden transition-all cursor-pointer ${
          isSelected
            ? "border-primary bg-primary/5 shadow-lg"
            : "border-border hover:border-primary/50 bg-white"
        }`}
      >
        {renderThumbnailContent()}
      </button>

      {/* Hover Actions */}
      <div className="absolute -right-12 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
        {/* Duplicate Button */}
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(page.id);
          }}
          title="Duplicate page"
        >
          <Copy className="w-3 h-3" />
        </Button>

        {/* Add After Button */}
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onAddAfter(page.id);
          }}
          title="Add page after"
        >
          <Plus className="w-3 h-3" />
        </Button>

        {/* Delete Button */}
        <Button
          size="sm"
          variant="destructive"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm("Are you sure you want to delete this page?")) {
              onDelete(page.id);
            }
          }}
          title="Delete page"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      {/* Drag Indicator */}
      {isDragging && (
        <div className="absolute inset-0 rounded-lg border-2 border-dashed border-primary pointer-events-none" />
      )}
    </div>
  );
}
