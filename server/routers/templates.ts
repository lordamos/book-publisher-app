import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import {
  getAllTemplates,
  getTemplateById,
  getTemplatesByGenre,
  createCustomTemplate,
  updateTemplate,
  deleteTemplate,
  initializeTemplates,
} from "../templates-db";

export const templatesRouter = router({
  // Get all public templates
  list: publicProcedure.query(async () => {
    await initializeTemplates();
    return getAllTemplates();
  }),

  // Get templates by genre
  byGenre: publicProcedure
    .input(z.object({ genre: z.string() }))
    .query(async ({ input }) => {
      return getTemplatesByGenre(input.genre);
    }),

  // Get template by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getTemplateById(input.id);
    }),

  // Create custom template (protected)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        genre: z.string().min(1),
        description: z.string().optional().default(""),
        coverColor: z.string().regex(/^#[0-9A-F]{6}$/i),
        accentColor: z.string().regex(/^#[0-9A-F]{6}$/i),
        bodyFont: z.string(),
        headingFont: z.string(),
        bodyFontSize: z.number().min(8).max(20),
        headingFontSize: z.number().min(16).max(48),
        lineHeight: z.string(),
        marginTop: z.string(),
        marginBottom: z.string(),
        marginLeft: z.string(),
        marginRight: z.string(),
        chapterStyle: z.enum(["numbered", "titled", "decorated"]),
        includeTableOfContents: z.boolean(),
        includeFrontMatter: z.boolean(),
        includeBackMatter: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return createCustomTemplate(ctx.user.id, {
        ...input,
        description: input.description || "",
      });
    }),

  // Update template (protected)
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        genre: z.string().optional(),
        description: z.string().optional(),
        coverColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        accentColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        bodyFont: z.string().optional(),
        headingFont: z.string().optional(),
        bodyFontSize: z.number().min(8).max(20).optional(),
        headingFontSize: z.number().min(16).max(48).optional(),
        lineHeight: z.string().optional(),
        marginTop: z.string().optional(),
        marginBottom: z.string().optional(),
        marginLeft: z.string().optional(),
        marginRight: z.string().optional(),
        chapterStyle: z.enum(["numbered", "titled", "decorated"]).optional(),
        includeTableOfContents: z.boolean().optional(),
        includeFrontMatter: z.boolean().optional(),
        includeBackMatter: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...config } = input;
      return updateTemplate(id, config);
    }),

  // Delete template (protected)
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return deleteTemplate(input.id);
    }),
});
