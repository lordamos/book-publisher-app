import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import {
  generateWritingSuggestions,
  generateContent,
  checkGrammar,
  improveStyle,
  generateCoverDescription,
  generateChapterOutline,
} from "../ai-writing";

export const aiRouter = router({
  suggestions: protectedProcedure
    .input(z.object({ text: z.string().min(10) }))
    .query(async ({ input }) => {
      return generateWritingSuggestions(input.text);
    }),

  generateContent: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(10),
        style: z.enum(["formal", "casual", "academic", "narrative"]).default("narrative"),
        length: z.enum(["short", "medium", "long"]).default("medium"),
        tone: z.enum(["professional", "friendly", "inspirational", "neutral"]).default("neutral"),
      })
    )
    .mutation(async ({ input }) => {
      return generateContent({
        prompt: input.prompt,
        style: input.style,
        length: input.length,
        tone: input.tone,
      });
    }),

  checkGrammar: protectedProcedure
    .input(z.object({ text: z.string().min(10) }))
    .query(async ({ input }) => {
      return checkGrammar(input.text);
    }),

  improveStyle: protectedProcedure
    .input(
      z.object({
        text: z.string().min(10),
        targetStyle: z.enum(["formal", "casual", "academic", "narrative"]),
      })
    )
    .mutation(async ({ input }) => {
      return improveStyle(input.text, input.targetStyle);
    }),

  generateCoverDescription: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        author: z.string(),
        genre: z.string(),
        description: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return generateCoverDescription(input.title, input.author, input.genre, input.description);
    }),

  generateChapterOutline: protectedProcedure
    .input(
      z.object({
        topic: z.string(),
        genre: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return generateChapterOutline(input.topic, input.genre);
    }),
});
