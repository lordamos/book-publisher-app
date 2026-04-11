import { Page } from "@shared/types";
import { useRef, useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { TextFormattingToolbar } from "./TextFormattingToolbar";
import {
  applyTextFormat,
  detectCurrentFormats,
  hasTextSelection,
  getSelectionPosition,
  type TextFormat,
} from "@/lib/textFormatting";

interface BookEditorCanvasProps {
  page: Page;
  bookId: number;
  onElementSelect: (indices: number[]) => void;
  selectedElements: number[];
  onContentChange?: (content: any) => void;
}

export function BookEditorCanvas({
  page,
  bookId,
  onElementSelect,
  selectedElements,
  onContentChange,
}: BookEditorCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const pageContentRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{ index: number; startX: number; startY: number; type: string } | null>(null);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [currentFormats, setCurrentFormats] = useState<TextFormat>({
    bold: false,
    italic: false,
    underline: false,
    fontSize: 16,
    color: "#000000",
  });
  const [content, setContent] = useState(() => {
    try {
      return page.content ? JSON.parse(page.content) : { textBlocks: [], images: [] };
    } catch {
      return { textBlocks: [], images: [] };
    }
  });

  const updatePageMutation = trpc.pages.update.useMutation();

  const handleMouseDown = (e: React.MouseEvent, index: number, type: "text" | "image") => {
    if (e.button !== 0) return; // Only left click
    
    // If double-clicking on text, enter edit mode instead of dragging
    if (type === "text" && e.detail === 2) {
      setIsEditing(index);
      return;
    }
    
    // If already editing, don't start drag
    if (isEditing !== null) {
      return;
    }
    
    if (e.shiftKey) {
      const newSelected = selectedElements.includes(index)
        ? selectedElements.filter((i) => i !== index)
        : [...selectedElements, index];
      onElementSelect(newSelected);
    } else {
      onElementSelect([index]);
    }
    
    setDragging({
      index,
      startX: e.clientX,
      startY: e.clientY,
      type,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging || !pageContentRef.current) return;

      const rect = pageContentRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragging.startX;
      const deltaY = e.clientY - dragging.startY;

      // Only drag if moved more than 5px to avoid accidental drags
      if (Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5) return;

      const newContent = { ...content };

      if (dragging.type === "text") {
        const block = newContent.textBlocks[dragging.index];
        if (block) {
          block.x = Math.max(0, block.x + deltaX);
          block.y = Math.max(0, block.y + deltaY);
        }
      } else {
        const image = newContent.images[dragging.index];
        if (image) {
          image.x = Math.max(0, image.x + deltaX);
          image.y = Math.max(0, image.y + deltaY);
        }
      }

      setContent(newContent);
      setDragging((prev) => prev ? { ...prev, startX: e.clientX, startY: e.clientY } : null);
    };

    const handleMouseUp = () => {
      if (dragging && content) {
        updatePageMutation.mutate({
          pageId: page.id,
          data: { content: JSON.stringify(content) },
        });
      }
      setDragging(null);
    };

    if (dragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [dragging, content, page.id, updatePageMutation]);

  const handleTextChange = (index: number, newText: string) => {
    const newContent = { ...content };
    if (newContent.textBlocks[index]) {
      newContent.textBlocks[index].text = newText;
      setContent(newContent);
      onContentChange?.(newContent);
    }
  };

  const handleAddTextBlock = () => {
    const newContent = { ...content };
    newContent.textBlocks.push({
      text: "New text",
      x: 100,
      y: 100,
      fontSize: 16,
      fontFamily: "Inter, sans-serif",
      fontWeight: "normal",
      color: "#000000",
      align: "left",
    });
    setContent(newContent);
    onContentChange?.(newContent);
  };

  const handleTextBlockClick = (e: React.MouseEvent, index: number) => {
    // Allow text selection and editing on click
    e.stopPropagation();
    setIsEditing(index);
    onElementSelect([index]);
  };

  const handleTextBlockBlur = (index: number) => {
    setIsEditing(null);
    setShowToolbar(false);
    updatePageMutation.mutate({
      pageId: page.id,
      data: { content: JSON.stringify(content) },
    });
  };

  const handleTextSelection = () => {
    if (isEditing !== null && hasTextSelection()) {
      const position = getSelectionPosition();
      setToolbarPosition(position);
      setShowToolbar(true);
      const formats = detectCurrentFormats();
      setCurrentFormats(formats);
    } else {
      setShowToolbar(false);
    }
  };

  const handleFormatChange = (format: string, value: any) => {
    applyTextFormat(format, value);
    // Update current formats after applying
    setTimeout(() => {
      const formats = detectCurrentFormats();
      setCurrentFormats(formats);
    }, 0);
  };

  return (
    <div
      ref={canvasRef}
      className="w-full h-full bg-white rounded-lg shadow-lg overflow-auto flex items-center justify-center p-8"
      style={{
        backgroundImage: "linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0), linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0)",
        backgroundSize: "40px 40px",
        backgroundPosition: "0 0, 20px 20px",
      }}
    >
      {/* Page Canvas */}
      <div
        ref={pageContentRef}
        className="bg-white shadow-2xl relative"
        style={{
          width: "700px",
          height: "900px",
          aspectRatio: "700/900",
        }}
      >
        {/* Text Blocks */}
        {content.textBlocks?.map((block: any, idx: number) => (
          <div
            key={`text-${idx}`}
            className={`absolute p-2 border-2 transition-colors ${
              isEditing === idx ? "cursor-text border-primary bg-primary/10" : "cursor-move border-transparent hover:border-primary/30"
            } ${selectedElements.includes(idx) ? "border-primary bg-primary/5" : ""}`}
            style={{
              left: `${block.x}px`,
              top: `${block.y}px`,
              fontSize: `${block.fontSize}px`,
              fontWeight: block.fontWeight,
              textAlign: block.align,
              color: block.color,
              fontFamily: block.fontFamily,
              minWidth: "100px",
              minHeight: "20px",
              maxWidth: "600px",
              outline: "none",
              userSelect: isEditing === idx ? "text" : "none",
            }}
            onClick={(e) => handleTextBlockClick(e, idx)}
            onMouseDown={(e) => {
              if (isEditing !== idx) {
                handleMouseDown(e, idx, "text");
              }
            }}
            contentEditable={isEditing === idx}
            suppressContentEditableWarning
            onInput={(e) => handleTextChange(idx, e.currentTarget.innerText)}
            onBlur={() => handleTextBlockBlur(idx)}
            onKeyDown={(e) => {
              // Allow Escape to exit editing mode
              if (e.key === "Escape") {
                setIsEditing(null);
                setShowToolbar(false);
                e.currentTarget.blur();
              }
            }}
            onMouseUp={handleTextSelection}
            onKeyUp={handleTextSelection}
          >
            {block.text}
          </div>
        ))}

        {/* Images */}
        {content.images?.map((image: any, idx: number) => (
          <div
            key={`img-${idx}`}
            className={`absolute border-2 transition-colors ${
              selectedElements.includes(content.textBlocks.length + idx)
                ? "border-primary"
                : "border-transparent hover:border-primary/30"
            }`}
            style={{
              left: `${image.x}px`,
              top: `${image.y}px`,
              width: `${image.width}px`,
              height: `${image.height}px`,
              cursor: "move",
            }}
            onMouseDown={(e) => handleMouseDown(e, idx, "image")}
          >
            <img
              src={image.url}
              alt="Page element"
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Add Text Button */}
      <button
        onClick={handleAddTextBlock}
        className="absolute bottom-4 right-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
      >
        + Add Text
      </button>

      {/* Text Formatting Toolbar */}
      <TextFormattingToolbar
        isVisible={showToolbar}
        position={toolbarPosition}
        onClose={() => setShowToolbar(false)}
        onFormatChange={handleFormatChange}
        currentFormats={currentFormats}
      />
    </div>
  );
}
