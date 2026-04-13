/**
 * Writer Agent
 * Generates structured, high-quality book content with chapters
 */

import { invokeLLM } from "../_core/llm";
import { WriterAgentOutput, Chapter, AgentResult } from "./types";

export async function writerAgent(goal: string): Promise<AgentResult> {
  const startTime = Date.now();

  try {
    const prompt = `You are a professional book writer specializing in creating engaging, well-structured books.

Goal: ${goal}

Your task:
1. Create a compelling book with 5-8 chapters
2. Make it emotionally engaging and clear
3. Ensure logical flow between chapters
4. Include chapter titles and summaries
5. Maintain consistent tone and style
6. Target audience: General readers

Generate the book in JSON format with this structure:
{
  "title": "Book Title",
  "chapters": [
    {
      "number": 1,
      "title": "Chapter Title",
      "content": "Chapter content here...",
      "wordCount": 1000
    }
  ],
  "metadata": {
    "wordCount": 50000,
    "estimatedReadTime": 240,
    "tone": "engaging"
  }
}

Make sure the content is high-quality, engaging, and well-structured.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a professional book writer. Generate high-quality book content in JSON format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const messageContent = response.choices[0]?.message?.content;
    const content = typeof messageContent === 'string' ? messageContent : '';
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from LLM response");
    }

    const bookData = JSON.parse(jsonMatch[0]) as WriterAgentOutput;

    // Validate and calculate total word count
    let totalWordCount = 0;
    bookData.chapters.forEach((chapter) => {
      totalWordCount += chapter.wordCount || 0;
    });

    bookData.metadata.wordCount = totalWordCount;
    bookData.metadata.estimatedReadTime = Math.ceil(totalWordCount / 250); // Average reading speed

    const duration = Date.now() - startTime;

    return {
      success: true,
      data: bookData,
      timestamp: Date.now(),
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error in Writer Agent",
      timestamp: Date.now(),
      duration,
    };
  }
}

/**
 * Generate book outline from goal
 * Useful for planning before full content generation
 */
export async function generateBookOutline(goal: string): Promise<AgentResult> {
  const startTime = Date.now();

  try {
    const prompt = `You are a professional book outline creator.

Goal: ${goal}

Create a detailed book outline with:
1. Book title
2. 5-8 chapter titles
3. Brief description of each chapter (2-3 sentences)
4. Target audience
5. Key themes

Format as JSON:
{
  "title": "Book Title",
  "outline": [
    {
      "chapterNumber": 1,
      "title": "Chapter Title",
      "description": "Description of chapter content"
    }
  ],
  "targetAudience": "Description",
  "keyThemes": ["theme1", "theme2"]
}`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a professional book outline creator. Generate outlines in JSON format.",
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

    const outline = JSON.parse(jsonMatch[0]);
    const duration = Date.now() - startTime;

    return {
      success: true,
      data: outline,
      timestamp: Date.now(),
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error generating outline",
      timestamp: Date.now(),
      duration,
    };
  }
}

/**
 * Expand a single chapter with more detail
 */
export async function expandChapter(
  chapterTitle: string,
  chapterOutline: string,
  targetWordCount: number = 2000
): Promise<AgentResult> {
  const startTime = Date.now();

  try {
    const prompt = `You are a professional book writer.

Chapter Title: ${chapterTitle}
Outline: ${chapterOutline}
Target Word Count: ${targetWordCount}

Write a detailed, engaging chapter that:
1. Follows the outline
2. Is approximately ${targetWordCount} words
3. Has clear sections and flow
4. Engages the reader emotionally
5. Maintains consistent tone

Return the chapter content as plain text.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a professional book writer. Write engaging, well-structured chapters.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const messageContent = response.choices[0]?.message?.content;
    const content = typeof messageContent === 'string' ? messageContent : '';
    const wordCount = content.split(/\s+/).length;
    const duration = Date.now() - startTime;

    return {
      success: true,
      data: {
        content,
        wordCount,
        title: chapterTitle,
      },
      timestamp: Date.now(),
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error expanding chapter",
      timestamp: Date.now(),
      duration,
    };
  }
}
