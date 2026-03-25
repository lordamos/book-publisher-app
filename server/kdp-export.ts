import { Book, Page, Chapter } from "../drizzle/schema";
import { getBookMetadata, getPagesByBookId, getChaptersByBookId } from "./db";

/**
 * KDP Export Service
 * Handles PDF generation with proper KDP compliance
 */

export interface KDPExportOptions {
  includeFrontMatter: boolean;
  includeTableOfContents: boolean;
  includeBackMatter: boolean;
}

export interface KDPPageSpec {
  trimSize: "6x9" | "5x8" | "8.5x11";
  bleed: number; // in inches
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  pageSize: "letter" | "a4";
}

/**
 * Get KDP page specifications based on trim size
 */
export function getKDPPageSpec(trimSize: string): KDPPageSpec {
  const specs: Record<string, KDPPageSpec> = {
    "6x9": {
      trimSize: "6x9",
      bleed: 0.125,
      margins: { top: 0.75, bottom: 0.75, left: 0.75, right: 0.75 },
      pageSize: "letter",
    },
    "5x8": {
      trimSize: "5x8",
      bleed: 0.125,
      margins: { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 },
      pageSize: "letter",
    },
    "8.5x11": {
      trimSize: "8.5x11",
      bleed: 0.125,
      margins: { top: 1, bottom: 1, left: 1, right: 1 },
      pageSize: "letter",
    },
  };

  return specs[trimSize] || specs["6x9"];
}

/**
 * Validate book for KDP export
 */
export async function validateBookForKDP(book: Book): Promise<{
  valid: boolean;
  errors: string[];
  warnings: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  if (!book.title || book.title.trim().length === 0) {
    errors.push("Book title is required");
  }

  if (!book.author || book.author.trim().length === 0) {
    warnings.push("Author name is recommended");
  }

  if (!book.description || book.description.trim().length === 0) {
    warnings.push("Book description is recommended for better discoverability");
  }

  // Check ISBN (optional but recommended)
  if (!book.isbn) {
    warnings.push("ISBN is recommended for professional publishing");
  } else if (!isValidISBN(book.isbn)) {
    errors.push("Invalid ISBN format");
  }

  // Check page count
  if ((book.pageCount ?? 0) < 24) {
    errors.push("Book must have at least 24 pages for KDP");
  }

  if ((book.pageCount ?? 0) > 800) {
    warnings.push("Book exceeds recommended maximum of 800 pages");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate ISBN-10 or ISBN-13
 */
function isValidISBN(isbn: string): boolean {
  const cleaned = isbn.replace(/[^0-9X]/g, "");

  if (cleaned.length === 10) {
    return isValidISBN10(cleaned);
  } else if (cleaned.length === 13) {
    return isValidISBN13(cleaned);
  }

  return false;
}

function isValidISBN10(isbn: string): boolean {
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(isbn[i], 10) * (10 - i);
  }

  const checkDigit = (11 - (sum % 11)) % 11;
  const check = checkDigit === 10 ? "X" : checkDigit.toString();

  return check === isbn[9];
}

function isValidISBN13(isbn: string): boolean {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(isbn[i], 10) * (i % 2 === 0 ? 1 : 3);
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(isbn[12], 10);
}

/**
 * Generate PDF metadata
 */
export function generatePDFMetadata(book: Book) {
  return {
    title: book.title,
    author: book.author || "Unknown Author",
    subject: book.category || "Fiction",
    keywords: book.category ? [book.category] : [],
    creator: "Book Publisher Pro",
    producer: "Book Publisher Pro",
    creationDate: new Date(),
    modDate: book.updatedAt,
  };
}

/**
 * Generate table of contents from chapters
 */
export async function generateTableOfContents(
  bookId: number
): Promise<Array<{ title: string; pageNumber: number; level: number }>> {
  const chapters = await getChaptersByBookId(bookId);
  const pages = await getPagesByBookId(bookId);

  return chapters.map((chapter) => {
    const pageNum = chapter.startPageId
      ? pages.findIndex((p) => p.id === chapter.startPageId) + 1
      : 0;

    return {
      title: chapter.title,
      pageNumber: pageNum,
      level: 1,
    };
  });
}

/**
 * Calculate book dimensions in points (1 inch = 72 points)
 */
export function calculateBookDimensions(spec: KDPPageSpec) {
  const trimSizeParts = spec.trimSize.split("x");
  const width = parseFloat(trimSizeParts[0]) * 72; // Convert inches to points
  const height = parseFloat(trimSizeParts[1]) * 72;

  const bleedPoints = spec.bleed * 72;

  return {
    width,
    height,
    bleed: bleedPoints,
    margins: {
      top: spec.margins.top * 72,
      bottom: spec.margins.bottom * 72,
      left: spec.margins.left * 72,
      right: spec.margins.right * 72,
    },
  };
}

/**
 * Generate KDP-compliant PDF export URL
 * This would be called from a tRPC procedure
 */
export async function generateKDPExportURL(
  bookId: number,
  book: Book,
  options: KDPExportOptions = {
    includeFrontMatter: true,
    includeTableOfContents: true,
    includeBackMatter: false,
  }
): Promise<{
  url: string;
  fileName: string;
  metadata: Record<string, any>;
}> {
  // Validate book
  const validation = await validateBookForKDP(book);
  if (!validation.valid) {
    throw new Error(`Book validation failed: ${validation.errors.join(", ")}`);
  }

  // Get metadata
  const metadata = await getBookMetadata(bookId);
  if (!metadata) {
    throw new Error("Book metadata not found");
  }

  // Get KDP spec
  const spec = getKDPPageSpec(metadata.trimSize || "6x9");
  const dimensions = calculateBookDimensions(spec);

  // Generate TOC if requested
  let toc: any[] = [];
  if (options.includeTableOfContents) {
    toc = await generateTableOfContents(bookId);
  }

  // Generate PDF metadata
  const pdfMetadata = generatePDFMetadata(book);

  const fileName = `${(book.title || "book").replace(/[^a-z0-9]/gi, "_").toLowerCase()}_kdp_export.pdf`;

  // In a real implementation, this would generate the PDF and upload to S3
  // For now, return the metadata that would be used
  return {
    url: `https://example.com/exports/${fileName}`,
    fileName,
    metadata: {
      ...pdfMetadata,
      spec,
      dimensions,
      toc,
      validation,
    },
  };
}
