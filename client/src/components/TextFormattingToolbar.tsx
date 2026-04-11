import { Bold, Italic, Underline, Type, Palette, X, Link, List, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface TextFormattingToolbarProps {
  isVisible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onFormatChange: (format: string, value: any) => void;
  onHyperlinkClick: () => void;
  currentFormats: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    fontSize: number;
    color: string;
    bulletList: boolean;
    numberedList: boolean;
  };
}

export function TextFormattingToolbar({
  isVisible,
  position,
  onClose,
  onFormatChange,
  onHyperlinkClick,
  currentFormats,
}: TextFormattingToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);

  const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48];
  const colors = [
    "#000000", // Black
    "#FFFFFF", // White
    "#FF0000", // Red
    "#00AA00", // Green
    "#0000FF", // Blue
    "#FF6B00", // Orange
    "#9933FF", // Purple
    "#FF1493", // Pink
    "#808080", // Gray
    "#FFD700", // Gold
  ];

  const toggleFormat = (format: "bold" | "italic" | "underline") => {
    onFormatChange(format, !currentFormats[format]);
  };

  const handleFontSizeChange = (size: number) => {
    onFormatChange("fontSize", size);
    setShowFontSizeMenu(false);
  };

  const handleColorChange = (color: string) => {
    onFormatChange("color", color);
    setShowColorPicker(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bg-white border border-border rounded-lg shadow-lg p-2 z-50 flex items-center gap-1"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Bold Button */}
      <Button
        variant={currentFormats.bold ? "default" : "outline"}
        size="sm"
        onClick={() => toggleFormat("bold")}
        title="Bold (Ctrl+B)"
        className="w-8 h-8 p-0"
      >
        <Bold className="w-4 h-4" />
      </Button>

      {/* Italic Button */}
      <Button
        variant={currentFormats.italic ? "default" : "outline"}
        size="sm"
        onClick={() => toggleFormat("italic")}
        title="Italic (Ctrl+I)"
        className="w-8 h-8 p-0"
      >
        <Italic className="w-4 h-4" />
      </Button>

      {/* Underline Button */}
      <Button
        variant={currentFormats.underline ? "default" : "outline"}
        size="sm"
        onClick={() => toggleFormat("underline")}
        title="Underline (Ctrl+U)"
        className="w-8 h-8 p-0"
      >
        <Underline className="w-4 h-4" />
      </Button>

      {/* Divider */}
      <div className="w-px h-6 bg-border" />

      {/* Font Size Dropdown */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFontSizeMenu(!showFontSizeMenu)}
          title="Font Size"
          className="w-12 h-8 p-0 text-xs"
        >
          <Type className="w-4 h-4 mr-1" />
          {currentFormats.fontSize}
        </Button>
        {showFontSizeMenu && (
          <div className="absolute top-full mt-1 left-0 bg-white border border-border rounded-lg shadow-lg p-1 z-50 max-h-48 overflow-y-auto">
            {fontSizes.map((size) => (
              <button
                key={size}
                onClick={() => handleFontSizeChange(size)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-accent rounded transition-colors ${
                  currentFormats.fontSize === size ? "bg-primary/10 font-semibold" : ""
                }`}
              >
                {size}px
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-border" />

      {/* Color Picker Button */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowColorPicker(!showColorPicker)}
          title="Text Color"
          className="w-8 h-8 p-0"
        >
          <div
            className="w-4 h-4 rounded border border-foreground/30"
            style={{ backgroundColor: currentFormats.color }}
          />
        </Button>
        {showColorPicker && (
          <div className="absolute top-full mt-1 left-0 bg-white border border-border rounded-lg shadow-lg p-2 z-50 grid grid-cols-5 gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={`w-6 h-6 rounded border-2 transition-all ${
                  currentFormats.color === color
                    ? "border-foreground"
                    : "border-border hover:border-foreground/50"
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-border" />

      {/* Bullet List Button */}
      <Button
        variant={currentFormats.bulletList ? "default" : "outline"}
        size="sm"
        onClick={() => onFormatChange("bulletList", !currentFormats.bulletList)}
        title="Bullet List"
        className="w-8 h-8 p-0"
      >
        <List className="w-4 h-4" />
      </Button>

      {/* Numbered List Button */}
      <Button
        variant={currentFormats.numberedList ? "default" : "outline"}
        size="sm"
        onClick={() => onFormatChange("numberedList", !currentFormats.numberedList)}
        title="Numbered List"
        className="w-8 h-8 p-0"
      >
        <ListOrdered className="w-4 h-4" />
      </Button>

      {/* Divider */}
      <div className="w-px h-6 bg-border" />

      {/* Hyperlink Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onHyperlinkClick}
        title="Insert Hyperlink"
        className="w-8 h-8 p-0"
      >
        <Link className="w-4 h-4" />
      </Button>

      {/* Close Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="w-8 h-8 p-0 ml-1"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
