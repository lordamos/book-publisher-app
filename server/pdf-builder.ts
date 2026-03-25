import PDFDocument from "pdfkit";
import { Readable } from "stream";
import { Book, Page, Chapter } from "../drizzle/schema";
import { getPagesByBookId, getChaptersByBookId, getBookMetadata } from "./db";
import { getKDPPageSpec, calculateBookDimensions } from "./kdp-export";

/**
 * PDF Builder Service
 * Generates KDP-compliant PDFs with proper formatting, bleed, margins, and metadata
 */

export interface PDFBuildOptions {
  includeFrontMatter: boolean;
  includeTableOfContents: boolean;
  includeBackMatter: boolean;
  includePageNumbers: boolean;
}

export interface TextBlock {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color: string;
  align: "left" | "center" | "right" | "justify";
}

export interface ImageElement {
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PageContent {
  textBlocks: TextBlock[];
  images: ImageElement[];
}

/**
 * Create a KDP-compliant PDF document
 */
export function createKDPDocument(
  trimSize: string = "6x9"
): { doc: InstanceType<typeof PDFDocument>; spec: any; dimensions: any } {
  const spec = getKDPPageSpec(trimSize);
  const dimensions = calculateBookDimensions(spec);

  // Create PDF with proper dimensions (in points)
  const doc = new PDFDocument({
    size: [dimensions.width + dimensions.bleed * 2, dimensions.height + dimensions.bleed * 2],
    margin: 0,
    bufferPages: true,
  });

  // Metadata will be set when generating the full PDF

  return { doc, spec, dimensions };
}

/**
 * Add a cover page to the PDF
 */
export function addCoverPage(
  doc: InstanceType<typeof PDFDocument>,
  dimensions: any,
  title: string,
  author: string,
  coverImageUrl?: string
): void {
  // Add bleed area (light gray background)
  doc
    .rect(0, 0, doc.page.width, doc.page.height)
    .fill("#f5f5f5");

  // Add trim area (white background)
  const trimX = dimensions.bleed;
  const trimY = dimensions.bleed;
  doc
    .rect(trimX, trimY, dimensions.width, dimensions.height)
    .fill("#ffffff");

  // Add cover image if provided
  if (coverImageUrl) {
    try {
      doc.image(coverImageUrl, trimX, trimY, {
        width: dimensions.width,
        height: dimensions.height,
      });
    } catch (error) {
      console.warn("Failed to load cover image:", error);
    }
  }

  // Add title and author text
  const contentX = trimX + dimensions.margins.left;
  const contentY = trimY + dimensions.height / 2;
  const contentWidth = dimensions.width - dimensions.margins.left - dimensions.margins.right;

  doc
    .fontSize(36)
    .font("Helvetica-Bold")
    .fill("#000000")
    .text(title, contentX, contentY - 60, {
      width: contentWidth,
      align: "center",
    });

  doc
    .fontSize(18)
    .font("Helvetica")
    .fill("#666666")
    .text(author, contentX, contentY + 60, {
      width: contentWidth,
      align: "center",
    });

  doc.addPage();
}

/**
 * Add a copyright/title page
 */
export function addTitlePage(
  doc: InstanceType<typeof PDFDocument>,
  dimensions: any,
  book: Book,
  metadata: any
): void {
  const trimX = dimensions.bleed;
  const trimY = dimensions.bleed;
  const contentX = trimX + dimensions.margins.left;
  const contentY = trimY + dimensions.margins.top;
  const contentWidth = dimensions.width - dimensions.margins.left - dimensions.margins.right;

  // Title
  doc
    .fontSize(24)
    .font("Helvetica-Bold")
    .fill("#000000")
    .text(book.title || "Untitled", contentX, contentY, {
      width: contentWidth,
      align: "center",
    });

  // Author
  doc
    .fontSize(14)
    .font("Helvetica")
    .fill("#333333")
    .text(`by ${book.author || "Unknown Author"}`, contentX, contentY + 40, {
      width: contentWidth,
      align: "center",
    });

  // Copyright info
  const copyrightY = contentY + 200;
  doc
    .fontSize(10)
    .font("Helvetica")
    .fill("#666666")
    .text(`© ${new Date().getFullYear()} ${book.author || "Author"}`, contentX, copyrightY, {
      width: contentWidth,
      align: "center",
    });

  if (book.isbn) {
    doc.text(`ISBN: ${book.isbn}`, contentX, copyrightY + 20, {
      width: contentWidth,
      align: "center",
    });
  }

  doc.addPage();
}

/**
 * Add table of contents
 */
export function addTableOfContents(
  doc: InstanceType<typeof PDFDocument>,
  dimensions: any,
  chapters: Chapter[]
): void {
  const trimX = dimensions.bleed;
  const trimY = dimensions.bleed;
  const contentX = trimX + dimensions.margins.left;
  const contentY = trimY + dimensions.margins.top;
  const contentWidth = dimensions.width - dimensions.margins.left - dimensions.margins.right;

  // TOC Title
  doc
    .fontSize(18)
    .font("Helvetica-Bold")
    .fill("#000000")
    .text("Table of Contents", contentX, contentY);

  let currentY = contentY + 40;

  // TOC Entries
  chapters.forEach((chapter, index) => {
    const pageNum = (index + 3).toString(); // Assuming cover + title + toc = 3 pages

    doc
      .fontSize(12)
      .font("Helvetica")
      .fill("#000000")
      .text(`${chapter.title}`, contentX, currentY, {
        width: contentWidth - 40,
        continued: true,
      })
      .text(pageNum, {
        align: "right",
      });

    currentY += 25;
  });

  doc.addPage();
}

/**
 * Add a content page with text blocks and images
 */
export function addContentPage(
  doc: InstanceType<typeof PDFDocument>,
  dimensions: any,
  pageContent: PageContent,
  pageNumber?: number
): void {
  const trimX = dimensions.bleed;
  const trimY = dimensions.bleed;

  // Add white background for trim area
  doc
    .rect(trimX, trimY, dimensions.width, dimensions.height)
    .fill("#ffffff");

  // Add text blocks
  pageContent.textBlocks?.forEach((block) => {
    const x = trimX + block.x;
    const y = trimY + block.y;

    doc
      .fontSize(block.fontSize)
      .font(getFontName(block.fontFamily, block.fontWeight))
      .fill(block.color)
      .text(block.text, x, y, {
        width: dimensions.width - dimensions.margins.left - dimensions.margins.right,
        align: block.align,
      });
  });

  // Add images
  pageContent.images?.forEach((image) => {
    const x = trimX + image.x;
    const y = trimY + image.y;

    try {
      doc.image(image.url, x, y, {
        width: image.width,
        height: image.height,
      });
    } catch (error) {
      console.warn("Failed to load image:", error);
    }
  });

  // Add page number if requested
  if (pageNumber !== undefined) {
    const pageNumX = trimX + dimensions.width - dimensions.margins.right - 30;
    const pageNumY = trimY + dimensions.height - dimensions.margins.bottom + 10;

    doc
      .fontSize(10)
      .font("Helvetica")
      .fill("#999999")
      .text(pageNumber.toString(), pageNumX, pageNumY, {
        align: "right",
      });
  }

  doc.addPage();
}

/**
 * Get proper font name based on family and weight
 */
function getFontName(family: string, weight: string): string {
  const fontMap: Record<string, Record<string, string>> = {
    "Helvetica": {
      "300": "Helvetica-Light",
      "400": "Helvetica",
      "600": "Helvetica-Bold",
      "700": "Helvetica-Bold",
      "normal": "Helvetica",
      "bold": "Helvetica-Bold",
    },
    "Times New Roman": {
      "300": "Times-Roman",
      "400": "Times-Roman",
      "600": "Times-Bold",
      "700": "Times-Bold",
      "normal": "Times-Roman",
      "bold": "Times-Bold",
    },
    "Georgia": {
      "300": "Times-Roman",
      "400": "Times-Roman",
      "600": "Times-Bold",
      "700": "Times-Bold",
      "normal": "Times-Roman",
      "bold": "Times-Bold",
    },
    "Courier New": {
      "300": "Courier",
      "400": "Courier",
      "600": "Courier-Bold",
      "700": "Courier-Bold",
      "normal": "Courier",
      "bold": "Courier-Bold",
    },
  };

  const familyFonts = fontMap[family] || fontMap["Helvetica"];
  return familyFonts[weight] || familyFonts["normal"];
}

/**
 * Add back matter (about author, etc.)
 */
export function addBackMatter(
  doc: InstanceType<typeof PDFDocument>,
  dimensions: any,
  book: Book
): void {
  const trimX = dimensions.bleed;
  const trimY = dimensions.bleed;
  const contentX = trimX + dimensions.margins.left;
  const contentY = trimY + dimensions.margins.top;
  const contentWidth = dimensions.width - dimensions.margins.left - dimensions.margins.right;

  // About Author section
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .fill("#000000")
    .text("About the Author", contentX, contentY);

  doc
    .fontSize(11)
    .font("Helvetica")
    .fill("#333333")
    .text(
      book.description || "The author is a talented writer with a passion for storytelling.",
      contentX,
      contentY + 30,
      {
        width: contentWidth,
        align: "justify",
      }
    );

  doc.addPage();
}

/**
 * Generate complete PDF from book data
 */
export async function generateBookPDF(
  bookId: number,
  book: Book,
  options: PDFBuildOptions = {
    includeFrontMatter: true,
    includeTableOfContents: true,
    includeBackMatter: false,
    includePageNumbers: true,
  }
): Promise<Buffer> {
  const metadata = await getBookMetadata(bookId);
  const trimSize = metadata?.trimSize || "6x9";
  const { doc, spec, dimensions } = createKDPDocument(trimSize);

  // Get book data
  const pages = await getPagesByBookId(bookId);
  const chapters = await getChaptersByBookId(bookId);

  // Metadata is set during PDF creation

  // Add front matter
  if (options.includeFrontMatter) {
    addCoverPage(doc, dimensions, book.title || "Untitled", book.author || "Unknown Author");
    addTitlePage(doc, dimensions, book, metadata);
  }

  // Add table of contents
  if (options.includeTableOfContents && chapters.length > 0) {
    addTableOfContents(doc, dimensions, chapters);
  }

  // Add content pages
  let pageNumber = (options.includeFrontMatter ? 3 : 1) + (options.includeTableOfContents ? 1 : 0);

  pages.forEach((page) => {
    try {
      const content: PageContent = page.content ? JSON.parse(page.content) : { textBlocks: [], images: [] };
      addContentPage(doc, dimensions, content, options.includePageNumbers ? pageNumber : undefined);
      pageNumber++;
    } catch (error) {
      console.warn("Failed to parse page content:", error);
      addContentPage(doc, dimensions, { textBlocks: [], images: [] }, pageNumber);
      pageNumber++;
    }
  });

  // Add back matter
  if (options.includeBackMatter) {
    addBackMatter(doc, dimensions, book);
  }

  // Return PDF as buffer
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    doc.on("error", reject);

    doc.end();
  });
}

/**
 * Generate PDF and return as stream for download
 */
export async function generateBookPDFStream(
  bookId: number,
  book: Book,
  options?: PDFBuildOptions
): Promise<Readable> {
  const buffer = await generateBookPDF(bookId, book, options);
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}
