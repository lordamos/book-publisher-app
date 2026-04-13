import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getBookById, getPagesByBookId } from "../db";
import { storagePut } from "../storage";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { TRPCError } from "@trpc/server";

const PDFExportOptionsSchema = z.object({
  filename: z.string().min(1).max(255),
  pageRange: z.enum(["all", "current", "range"]),
  startPage: z.number().optional(),
  endPage: z.number().optional(),
  marginTop: z.number().min(0).max(50),
  marginBottom: z.number().min(0).max(50),
  marginLeft: z.number().min(0).max(50),
  marginRight: z.number().min(0).max(50),
  quality: z.enum(["low", "medium", "high"]),
  includeMetadata: z.boolean(),
  includePageNumbers: z.boolean(),
  paperSize: z.enum(["letter", "a4", "a5"]),
});

const PAPER_SIZES = {
  letter: { width: 612, height: 792 },
  a4: { width: 595, height: 842 },
  a5: { width: 420, height: 595 },
};

export const exportRouter = router({
  pdf: protectedProcedure
    .input(
      z.object({
        bookId: z.string(),
        options: PDFExportOptionsSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get book
        const bookId = parseInt(input.bookId, 10);
        const book = await getBookById(bookId);
        if (!book) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Book not found",
          });
        }

        // Verify ownership
        if (book.userId.toString() !== input.bookId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to export this book",
          });
        }

        // Get pages
        const pages = await getPagesByBookId(bookId);
        if (!pages || pages.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No pages to export",
          });
        }

        // Generate PDF
        const pdfBytes = await generatePDF(pages, input.options);

        // Upload to storage
        const fileKey = `exports/${ctx.user.id}/${Date.now()}-${input.options.filename}`;
        const { url } = await storagePut(fileKey, pdfBytes, "application/pdf");

        return {
          success: true,
          url,
          size: pdfBytes.length,
          pages: pages.length,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate PDF",
        });
      }
    }),
});

async function generatePDF(pages: any[], options: z.infer<typeof PDFExportOptionsSchema>) {
  const pdfDoc = await PDFDocument.create();

  // Set metadata
  if (options.includeMetadata) {
    pdfDoc.setTitle(options.filename.replace(".pdf", ""));
    pdfDoc.setCreator("Book Publisher Pro");
  }

  const paperSize = PAPER_SIZES[options.paperSize];
  const pagesToExport = getPageRange(pages, options);

  for (let i = 0; i < pagesToExport.length; i++) {
    const page = pagesToExport[i];
    const pdfPage = pdfDoc.addPage([paperSize.width, paperSize.height]);

    // Add content
    await addPageContent(pdfPage, page, options, i + 1);
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

function getPageRange(pages: any[], options: z.infer<typeof PDFExportOptionsSchema>) {
  if (options.pageRange === "all") {
    return pages;
  }

  if (options.pageRange === "current") {
    return pages.slice(0, 1);
  }

  if (options.pageRange === "range") {
    const start = (options.startPage || 1) - 1;
    const end = options.endPage || pages.length;
    return pages.slice(start, end);
  }

  return pages;
}

async function addPageContent(
  pdfPage: any,
  page: any,
  options: z.infer<typeof PDFExportOptionsSchema>,
  pageNumber: number
) {
  const { marginLeft, marginTop } = options;
  const font = await pdfPage.embedFont(StandardFonts.Helvetica);

  // Parse page content
  let content: any = {};
  try {
    content = typeof page.content === "string" ? JSON.parse(page.content) : page.content;
  } catch {
    content = { textBlocks: [], images: [] };
  }

  // Draw text blocks
  if (content.textBlocks && Array.isArray(content.textBlocks)) {
    for (const textBlock of content.textBlocks) {
      const x = marginLeft + (textBlock.x || 0);
      const y = pdfPage.getHeight() - marginTop - (textBlock.y || 0) - 20;

      const fontSize = textBlock.fontSize || 12;
      const text = textBlock.text || "";

      pdfPage.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color: { r: 0, g: 0, b: 0 },
      });
    }
  }

  // Add page number
  if (options.includePageNumbers) {
    const pageNumFont = await pdfPage.embedFont(StandardFonts.Helvetica);
    const pageNumX = pdfPage.getWidth() / 2;
    const pageNumY = options.marginTop / 2;

    pdfPage.drawText(pageNumber.toString(), {
      x: pageNumX,
      y: pageNumY,
      size: 10,
      font: pageNumFont,
      color: { r: 0.5, g: 0.5, b: 0.5 },
    });
  }
}
