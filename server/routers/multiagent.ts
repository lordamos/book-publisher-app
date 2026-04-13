/**
 * Multi-Agent tRPC Router
 * Exposes multi-agent orchestration endpoints
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { runMultiAgent, runMultiAgentWithRetry, orchestrator } from "../agents/orchestrator";
import { writerAgent, generateBookOutline, expandChapter } from "../agents/writerAgent";
import { editorAgent, analyzeContent, generateSuggestions, critiqueContent } from "../agents/editorAgent";
import { publisherAgent, generateKDPMetadata, validateISBN } from "../agents/publisherAgent";
import { marketerAgent, generateLaunchStrategy, generateBookDescription } from "../agents/marketerAgent";

export const multiagentRouter = router({
  /**
   * Run complete multi-agent workflow
   */
  runWorkflow: protectedProcedure
    .input(
      z.object({
        goal: z.string().min(10).max(1000),
        improvementPasses: z.number().min(1).max(5).optional(),
        includeMarketing: z.boolean().optional(),
        autoPublish: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await runMultiAgent({
          goal: input.goal,
          improvementPasses: input.improvementPasses,
          includeMarketing: input.includeMarketing,
          autoPublish: input.autoPublish,
        });

        return {
          success: true,
          data: result,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Run workflow with retry logic
   */
  runWorkflowWithRetry: protectedProcedure
    .input(
      z.object({
        goal: z.string().min(10).max(1000),
        improvementPasses: z.number().min(1).max(5).optional(),
        retries: z.number().min(1).max(5).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await runMultiAgentWithRetry(
          {
            goal: input.goal,
            improvementPasses: input.improvementPasses,
          },
          input.retries
        );

        return {
          success: true,
          data: result,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Get orchestrator status
   */
  getStatus: protectedProcedure.query(() => {
    return orchestrator.getStatus();
  }),

  /**
   * Writer Agent: Generate book outline
   */
  generateOutline: protectedProcedure
    .input(z.object({ goal: z.string().min(10).max(1000) }))
    .mutation(async ({ input }) => {
      const result = await generateBookOutline(input.goal);
      return result;
    }),

  /**
   * Writer Agent: Write book
   */
  writeBook: protectedProcedure
    .input(z.object({ goal: z.string().min(10).max(1000) }))
    .mutation(async ({ input }) => {
      const result = await writerAgent(input.goal);
      return result;
    }),

  /**
   * Writer Agent: Expand chapter
   */
  expandChapter: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        outline: z.string(),
        wordCount: z.number().min(500).max(10000).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await expandChapter(input.title, input.outline, input.wordCount);
      return result;
    }),

  /**
   * Editor Agent: Edit content
   */
  editContent: protectedProcedure
    .input(z.object({ content: z.string().min(100) }))
    .mutation(async ({ input }) => {
      const result = await editorAgent(input.content);
      return result;
    }),

  /**
   * Editor Agent: Analyze content
   */
  analyzeContent: protectedProcedure
    .input(
      z.object({
        content: z.string().min(100),
        aspects: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await analyzeContent(input.content, input.aspects);
      return result;
    }),

  /**
   * Editor Agent: Generate suggestions
   */
  generateSuggestions: protectedProcedure
    .input(
      z.object({
        content: z.string().min(100),
        focusArea: z.enum(['clarity', 'flow', 'emotion', 'grammar', 'style']),
      })
    )
    .mutation(async ({ input }) => {
      const result = await generateSuggestions(input.content, input.focusArea);
      return result;
    }),

  /**
   * Editor Agent: Critique content
   */
  critiqueContent: protectedProcedure
    .input(z.object({ content: z.string().min(100) }))
    .mutation(async ({ input }) => {
      const result = await critiqueContent(input.content);
      return result;
    }),

  /**
   * Publisher Agent: Publish book
   */
  publishBook: protectedProcedure
    .input(z.object({ content: z.string().min(1000) }))
    .mutation(async ({ input }) => {
      const result = await publisherAgent(input.content);
      return result;
    }),

  /**
   * Publisher Agent: Generate KDP metadata
   */
  generateKDPMetadata: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        author: z.string(),
        description: z.string(),
        isbn: z.string(),
        categories: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const result = await generateKDPMetadata(
        input.title,
        input.author,
        input.description,
        input.isbn,
        input.categories
      );
      return result;
    }),

  /**
   * Publisher Agent: Validate ISBN
   */
  validateISBN: protectedProcedure
    .input(z.object({ isbn: z.string() }))
    .query(({ input }) => {
      const valid = validateISBN(input.isbn);
      return { valid, isbn: input.isbn };
    }),

  /**
   * Marketer Agent: Create marketing materials
   */
  createMarketing: protectedProcedure
    .input(z.object({ topic: z.string().min(10).max(500) }))
    .mutation(async ({ input }) => {
      const result = await marketerAgent(input.topic);
      return result;
    }),

  /**
   * Marketer Agent: Generate launch strategy
   */
  generateLaunchStrategy: protectedProcedure
    .input(
      z.object({
        bookTitle: z.string(),
        targetAudience: z.string(),
        launchDate: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await generateLaunchStrategy(
        input.bookTitle,
        input.targetAudience,
        input.launchDate
      );
      return result;
    }),

  /**
   * Marketer Agent: Generate book description
   */
  generateBookDescription: protectedProcedure
    .input(
      z.object({
        bookTitle: z.string(),
        genre: z.string(),
        keyThemes: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const result = await generateBookDescription(
        input.bookTitle,
        input.genre,
        input.keyThemes
      );
      return result;
    }),
});
