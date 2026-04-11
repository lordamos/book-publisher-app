/**
 * Text formatting utilities for rich text editing
 */

export interface TextFormat {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontSize: number;
  color: string;
}

/**
 * Apply formatting to selected text using execCommand
 */
export function applyTextFormat(format: string, value?: any) {
  switch (format) {
    case "bold":
      document.execCommand("bold", false);
      break;
    case "italic":
      document.execCommand("italic", false);
      break;
    case "underline":
      document.execCommand("underline", false);
      break;
    case "fontSize":
      // Font sizes in execCommand: 1-7 (1=8px, 7=48px)
      const sizeMap: { [key: number]: string } = {
        12: "1",
        14: "2",
        16: "3",
        18: "4",
        20: "5",
        24: "6",
        28: "6",
        32: "7",
        36: "7",
        40: "7",
        48: "7",
      };
      const sizeValue = sizeMap[value] || "3";
      document.execCommand("fontSize", false, sizeValue);
      break;
    case "color":
      document.execCommand("foreColor", false, value);
      break;
  }
}

/**
 * Detect current formatting at cursor position
 */
export function detectCurrentFormats(): TextFormat {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return {
      bold: false,
      italic: false,
      underline: false,
      fontSize: 16,
      color: "#000000",
    };
  }

  const range = selection.getRangeAt(0);
  const commonAncestor = range.commonAncestorContainer;
  const element =
    commonAncestor.nodeType === Node.TEXT_NODE
      ? (commonAncestor.parentElement as HTMLElement)
      : (commonAncestor as HTMLElement);

  if (!element) {
    return {
      bold: false,
      italic: false,
      underline: false,
      fontSize: 16,
      color: "#000000",
    };
  }

  const styles = window.getComputedStyle(element);
  const fontSizeStr = styles.fontSize || "16px";
  const fontSize = parseInt(fontSizeStr, 10) || 16;
  const color = styles.color || "#000000";

  return {
    bold: document.queryCommandState("bold"),
    italic: document.queryCommandState("italic"),
    underline: document.queryCommandState("underline"),
    fontSize,
    color: rgbToHex(color),
  };
}

/**
 * Convert RGB color to hex
 */
function rgbToHex(rgb: string): string {
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) return "#000000";

  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);

  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
      .toUpperCase()
  );
}

/**
 * Check if text is selected
 */
export function hasTextSelection(): boolean {
  const selection = window.getSelection();
  return !!(selection && selection.toString().length > 0);
}

/**
 * Get selection position for toolbar placement
 */
export function getSelectionPosition(): { x: number; y: number } {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return { x: 0, y: 0 };
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  return {
    x: rect.left + window.scrollX,
    y: rect.top + window.scrollY - 50, // Position above the selection
  };
}
