/**
 * PDF Export Utilities
 * Helpers for PDF export configuration and validation
 */

export interface PDFExportOptions {
  filename: string;
  pageRange: "all" | "current" | "range";
  startPage?: number;
  endPage?: number;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  quality: "low" | "medium" | "high";
  includeMetadata: boolean;
  includePageNumbers: boolean;
  paperSize: "letter" | "a4" | "a5";
}

export interface PDFExportResult {
  success: boolean;
  url?: string;
  error?: string;
  size?: number;
  pages?: number;
}

/**
 * Default PDF export options
 */
export const DEFAULT_PDF_OPTIONS: PDFExportOptions = {
  filename: "book.pdf",
  pageRange: "all",
  marginTop: 20,
  marginBottom: 20,
  marginLeft: 20,
  marginRight: 20,
  quality: "high",
  includeMetadata: true,
  includePageNumbers: true,
  paperSize: "letter",
};

/**
 * Paper size dimensions in mm
 */
export const PAPER_SIZES = {
  letter: { width: 215.9, height: 279.4 },
  a4: { width: 210, height: 297 },
  a5: { width: 148, height: 210 },
};

/**
 * Quality settings for PDF compression
 */
export const QUALITY_SETTINGS = {
  low: { dpi: 72, compression: 0.8 },
  medium: { dpi: 150, compression: 0.6 },
  high: { dpi: 300, compression: 0.3 },
};

/**
 * Validate PDF export options
 */
export function validatePDFOptions(options: Partial<PDFExportOptions>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!options.filename || options.filename.trim() === "") {
    errors.push("Filename is required");
  }

  if (options.filename && !options.filename.endsWith(".pdf")) {
    errors.push("Filename must end with .pdf");
  }

  if (options.pageRange === "range") {
    if (!options.startPage || options.startPage < 1) {
      errors.push("Start page must be at least 1");
    }
    if (!options.endPage || options.endPage < 1) {
      errors.push("End page must be at least 1");
    }
    if (options.startPage && options.endPage && options.startPage > options.endPage) {
      errors.push("Start page must be less than or equal to end page");
    }
  }

  if (options.marginTop !== undefined && options.marginTop < 0) {
    errors.push("Top margin cannot be negative");
  }
  if (options.marginBottom !== undefined && options.marginBottom < 0) {
    errors.push("Bottom margin cannot be negative");
  }
  if (options.marginLeft !== undefined && options.marginLeft < 0) {
    errors.push("Left margin cannot be negative");
  }
  if (options.marginRight !== undefined && options.marginRight < 0) {
    errors.push("Right margin cannot be negative");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  // Remove invalid characters
  let sanitized = filename.replace(/[<>:"/\\|?*]/g, "");
  
  // Remove leading/trailing spaces and dots
  sanitized = sanitized.trim().replace(/^\.+|\.+$/g, "");
  
  // Limit length
  if (sanitized.length > 255) {
    sanitized = sanitized.substring(0, 251) + ".pdf";
  }
  
  // Ensure .pdf extension
  if (!sanitized.endsWith(".pdf")) {
    sanitized += ".pdf";
  }
  
  return sanitized;
}

/**
 * Calculate page dimensions with margins
 */
export function calculatePageDimensions(
  paperSize: "letter" | "a4" | "a5",
  margins: { top: number; bottom: number; left: number; right: number }
): { width: number; height: number; contentWidth: number; contentHeight: number } {
  const size = PAPER_SIZES[paperSize];
  return {
    width: size.width,
    height: size.height,
    contentWidth: size.width - margins.left - margins.right,
    contentHeight: size.height - margins.top - margins.bottom,
  };
}

/**
 * Estimate PDF file size
 */
export function estimatePDFSize(
  pageCount: number,
  quality: "low" | "medium" | "high"
): number {
  // Rough estimation: base size + per-page size depending on quality
  const baseSize = 5000; // 5KB base
  const perPageSize = quality === "low" ? 50000 : quality === "medium" ? 100000 : 200000;
  return baseSize + pageCount * perPageSize;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Generate PDF filename with timestamp
 */
export function generatePDFFilename(bookTitle: string): string {
  const timestamp = new Date().toISOString().split("T")[0];
  const sanitized = sanitizeFilename(bookTitle.replace(/\.pdf$/i, ""));
  return `${sanitized}-${timestamp}.pdf`;
}

/**
 * Validate page range
 */
export function validatePageRange(
  startPage: number,
  endPage: number,
  totalPages: number
): { valid: boolean; error?: string } {
  if (startPage < 1) {
    return { valid: false, error: "Start page must be at least 1" };
  }
  if (endPage > totalPages) {
    return { valid: false, error: `End page cannot exceed ${totalPages}` };
  }
  if (startPage > endPage) {
    return { valid: false, error: "Start page must be less than or equal to end page" };
  }
  return { valid: true };
}

/**
 * Get page range array
 */
export function getPageRange(startPage: number, endPage: number): number[] {
  const pages: number[] = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return pages;
}

/**
 * Create PDF export config
 */
export function createPDFExportConfig(
  options: Partial<PDFExportOptions> = {}
): PDFExportOptions {
  return {
    ...DEFAULT_PDF_OPTIONS,
    ...options,
  };
}

/**
 * Check if PDF export is supported
 */
export function isPDFExportSupported(): boolean {
  // Check if canvas API is available
  return typeof document !== "undefined" && typeof window !== "undefined";
}

/**
 * Get estimated export time
 */
export function getEstimatedExportTime(pageCount: number, quality: "low" | "medium" | "high"): number {
  // Rough estimation in seconds
  const baseTime = 2;
  const perPageTime = quality === "low" ? 0.1 : quality === "medium" ? 0.2 : 0.3;
  return baseTime + pageCount * perPageTime;
}

/**
 * Convert mm to pixels
 */
export function mmToPixels(mm: number, dpi: number = 96): number {
  return (mm * dpi) / 25.4;
}

/**
 * Convert pixels to mm
 */
export function pixelsToMm(pixels: number, dpi: number = 96): number {
  return (pixels * 25.4) / dpi;
}

/**
 * Validate PDF export prerequisites
 */
export function validateExportPrerequisites(pages: any[]): {
  valid: boolean;
  error?: string;
} {
  if (!pages || pages.length === 0) {
    return { valid: false, error: "No pages to export" };
  }

  if (!isPDFExportSupported()) {
    return { valid: false, error: "PDF export is not supported in this browser" };
  }

  return { valid: true };
}
