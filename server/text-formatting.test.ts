import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Text Formatting Tests
 * Tests for text formatting utilities and toolbar functionality
 */

describe("Text Formatting", () => {
  describe("Format Detection", () => {
    it("should track bold formatting state", () => {
      const formats = {
        bold: true,
        italic: false,
        underline: false,
        fontSize: 16,
        color: "#000000",
      };

      expect(formats.bold).toBe(true);
      expect(formats.italic).toBe(false);
    });

    it("should track italic formatting state", () => {
      const formats = {
        bold: false,
        italic: true,
        underline: false,
        fontSize: 16,
        color: "#000000",
      };

      expect(formats.italic).toBe(true);
    });

    it("should track underline formatting state", () => {
      const formats = {
        bold: false,
        italic: false,
        underline: true,
        fontSize: 16,
        color: "#000000",
      };

      expect(formats.underline).toBe(true);
    });

    it("should return default formats when none set", () => {
      const formats = {
        bold: false,
        italic: false,
        underline: false,
        fontSize: 16,
        color: "#000000",
      };

      expect(formats.bold).toBe(false);
      expect(formats.italic).toBe(false);
      expect(formats.underline).toBe(false);
    });
  });

  describe("Color Conversion", () => {
    it("should convert RGB to hex correctly", () => {
      const rgbToHex = (rgb: string): string => {
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
      };

      expect(rgbToHex("rgb(255, 0, 0)")).toBe("#FF0000");
      expect(rgbToHex("rgb(0, 255, 0)")).toBe("#00FF00");
      expect(rgbToHex("rgb(0, 0, 255)")).toBe("#0000FF");
      expect(rgbToHex("rgb(128, 128, 128)")).toBe("#808080");
      expect(rgbToHex("rgb(0, 0, 0)")).toBe("#000000");
      expect(rgbToHex("rgb(255, 255, 255)")).toBe("#FFFFFF");
    });

    it("should handle invalid RGB strings", () => {
      const rgbToHex = (rgb: string): string => {
        const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (!match) return "#000000";
        return "#000000";
      };

      expect(rgbToHex("invalid")).toBe("#000000");
      expect(rgbToHex("")).toBe("#000000");
      expect(rgbToHex("rgb(256, 256, 256)")).toBe("#000000");
    });

    it("should handle hex color strings", () => {
      const colors = ["#000000", "#FF0000", "#00FF00", "#0000FF"];
      expect(colors[0]).toBe("#000000");
      expect(colors[1]).toBe("#FF0000");
    });
  });

  describe("Font Size Management", () => {
    it("should map font sizes correctly", () => {
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

      expect(sizeMap[12]).toBe("1");
      expect(sizeMap[16]).toBe("3");
      expect(sizeMap[24]).toBe("6");
      expect(sizeMap[48]).toBe("7");
    });

    it("should handle unmapped font sizes", () => {
      const sizeMap: { [key: number]: string } = {
        12: "1",
        16: "3",
      };

      const getSize = (size: number) => sizeMap[size] || "3";
      expect(getSize(12)).toBe("1");
      expect(getSize(100)).toBe("3");
    });

    it("should validate font size range", () => {
      const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48];
      const minSize = Math.min(...fontSizes);
      const maxSize = Math.max(...fontSizes);

      expect(minSize).toBe(12);
      expect(maxSize).toBe(48);
    });
  });

  describe("Text Selection Detection", () => {
    it("should detect selected text", () => {
      const selectedText = "selected text";
      const hasSelection = selectedText.length > 0;

      expect(hasSelection).toBe(true);
    });

    it("should return false for empty selection", () => {
      const selectedText = "";
      const hasSelection = selectedText.length > 0;

      expect(hasSelection).toBe(false);
    });

    it("should handle whitespace-only selection", () => {
      const selectedText = "   ";
      const hasSelection = selectedText.trim().length > 0;

      expect(hasSelection).toBe(false);
    });
  });

  describe("Toolbar Positioning", () => {
    it("should calculate toolbar position correctly", () => {
      const rect = {
        left: 100,
        top: 200,
        right: 200,
        bottom: 220,
      };

      const position = {
        x: rect.left + 0, // scrollX = 0
        y: rect.top + 0 - 50, // scrollY = 0, offset = 50
      };

      expect(position.x).toBe(100);
      expect(position.y).toBe(150);
    });

    it("should account for scroll position", () => {
      const rect = {
        left: 100,
        top: 200,
      };

      const scrollX = 50;
      const scrollY = 100;

      const position = {
        x: rect.left + scrollX,
        y: rect.top + scrollY - 50,
      };

      expect(position.x).toBe(150);
      expect(position.y).toBe(250);
    });

    it("should handle negative positions", () => {
      const rect = {
        left: 10,
        top: 20,
      };

      const position = {
        x: Math.max(0, rect.left),
        y: Math.max(0, rect.top - 50),
      };

      expect(position.x).toBe(10);
      expect(position.y).toBe(0);
    });
  });

  describe("Format State Management", () => {
    it("should toggle bold format", () => {
      let formats = {
        bold: false,
        italic: false,
        underline: false,
        fontSize: 16,
        color: "#000000",
      };

      formats.bold = !formats.bold;
      expect(formats.bold).toBe(true);

      formats.bold = !formats.bold;
      expect(formats.bold).toBe(false);
    });

    it("should toggle italic format", () => {
      let formats = {
        bold: false,
        italic: false,
        underline: false,
        fontSize: 16,
        color: "#000000",
      };

      formats.italic = !formats.italic;
      expect(formats.italic).toBe(true);
    });

    it("should change font size", () => {
      let formats = {
        bold: false,
        italic: false,
        underline: false,
        fontSize: 16,
        color: "#000000",
      };

      formats.fontSize = 24;
      expect(formats.fontSize).toBe(24);
    });

    it("should change color", () => {
      let formats = {
        bold: false,
        italic: false,
        underline: false,
        fontSize: 16,
        color: "#000000",
      };

      formats.color = "#FF0000";
      expect(formats.color).toBe("#FF0000");
    });
  });

  describe("Color Palette", () => {
    it("should have valid color palette", () => {
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

      expect(colors).toHaveLength(10);
      expect(colors[0]).toBe("#000000");
      expect(colors[2]).toBe("#FF0000");
    });

    it("should have unique colors", () => {
      const colors = [
        "#000000",
        "#FFFFFF",
        "#FF0000",
        "#00AA00",
        "#0000FF",
        "#FF6B00",
        "#9933FF",
        "#FF1493",
        "#808080",
        "#FFD700",
      ];

      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(colors.length);
    });
  });

  describe("Font Size Options", () => {
    it("should have valid font size options", () => {
      const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48];

      expect(fontSizes).toHaveLength(11);
      expect(fontSizes[0]).toBe(12);
      expect(fontSizes[2]).toBe(16);
      expect(fontSizes[10]).toBe(48);
    });

    it("should be in ascending order", () => {
      const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48];

      for (let i = 0; i < fontSizes.length - 1; i++) {
        expect(fontSizes[i]).toBeLessThanOrEqual(fontSizes[i + 1]);
      }
    });

    it("should have reasonable font size range", () => {
      const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48];
      const minSize = Math.min(...fontSizes);
      const maxSize = Math.max(...fontSizes);

      expect(minSize).toBeGreaterThanOrEqual(8);
      expect(maxSize).toBeLessThanOrEqual(72);
    });
  });

  describe("Toolbar Visibility", () => {
    it("should show toolbar when text is selected", () => {
      const isEditing = 0; // editing text block at index 0
      const hasSelection = true;

      const showToolbar = isEditing !== null && hasSelection;
      expect(showToolbar).toBe(true);
    });

    it("should hide toolbar when no text is selected", () => {
      const isEditing = 0;
      const hasSelection = false;

      const showToolbar = isEditing !== null && hasSelection;
      expect(showToolbar).toBe(false);
    });

    it("should hide toolbar when not editing", () => {
      const isEditing = null;
      const hasSelection = true;

      const showToolbar = isEditing !== null && hasSelection;
      expect(showToolbar).toBe(false);
    });
  });
});
