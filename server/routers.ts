import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { kdpRouter } from "./routers/kdp";
import { aiRouter } from "./routers/ai";
import { autosaveRouter } from "./routers/autosave";
import { pdfRouter } from "./routers/pdf";
import { templatesRouter } from "./routers/templates";
import { presetsRouter } from "./routers/presets";
import { recommendationsRouter } from "./routers/recommendations";
import { batchRouter } from "./routers/batch";
import { versionsRouter } from "./routers/versions";
import { diffRouter } from "./routers/diff";
import { mergeRouter } from "./routers/merge";
import { sideBySideRouter } from "./routers/sidebyside";
import { diffExportRouter } from "./routers/diffexport";
import { batchExportRouter } from "./routers/batchexport";
import { coverTemplatesRouter } from "./routers/covertemplates";
import { fontsRouter } from "./routers/fonts";
import { z } from "zod";
import {
  getBooksByUserId,
  getBookById,
  createBook,
  updateBook,
  getPagesByBookId,
  createPage,
  updatePage,
  getChaptersByBookId,
  createChapter,
  getImagesByBookId,
  createBookImage,
  getBookMetadata,
  createBookMetadata,
  updateBookMetadata,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  templates: templatesRouter,
  presets: presetsRouter,
  recommendations: recommendationsRouter,
  batch: batchRouter,
  versions: versionsRouter,
  diff: diffRouter,
  merge: mergeRouter,
  sidebyside: sideBySideRouter,
  diffexport: diffExportRouter,
  batchexport: batchExportRouter,
  covertemplates: coverTemplatesRouter,
  fonts: fontsRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Book management
  books: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getBooksByUserId(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ bookId: z.number() }))
      .query(async ({ input }) => {
        return getBookById(input.bookId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string().optional(),
          author: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await createBook({
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
          author: input.author,
          status: "draft",
        });
        
        // Create default metadata
        if (result && typeof result === 'object' && 'insertId' in result) {
          const bookId = Number((result as any).insertId);
          await createBookMetadata({ bookId });
        }
        
        return result;
      }),

    update: protectedProcedure
      .input(
        z.object({
          bookId: z.number(),
          data: z.record(z.string(), z.any()),
        })
      )
      .mutation(async ({ input }) => {
        await updateBook(input.bookId, input.data);
        return { success: true };
      }),
  }),

  // Page management
  pages: router({
    list: protectedProcedure
      .input(z.object({ bookId: z.number() }))
      .query(async ({ input }) => {
        return getPagesByBookId(input.bookId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          bookId: z.number(),
          pageNumber: z.number(),
          templateType: z.string(),
          content: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await createPage({
          bookId: input.bookId,
          pageNumber: input.pageNumber,
          templateType: input.templateType as any,
          content: input.content,
        });
        return { success: true, insertId: (result as any)?.insertId };
      }),

    update: protectedProcedure
      .input(
        z.object({
          pageId: z.number(),
          data: z.record(z.string(), z.any()),
        })
      )
      .mutation(async ({ input }) => {
        await updatePage(input.pageId, input.data);
        return { success: true };
      }),
  }),

  // Chapter management
  chapters: router({
    list: protectedProcedure
      .input(z.object({ bookId: z.number() }))
      .query(async ({ input }) => {
        return getChaptersByBookId(input.bookId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          bookId: z.number(),
          chapterNumber: z.number(),
          title: z.string(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await createChapter({
          bookId: input.bookId,
          chapterNumber: input.chapterNumber,
          title: input.title,
          description: input.description,
        });
        return { success: true, insertId: (result as any)?.insertId };
      }),
  }),

  // Image management
  images: router({
    list: protectedProcedure
      .input(z.object({ bookId: z.number() }))
      .query(async ({ input }) => {
        return getImagesByBookId(input.bookId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          bookId: z.number(),
          url: z.string(),
          fileKey: z.string(),
          fileName: z.string().optional(),
          mimeType: z.string().optional(),
          fileSize: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await createBookImage({
          bookId: input.bookId,
          url: input.url,
          fileKey: input.fileKey,
          fileName: input.fileName,
          mimeType: input.mimeType,
          fileSize: input.fileSize,
        });
        return { success: true, insertId: (result as any)?.insertId };
      }),
  }),

  // KDP Export
  kdp: kdpRouter,

  // AI Writing Assistance
  ai: aiRouter,

  // Auto-Save and Backup
  autosave: autosaveRouter,

  // PDF Generation
  pdf: pdfRouter,

  // Metadata management
  metadata: router({
    get: protectedProcedure
      .input(z.object({ bookId: z.number() }))
      .query(async ({ input }) => {
        return getBookMetadata(input.bookId);
      }),

    update: protectedProcedure
      .input(
        z.object({
          bookId: z.number(),
          data: z.record(z.string(), z.any()),
        })
      )
      .mutation(async ({ input }) => {
        await updateBookMetadata(input.bookId, input.data);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
