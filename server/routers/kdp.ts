import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getBookById } from "../db";
import {
  validateBookForKDP,
  generateTableOfContents,
  generateKDPExportURL,
  getKDPPageSpec,
  calculateBookDimensions,
} from "../kdp-export";

export const kdpRouter = router({
  validate: protectedProcedure
    .input(z.object({ bookId: z.number() }))
    .query(async ({ input }) => {
      const book = await getBookById(input.bookId);
      if (!book) {
        throw new Error("Book not found");
      }
      return validateBookForKDP(book);
    }),

  getPageSpec: protectedProcedure
    .input(z.object({ trimSize: z.string() }))
    .query(({ input }) => {
      const spec = getKDPPageSpec(input.trimSize);
      const dimensions = calculateBookDimensions(spec);
      return { spec, dimensions };
    }),

  generateTableOfContents: protectedProcedure
    .input(z.object({ bookId: z.number() }))
    .query(async ({ input }) => {
      return generateTableOfContents(input.bookId);
    }),

  export: protectedProcedure
    .input(
      z.object({
        bookId: z.number(),
        includeFrontMatter: z.boolean().default(true),
        includeTableOfContents: z.boolean().default(true),
        includeBackMatter: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const book = await getBookById(input.bookId);
      if (!book) {
        throw new Error("Book not found");
      }

      return generateKDPExportURL(input.bookId, book, {
        includeFrontMatter: input.includeFrontMatter,
        includeTableOfContents: input.includeTableOfContents,
        includeBackMatter: input.includeBackMatter,
      });
    }),
});
