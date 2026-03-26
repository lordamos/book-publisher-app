import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { recommendPresets, getRecommendationExplanation, detectTone } from "../preset-recommender";
import { getBookById, getPagesByBookId } from "../db";

export const recommendationsRouter = router({
  // Get recommended presets for a book
  forBook: protectedProcedure
    .input(z.object({ bookId: z.number() }))
    .query(async ({ input, ctx }) => {
      const book = await getBookById(input.bookId);
      if (!book) {
        throw new Error("Book not found");
      }

      // Get book content from pages
      const pages = await getPagesByBookId(input.bookId);
      const content = pages
        .map((p) => p.content || "")
        .join(" ")
        .slice(0, 5000); // Limit to first 5000 chars for performance

      const genre = book.category || "general";
      const recommendations = recommendPresets(book.category || "general", content, 5);

      return {
        bookId: input.bookId,
        genre: book.category || "general",
        recommendations: recommendations.map((rec) => ({
          presetId: rec.presetId,
          presetName: rec.preset.name,
          presetIcon: rec.preset.icon,
          score: rec.score,
          confidence: rec.confidence,
          reasons: rec.reasons,
          explanation: getRecommendationExplanation(rec),
        })),
      };
    }),

  // Get recommendations based on genre and content
  byGenreAndContent: publicProcedure
    .input(
      z.object({
        genre: z.string(),
        content: z.string().max(10000),
        limit: z.number().min(1).max(10).default(5),
      })
    )
    .query(({ input }) => {
      const recommendations = recommendPresets(input.genre, input.content, input.limit);

      return {
        genre: input.genre,
        recommendations: recommendations.map((rec) => ({
          presetId: rec.presetId,
          presetName: rec.preset.name,
          presetIcon: rec.preset.icon,
          presetCategory: rec.preset.category,
          score: rec.score,
          confidence: rec.confidence,
          reasons: rec.reasons,
          explanation: getRecommendationExplanation(rec),
        })),
      };
    }),

  // Analyze tone of content
  analyzeTone: publicProcedure
    .input(z.object({ content: z.string().max(10000) }))
    .query(({ input }) => {
      const toneScores = detectTone(input.content);

      // Sort by score
      const sortedTones = Object.entries(toneScores)
        .filter(([, score]) => score > 0)
        .sort(([, a], [, b]) => b - a);

      return {
        tones: Object.fromEntries(sortedTones),
        dominantTone: sortedTones[0]?.[0] || "neutral",
        dominantToneScore: sortedTones[0]?.[1] || 0,
      };
    }),

  // Get recommendations for a specific genre
  byGenre: publicProcedure
    .input(z.object({ genre: z.string(), limit: z.number().min(1).max(10).default(5) }))
    .query(({ input }) => {
      const recommendations = recommendPresets(input.genre, "", input.limit);

      return {
        genre: input.genre,
        recommendations: recommendations.map((rec) => ({
          presetId: rec.presetId,
          presetName: rec.preset.name,
          presetIcon: rec.preset.icon,
          presetCategory: rec.preset.category,
          score: rec.score,
          confidence: rec.confidence,
          reasons: rec.reasons,
        })),
      };
    }),
});
