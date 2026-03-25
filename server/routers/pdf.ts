import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getBookById } from "../db";
import { generateBookPDF, generateBookPDFStream } from "../pdf-builder";

export const pdfRouter = router({
  generatePDF: protectedProcedure
    .input(
      z.object({
        bookId: z.number(),
        includeFrontMatter: z.boolean().default(true),
        includeTableOfContents: z.boolean().default(true),
        includeBackMatter: z.boolean().default(false),
        includePageNumbers: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const book = await getBookById(input.bookId);
      if (!book) {
        throw new Error("Book not found");
      }

      try {
        const pdfBuffer = await generateBookPDF(input.bookId, book, {
          includeFrontMatter: input.includeFrontMatter,
          includeTableOfContents: input.includeTableOfContents,
          includeBackMatter: input.includeBackMatter,
          includePageNumbers: input.includePageNumbers,
        });

        // Convert buffer to base64 for transmission
        const base64 = pdfBuffer.toString("base64");

        return {
          success: true,
          pdf: base64,
          fileName: `${(book.title || "book").replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`,
          size: pdfBuffer.length,
        };
      } catch (error) {
        console.error("PDF generation failed:", error);
        throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }),

  previewPDF: protectedProcedure
    .input(z.object({ bookId: z.number() }))
    .query(async ({ input }) => {
      const book = await getBookById(input.bookId);
      if (!book) {
        throw new Error("Book not found");
      }

      try {
        const pdfBuffer = await generateBookPDF(input.bookId, book);

        // Return a preview URL (in production, this would be uploaded to S3)
        const base64 = pdfBuffer.toString("base64");
        const dataUrl = `data:application/pdf;base64,${base64}`;

        return {
          success: true,
          previewUrl: dataUrl,
          size: pdfBuffer.length,
        };
      } catch (error) {
        console.error("PDF preview generation failed:", error);
        throw new Error(`Failed to generate PDF preview: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }),
});
