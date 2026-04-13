/**
 * Editor Agent
 * Improves content clarity, flow, emotional depth, and readability
 */

import { invokeLLM } from "../_core/llm";
import { EditorAgentOutput, Suggestion, AgentResult } from "./types";

export async function editorAgent(draft: string): Promise<AgentResult> {
  const startTime = Date.now();

  try {
    const prompt = `You are a senior book editor with expertise in improving clarity, flow, emotional depth, and readability.

Original Draft:
${draft}

Your task:
1. Analyze the draft for clarity, flow, emotional depth, and readability
2. Provide specific suggestions for improvement
3. Rewrite weak sections
4. Maintain the author's voice while improving quality
5. Score each aspect (0-100)

Return your analysis in JSON format:
{
  "improvedContent": "Full improved version of the text",
  "suggestions": [
    {
      "type": "clarity|flow|emotion|grammar|style",
      "location": "Section/paragraph reference",
      "original": "Original text",
      "suggested": "Improved text",
      "reason": "Why this change improves the text",
      "confidence": 0.95
    }
  ],
  "improvements": {
    "clarityScore": 85,
    "flowScore": 78,
    "emotionalDepthScore": 82,
    "readabilityScore": 88
  }
}

Focus on making the content more engaging, clear, and emotionally resonant.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a senior book editor. Analyze and improve content quality. Return results in JSON format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const messageContent = response.choices[0]?.message?.content;
    const content = typeof messageContent === 'string' ? messageContent : '';
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from LLM response");
    }

    const editorOutput = JSON.parse(jsonMatch[0]) as EditorAgentOutput;
    const duration = Date.now() - startTime;

    return {
      success: true,
      data: editorOutput,
      timestamp: Date.now(),
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error in Editor Agent",
      timestamp: Date.now(),
      duration,
    };
  }
}

/**
 * Analyze specific aspects of content
 */
export async function analyzeContent(
  content: string,
  aspects: string[] = ['clarity', 'flow', 'emotion', 'readability']
): Promise<AgentResult> {
  const startTime = Date.now();

  try {
    const aspectsList = aspects.join(', ');
    const prompt = `You are a professional content analyst.

Content to analyze:
${content}

Analyze the following aspects: ${aspectsList}

For each aspect, provide:
1. Current score (0-100)
2. Strengths
3. Areas for improvement
4. Specific suggestions

Return as JSON:
{
  "analysis": {
    "clarity": { "score": 85, "strengths": [], "improvements": [], "suggestions": [] },
    "flow": { "score": 78, "strengths": [], "improvements": [], "suggestions": [] },
    "emotion": { "score": 82, "strengths": [], "improvements": [], "suggestions": [] },
    "readability": { "score": 88, "strengths": [], "improvements": [], "suggestions": [] }
  },
  "overallScore": 83,
  "summary": "Overall assessment"
}`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a professional content analyst. Provide detailed analysis in JSON format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const messageContent = response.choices[0]?.message?.content;
    const responseContent = typeof messageContent === 'string' ? messageContent : '';
    
    const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from LLM response");
    }

    const analysis = JSON.parse(jsonMatch[0]);
    const duration = Date.now() - startTime;

    return {
      success: true,
      data: analysis,
      timestamp: Date.now(),
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error analyzing content",
      timestamp: Date.now(),
      duration,
    };
  }
}

/**
 * Generate specific improvement suggestions
 */
export async function generateSuggestions(
  content: string,
  focusArea: 'clarity' | 'flow' | 'emotion' | 'grammar' | 'style'
): Promise<AgentResult> {
  const startTime = Date.now();

  try {
    const focusDescription = {
      clarity: 'Make the writing clearer and more understandable',
      flow: 'Improve transitions and logical flow between ideas',
      emotion: 'Add more emotional depth and resonance',
      grammar: 'Fix grammar, punctuation, and syntax errors',
      style: 'Improve writing style and voice consistency',
    }[focusArea];

    const prompt = `You are a professional editor specializing in ${focusArea} improvement.

Content:
${content}

Focus: ${focusDescription}

Provide specific, actionable suggestions for improvement. For each suggestion:
1. Identify the exact location in the text
2. Show the original text
3. Provide the improved version
4. Explain why this change is better
5. Rate your confidence (0-1)

Return as JSON array:
[
  {
    "location": "Paragraph/section reference",
    "original": "Original text",
    "suggested": "Improved text",
    "reason": "Why this is better",
    "confidence": 0.95
  }
]`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a professional editor specializing in ${focusArea}. Provide suggestions in JSON format.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const messageContent = response.choices[0]?.message?.content;
    const responseContent = typeof messageContent === 'string' ? messageContent : '';
    
    const jsonMatch = responseContent.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from LLM response");
    }

    const suggestions = JSON.parse(jsonMatch[0]) as Suggestion[];
    const duration = Date.now() - startTime;

    return {
      success: true,
      data: suggestions,
      timestamp: Date.now(),
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error generating suggestions",
      timestamp: Date.now(),
      duration,
    };
  }
}

/**
 * Critique and score content quality
 */
export async function critiqueContent(content: string): Promise<AgentResult> {
  const startTime = Date.now();

  try {
    const prompt = `You are a professional book critic and quality assessor.

Content to critique:
${content}

Provide a comprehensive critique including:
1. Overall quality score (0-100)
2. Strengths (list 3-5)
3. Weaknesses (list 3-5)
4. Specific areas for improvement
5. Estimated impact of improvements

Return as JSON:
{
  "overallScore": 85,
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "improvements": ["Improvement 1", "Improvement 2"],
  "estimatedImpactScore": 92,
  "summary": "Overall assessment"
}`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a professional book critic. Provide detailed critique in JSON format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const messageContent = response.choices[0]?.message?.content;
    const responseContent = typeof messageContent === 'string' ? messageContent : '';
    
    const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from LLM response");
    }

    const critique = JSON.parse(jsonMatch[0]);
    const duration = Date.now() - startTime;

    return {
      success: true,
      data: critique,
      timestamp: Date.now(),
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error critiquing content",
      timestamp: Date.now(),
      duration,
    };
  }
}
