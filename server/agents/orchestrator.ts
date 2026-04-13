/**
 * Orchestrator
 * Coordinates all agents in a multi-agent workflow
 * Manages sequencing, error handling, and quality improvement
 */

import { writerAgent, generateBookOutline } from "./writerAgent";
import { editorAgent, critiqueContent } from "./editorAgent";
import { publisherAgent } from "./publisherAgent";
import { marketerAgent } from "./marketerAgent";
import { OrchestrationResult, MultiAgentOptions, CritiqueResult, AgentResult } from "./types";

export class Orchestrator {
  private maxRetries = 3;
  private timeout = 300000; // 5 minutes

  /**
   * Run the complete multi-agent workflow
   */
  async runMultiAgent(options: MultiAgentOptions): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const improvementPasses = options.improvementPasses || 1;

    console.log("🧠 Orchestrator started");
    console.log(`📋 Goal: ${options.goal}`);
    console.log(`🔄 Improvement passes: ${improvementPasses}`);

    try {
      // 1. Generate book outline first
      console.log("📝 Generating book outline...");
      const outlineResult = await generateBookOutline(options.goal);
      if (!outlineResult.success) {
        throw new Error(`Failed to generate outline: ${outlineResult.error}`);
      }

      // 2. Write the book
      console.log("✍️ Writing book...");
      const draftResult = await writerAgent(options.goal);
      if (!draftResult.success) {
        throw new Error(`Failed to write book: ${draftResult.error}`);
      }

      let draft = draftResult.data;
      let draftContent = this.formatDraftForEditing(draft);

      // 3. Edit the book with improvement loop
      console.log("🧾 Editing book...");
      let edited = await editorAgent(draftContent);
      if (!edited.success) {
        throw new Error(`Failed to edit book: ${edited.error}`);
      }

      // Apply self-critique loop for quality improvement
      for (let i = 0; i < improvementPasses; i++) {
        console.log(`🔄 Improvement pass ${i + 1}/${improvementPasses}...`);
        const improved = await this.improveContent(edited.data.improvedContent);
        edited.data.improvedContent = improved.content;
      }

      // 4. Publish the book
      console.log("📦 Publishing book...");
      const published = await publisherAgent(edited.data.improvedContent);
      if (!published.success) {
        throw new Error(`Failed to publish book: ${published.error}`);
      }

      // 5. Create marketing materials (if enabled)
      let marketing = null;
      if (options.includeMarketing !== false) {
        console.log("💰 Creating marketing materials...");
        marketing = await marketerAgent(options.goal);
        if (!marketing.success) {
          console.warn(`Warning: Failed to create marketing materials: ${marketing.error}`);
        }
      }

      // Calculate quality score
      const qualityScore = this.calculateQualityScore(
        draftResult,
        edited,
        published
      );

      const totalDuration = Date.now() - startTime;

      console.log("✅ Orchestrator completed successfully");
      console.log(`⏱️ Total duration: ${(totalDuration / 1000).toFixed(2)}s`);
      console.log(`📊 Quality score: ${qualityScore}`);

      return {
        goal: options.goal,
        draft,
        edited: edited.data,
        published: published.data,
        marketing: marketing?.data || null,
        totalDuration,
        qualityScore,
      };
    } catch (error) {
      console.error("❌ Orchestrator failed:", error);
      throw error;
    }
  }

  /**
   * Improve content through self-critique loop
   */
  private async improveContent(content: string): Promise<CritiqueResult> {
    try {
      // Get critique of current content
      const critiqueResult = await critiqueContent(content);
      if (!critiqueResult.success) {
        throw new Error(`Critique failed: ${critiqueResult.error}`);
      }

      const critique = critiqueResult.data;
      const originalScore = critique.overallScore || 0;

      // Edit based on critique
      const editResult = await editorAgent(content);
      if (!editResult.success) {
        throw new Error(`Edit failed: ${editResult.error}`);
      }

      const improvedContent = editResult.data.improvedContent;
      const improvedScore = this.estimateQualityScore(improvedContent);

      return {
        originalScore,
        improvedScore,
        improvements: critique.improvements || [],
        content: improvedContent,
      };
    } catch (error) {
      console.warn("Warning: Content improvement failed, returning original");
      return {
        originalScore: 0,
        improvedScore: 0,
        improvements: [],
        content,
      };
    }
  }

  /**
   * Format draft for editing
   */
  private formatDraftForEditing(draft: any): string {
    if (typeof draft === 'string') {
      return draft;
    }

    if (draft.chapters && Array.isArray(draft.chapters)) {
      return draft.chapters
        .map((chapter: any) => {
          const title = chapter.title || `Chapter ${chapter.number}`;
          return `# ${title}\n\n${chapter.content}`;
        })
        .join('\n\n---\n\n');
    }

    return JSON.stringify(draft, null, 2);
  }

  /**
   * Calculate quality score based on agent outputs
   */
  private calculateQualityScore(
    draftResult: AgentResult,
    editedResult: AgentResult,
    publishedResult: AgentResult
  ): number {
    let score = 50; // Base score

    // Add points for successful stages
    if (draftResult.success) score += 15;
    if (editedResult.success) score += 20;
    if (publishedResult.success) score += 15;

    // Add points based on editor improvements
    if (editedResult.data?.improvements) {
      const improvements = editedResult.data.improvements;
      const avgScore =
        (improvements.clarityScore +
          improvements.flowScore +
          improvements.emotionalDepthScore +
          improvements.readabilityScore) /
        4;
      score += (avgScore / 100) * 10;
    }

    return Math.min(100, Math.round(score));
  }

  /**
   * Estimate quality score of content
   */
  private estimateQualityScore(content: string): number {
    let score = 50;

    // Length score
    const wordCount = content.split(/\s+/).length;
    if (wordCount > 1000) score += 10;
    if (wordCount > 5000) score += 10;

    // Structure score
    if (content.includes('#')) score += 5; // Has headers
    if (content.includes('Chapter')) score += 5; // Has chapters
    if (content.match(/\n\n/g)?.length || 0 > 5) score += 5; // Good paragraph structure

    // Complexity score
    const avgWordLength =
      content.split(/\s+/).reduce((sum, word) => sum + word.length, 0) /
      content.split(/\s+/).length;
    if (avgWordLength > 4.5) score += 5; // More sophisticated vocabulary

    return Math.min(100, Math.round(score));
  }

  /**
   * Run with retry logic
   */
  async runWithRetry(options: MultiAgentOptions, retries = this.maxRetries): Promise<OrchestrationResult> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.runMultiAgent(options);
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        if (attempt === retries) {
          throw error;
        }
        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
    throw new Error("All retry attempts failed");
  }

  /**
   * Get orchestrator status
   */
  getStatus(): {
    ready: boolean;
    agents: string[];
    maxRetries: number;
    timeout: number;
  } {
    return {
      ready: true,
      agents: ['writer', 'editor', 'publisher', 'marketer'],
      maxRetries: this.maxRetries,
      timeout: this.timeout,
    };
  }
}

// Export singleton instance
export const orchestrator = new Orchestrator();

/**
 * Convenience function for running multi-agent workflow
 */
export async function runMultiAgent(options: MultiAgentOptions): Promise<OrchestrationResult> {
  return orchestrator.runMultiAgent(options);
}

/**
 * Run with retry wrapper
 */
export async function runMultiAgentWithRetry(
  options: MultiAgentOptions,
  retries?: number
): Promise<OrchestrationResult> {
  return orchestrator.runWithRetry(options, retries);
}
