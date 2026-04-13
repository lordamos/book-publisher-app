/**
 * Marketer Agent
 * Creates marketing funnels, email sequences, and social media content
 */

import { invokeLLM } from "../_core/llm";
import { MarketerAgentOutput, EmailTemplate, SocialMediaPost, AgentResult } from "./types";

export async function marketerAgent(topic: string): Promise<AgentResult> {
  const startTime = Date.now();

  try {
    // Build marketing funnel
    const funnel = await buildMarketingFunnel(topic);

    // Create email sequence
    const emailSequence = await createEmailSequence(topic);

    // Generate social media posts
    const socialMedia = await generateSocialMediaPosts(topic);

    const output: MarketerAgentOutput = {
      funnel,
      emailSequence,
      socialMedia,
    };

    const duration = Date.now() - startTime;

    return {
      success: true,
      data: output,
      timestamp: Date.now(),
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error in Marketer Agent",
      timestamp: Date.now(),
      duration,
    };
  }
}

/**
 * Build a complete marketing funnel
 */
async function buildMarketingFunnel(topic: string): Promise<{
  landingPage: string;
  leadMagnet: string;
  salesPage: string;
  thankYouPage: string;
}> {
  const prompt = `You are a marketing funnel expert. Create a complete marketing funnel for a book about: ${topic}

Generate the following pages:
1. Landing Page - Headline, subheading, value proposition, CTA
2. Lead Magnet - Description of free resource to capture emails
3. Sales Page - Product benefits, testimonials, pricing, CTA
4. Thank You Page - Confirmation message, next steps

Return as JSON:
{
  "landingPage": "Complete landing page copy",
  "leadMagnet": "Lead magnet description",
  "salesPage": "Sales page copy",
  "thankYouPage": "Thank you page copy"
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a marketing funnel expert. Create high-converting sales funnels. Return JSON format.",
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

  return JSON.parse(jsonMatch[0]);
}

/**
 * Create an email sequence for the book
 */
async function createEmailSequence(topic: string): Promise<EmailTemplate[]> {
  const prompt = `You are an email marketing expert. Create a 5-email sequence for a book about: ${topic}

Each email should:
1. Have a compelling subject line
2. Provide value and build interest
3. Include a clear call-to-action
4. Be sent on specific days (Day 1, 3, 5, 7, 10)

Return as JSON array:
[
  {
    "subject": "Email subject",
    "body": "Email body copy",
    "callToAction": "CTA text",
    "day": 1
  }
]`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are an email marketing expert. Create engaging email sequences. Return JSON array.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const messageContent = response.choices[0]?.message?.content;
  const content = typeof messageContent === 'string' ? messageContent : '';
  
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Failed to extract JSON from LLM response");
  }

  return JSON.parse(jsonMatch[0]) as EmailTemplate[];
}

/**
 * Generate social media posts
 */
async function generateSocialMediaPosts(topic: string): Promise<SocialMediaPost[]> {
  const prompt = `You are a social media marketing expert. Create social media posts for a book about: ${topic}

Generate posts for:
1. Twitter - 280 characters max, engaging hook
2. Facebook - Longer form, storytelling
3. Instagram - Visual description, hashtags
4. LinkedIn - Professional angle, insights

Each post should include relevant hashtags and be platform-appropriate.

Return as JSON array:
[
  {
    "platform": "twitter|facebook|instagram|linkedin",
    "content": "Post content",
    "hashtags": ["#hashtag1", "#hashtag2"],
    "imagePrompt": "Description for image generation"
  }
]`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a social media marketing expert. Create engaging social media posts. Return JSON array.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const messageContent = response.choices[0]?.message?.content;
  const content = typeof messageContent === 'string' ? messageContent : '';
  
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Failed to extract JSON from LLM response");
  }

  return JSON.parse(jsonMatch[0]) as SocialMediaPost[];
}

/**
 * Generate book launch strategy
 */
export async function generateLaunchStrategy(
  bookTitle: string,
  targetAudience: string,
  launchDate: string
): Promise<AgentResult> {
  const startTime = Date.now();

  try {
    const prompt = `You are a book launch strategist. Create a comprehensive launch strategy for:

Book Title: ${bookTitle}
Target Audience: ${targetAudience}
Launch Date: ${launchDate}

Include:
1. Pre-launch activities (weeks before)
2. Launch day activities
3. Post-launch activities
4. Key metrics to track
5. Budget allocation

Return as JSON:
{
  "prelaunch": ["Activity 1", "Activity 2"],
  "launchDay": ["Activity 1", "Activity 2"],
  "postlaunch": ["Activity 1", "Activity 2"],
  "metrics": ["Metric 1", "Metric 2"],
  "budget": { "advertising": 500, "content": 300 }
}`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a book launch strategist. Create comprehensive launch strategies. Return JSON.",
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

    const strategy = JSON.parse(jsonMatch[0]);
    const duration = Date.now() - startTime;

    return {
      success: true,
      data: strategy,
      timestamp: Date.now(),
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error generating launch strategy",
      timestamp: Date.now(),
      duration,
    };
  }
}

/**
 * Generate book description for marketing
 */
export async function generateBookDescription(
  bookTitle: string,
  genre: string,
  keyThemes: string[]
): Promise<AgentResult> {
  const startTime = Date.now();

  try {
    const prompt = `You are a book marketing copywriter. Write compelling book descriptions for marketing.

Book Title: ${bookTitle}
Genre: ${genre}
Key Themes: ${keyThemes.join(', ')}

Create:
1. Short description (50 words) - For social media
2. Medium description (150 words) - For book sites
3. Long description (300 words) - For detailed marketing
4. Hook/tagline (10 words) - For headlines

Return as JSON:
{
  "short": "50-word description",
  "medium": "150-word description",
  "long": "300-word description",
  "hook": "10-word hook"
}`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a book marketing copywriter. Write compelling descriptions. Return JSON.",
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

    const description = JSON.parse(jsonMatch[0]);
    const duration = Date.now() - startTime;

    return {
      success: true,
      data: description,
      timestamp: Date.now(),
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error generating book description",
      timestamp: Date.now(),
      duration,
    };
  }
}
