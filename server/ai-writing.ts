import { invokeLLM } from "./_core/llm";

/**
 * AI Writing Assistance Service
 * Provides writing suggestions, content generation, grammar checking, and style improvements
 */

export interface WritingSuggestion {
  type: "grammar" | "style" | "clarity" | "tone";
  original: string;
  suggestion: string;
  explanation: string;
  confidence: number;
}

export interface ContentGenerationRequest {
  prompt: string;
  style: "formal" | "casual" | "academic" | "narrative";
  length: "short" | "medium" | "long";
  tone: "professional" | "friendly" | "inspirational" | "neutral";
}

/**
 * Generate writing suggestions for a text block
 */
export async function generateWritingSuggestions(text: string): Promise<WritingSuggestion[]> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a professional book editor and writing coach. Analyze the provided text and suggest improvements for grammar, style, clarity, and tone. Return a JSON array of suggestions with the following structure:
[
  {
    "type": "grammar|style|clarity|tone",
    "original": "original text snippet",
    "suggestion": "improved version",
    "explanation": "why this is better",
    "confidence": 0.0-1.0
  }
]
Only include high-confidence suggestions (0.7+). Be constructive and helpful.`,
      },
      {
        role: "user",
        content: `Please review this text and provide suggestions:\n\n"${text}"`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "writing_suggestions",
        strict: true,
        schema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["grammar", "style", "clarity", "tone"],
              },
              original: { type: "string" },
              suggestion: { type: "string" },
              explanation: { type: "string" },
              confidence: { type: "number", minimum: 0, maximum: 1 },
            },
            required: ["type", "original", "suggestion", "explanation", "confidence"],
            additionalProperties: false,
          },
        },
      },
    },
  });

  try {
    const content = response.choices[0]?.message.content;
    if (typeof content === "string") {
      return JSON.parse(content);
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Generate content based on a prompt
 */
export async function generateContent(request: ContentGenerationRequest): Promise<string> {
  const styleGuide = {
    formal: "Use sophisticated vocabulary and complex sentence structures.",
    casual: "Use conversational language and simple, direct sentences.",
    academic: "Use precise terminology and structured arguments.",
    narrative: "Use descriptive language and engaging storytelling techniques.",
  };

  const toneGuide = {
    professional: "Maintain a professional and objective tone.",
    friendly: "Be warm, approachable, and conversational.",
    inspirational: "Be motivational and uplifting.",
    neutral: "Remain balanced and unbiased.",
  };

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a professional book writer and content creator. Generate high-quality content based on the user's request.

Style: ${styleGuide[request.style]}
Tone: ${toneGuide[request.tone]}

Length guidelines:
- Short: 100-200 words
- Medium: 200-400 words
- Long: 400-600 words

Write engaging, well-structured content suitable for a published book.`,
      },
      {
        role: "user",
        content: request.prompt,
      },
    ],
  });

  const content = response.choices[0]?.message.content;
  return typeof content === "string" ? content : "";
}

/**
 * Check grammar and provide corrections
 */
export async function checkGrammar(text: string): Promise<WritingSuggestion[]> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an expert grammar checker and copyeditor. Analyze the text for grammar, punctuation, and spelling errors. Return a JSON array of corrections with high confidence (0.8+).
[
  {
    "type": "grammar",
    "original": "error text",
    "suggestion": "corrected text",
    "explanation": "what was wrong and why",
    "confidence": 0.9
  }
]`,
      },
      {
        role: "user",
        content: `Check this text for grammar errors:\n\n"${text}"`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "grammar_corrections",
        strict: true,
        schema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["grammar"] },
              original: { type: "string" },
              suggestion: { type: "string" },
              explanation: { type: "string" },
              confidence: { type: "number", minimum: 0.8, maximum: 1 },
            },
            required: ["type", "original", "suggestion", "explanation", "confidence"],
            additionalProperties: false,
          },
        },
      },
    },
  });

  try {
    const content = response.choices[0]?.message.content;
    if (typeof content === "string") {
      return JSON.parse(content);
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Improve writing style
 */
export async function improveStyle(text: string, targetStyle: "formal" | "casual" | "academic" | "narrative"): Promise<string> {
  const styleDescriptions = {
    formal: "professional, sophisticated, and authoritative",
    casual: "conversational, friendly, and approachable",
    academic: "scholarly, precise, and well-researched",
    narrative: "engaging, descriptive, and story-driven",
  };

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an expert writing coach. Rewrite the provided text in a ${styleDescriptions[targetStyle]} style. Maintain the original meaning and key information, but adjust the tone, vocabulary, and structure to match the target style.`,
      },
      {
        role: "user",
        content: `Rewrite this text in a ${targetStyle} style:\n\n"${text}"`,
      },
    ],
  });

  const content = response.choices[0]?.message.content;
  return typeof content === "string" ? content : text;
}

/**
 * Generate book cover description from title and metadata
 */
export async function generateCoverDescription(
  title: string,
  author: string,
  genre: string,
  description: string
): Promise<string> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a professional book cover designer and visual artist. Generate a detailed, vivid description of a book cover that would appeal to readers of the specified genre. The description should be suitable for use with an AI image generation tool.

Include:
- Color palette and mood
- Main visual elements
- Typography style
- Composition and layout
- Any specific imagery or symbolism

Be specific and evocative to help create a compelling visual.`,
      },
      {
        role: "user",
        content: `Create a cover description for:
Title: "${title}"
Author: "${author}"
Genre: "${genre}"
Description: "${description}"`,
      },
    ],
  });

  const content = response.choices[0]?.message.content;
  return typeof content === "string" ? content : "";
}

/**
 * Generate chapter outline from a topic or prompt
 */
export async function generateChapterOutline(topic: string, bookGenre: string): Promise<Array<{ title: string; summary: string }>> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a professional book outline creator. Generate a detailed chapter outline for a book chapter based on the provided topic. Return a JSON array of chapters with title and summary.
[
  {
    "title": "Chapter Title",
    "summary": "Brief summary of chapter content"
  }
]`,
      },
      {
        role: "user",
        content: `Create a chapter outline for a ${bookGenre} book about: "${topic}"`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "chapter_outline",
        strict: true,
        schema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              summary: { type: "string" },
            },
            required: ["title", "summary"],
            additionalProperties: false,
          },
        },
      },
    },
  });

  try {
    const content = response.choices[0]?.message.content;
    if (typeof content === "string") {
      return JSON.parse(content);
    }
    return [];
  } catch {
    return [];
  }
}
