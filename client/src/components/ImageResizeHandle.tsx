import { useState, useRef, useEffect } from "react";

interface ImageResizeHandleProps {
  imageId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  onResize: (imageId: string, x: number, y: number, width: number, height: number) => void;
  onDelete: (imageId: string) => void;
  isSelected: boolean;
  canvasWidth: number;
  canvasHeight: number;
}

export function ImageResizeHandle({
  imageId,
  x,
  y,
  width,
  height,
  onResize,
  onDelete,
  isSelected,
  canvasWidth,
  canvasHeight,
}: ImageResizeHandleProps) {
  const [resizing, setResizing] = useState<{
    handle: string;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const handles = [
    { position: "tl", cursor: "nwse-resize", top: "-4px", left: "-4px" },
    { position: "tr", cursor: "nesw-resize", top: "-4px", right: "-4px" },
    { position: "bl", cursor: "nesw-resize", bottom: "-4px", left: "-4px" },
    { position: "br", cursor: "nwse-resize", bottom: "-4px", right: "-4px" },
    { position: "t", cursor: "ns-resize", top: "-4px", left: "50%", transform: "translateX(-50%)" },
    { position: "b", cursor: "ns-resize", bottom: "-4px", left: "50%", transform: "translateX(-50%)" },
    { position: "l", cursor: "ew-resize", top: "50%", left: "-4px", transform: "translateY(-50%)" },
    { position: "r", cursor: "ew-resize", top: "50%", right: "-4px", transform: "translateY(-50%)" },
  ];

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizing.startX;
      const deltaY = e.clientY - resizing.startY;

      let newX = x;
      let newY = y;
      let newWidth = resizing.startWidth;
      let newHeight = resizing.startHeight;
      const aspectRatio = resizing.startWidth / resizing.startHeight;

      switch (resizing.handle) {
        case "tl":
          newX = Math.max(0, x + deltaX);
          newY = Math.max(0, y + deltaY);
          newWidth = resizing.startWidth - deltaX;
          newHeight = resizing.startHeight - deltaY;
          break;
        case "tr":
          newY = Math.max(0, y + deltaY);
          newWidth = resizing.startWidth + deltaX;
          newHeight = resizing.startHeight - deltaY;
          break;
        case "bl":
          newX = Math.max(0, x + deltaX);
          newWidth = resizing.startWidth - deltaX;
          newHeight = resizing.startHeight + deltaY;
          break;
        case "br":
          newWidth = resizing.startWidth + deltaX;
          newHeight = resizing.startHeight + deltaY;
          break;
        case "t":
          newY = Math.max(0, y + deltaY);
          newHeight = resizing.startHeight - deltaY;
          newWidth = newHeight * aspectRatio;
          break;
        case "b":
          newHeight = resizing.startHeight + deltaY;
          newWidth = newHeight * aspectRatio;
          break;
        case "l":
          newX = Math.max(0, x + deltaX);
          newWidth = resizing.startWidth - deltaX;
          newHeight = newWidth / aspectRatio;
          break;
        case "r":
          newWidth = resizing.startWidth + deltaX;
          newHeight = newWidth / aspectRatio;
          break;
      }

      // Enforce minimum size
      newWidth = Math.max(50, newWidth);
      newHeight = Math.max(50, newHeight);

      // Enforce maximum bounds
      newX = Math.min(newX, canvasWidth - newWidth);
      newY = Math.min(newY, canvasHeight - newHeight);

      onResize(imageId, newX, newY, newWidth, newHeight);
    };

    const handleMouseUp = () => {
      setResizing(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizing, x, y, canvasWidth, canvasHeight, imageId, onResize]);

  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing({
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: width,
      startHeight: height,
    });
  };

  if (!isSelected) return null;

  return (
    <div
      ref={containerRef}
      className="absolute border-2 border-primary pointer-events-none"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      {/* Resize Handles */}
      {handles.map((handle) => (
        <div
          key={handle.position}
          className="absolute w-2 h-2 bg-primary rounded-full border border-white shadow-md cursor-pointer pointer-events-auto hover:scale-150 transition-transform"
          style={{
            ...(handle.top && { top: handle.top }),
            ...(handle.bottom && { bottom: handle.bottom }),
            ...(handle.left && { left: handle.left }),
            ...(handle.right && { right: handle.right }),
            ...(handle.transform && { transform: handle.transform }),
          }}
          onMouseDown={(e) => handleMouseDown(e, handle.position)}
          title={`Resize ${handle.position}`}
        />
      ))}

      {/* Delete Button */}
      <button
        className="absolute -top-8 -right-8 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs font-bold hover:bg-destructive/90 transition-colors pointer-events-auto"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(imageId);
        }}
        title="Delete image"
      >
        ×
      </button>

      {/* Dimensions Display */}
      <div className="absolute -bottom-6 left-0 text-xs text-muted-foreground pointer-events-none">
        {Math.round(width)} × {Math.round(height)}
      </div>
    </div>
  );
}
