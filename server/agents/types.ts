/**
 * Multi-Agent System Types
 * Defines interfaces and types for the orchestration system
 */

export interface AgentResult {
  success: boolean;
  data: any;
  error?: string;
  timestamp: number;
  duration: number;
}

export interface WriterAgentOutput {
  title: string;
  chapters: Chapter[];
  metadata: {
    wordCount: number;
    estimatedReadTime: number;
    tone: string;
  };
}

export interface Chapter {
  number: number;
  title: string;
  content: string;
  wordCount: number;
}

export interface EditorAgentOutput {
  improvedContent: string;
  suggestions: Suggestion[];
  improvements: {
    clarityScore: number;
    flowScore: number;
    emotionalDepthScore: number;
    readabilityScore: number;
  };
}

export interface Suggestion {
  type: 'clarity' | 'flow' | 'emotion' | 'grammar' | 'style';
  location: string;
  original: string;
  suggested: string;
  reason: string;
  confidence: number;
}

export interface PublisherAgentOutput {
  formatted: {
    content: string;
    metadata: Record<string, any>;
    pages: number;
  };
  kdpExport: {
    pdfUrl: string;
    metadata: Record<string, any>;
    validated: boolean;
  };
}

export interface MarketerAgentOutput {
  funnel: {
    landingPage: string;
    leadMagnet: string;
    salesPage: string;
    thankYouPage: string;
  };
  emailSequence: EmailTemplate[];
  socialMedia: SocialMediaPost[];
}

export interface EmailTemplate {
  subject: string;
  body: string;
  callToAction: string;
  day: number;
}

export interface SocialMediaPost {
  platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin';
  content: string;
  hashtags: string[];
  imagePrompt?: string;
}

export interface OrchestrationResult {
  goal: string;
  draft: WriterAgentOutput;
  edited: EditorAgentOutput;
  published: PublisherAgentOutput;
  marketing: MarketerAgentOutput;
  totalDuration: number;
  qualityScore: number;
}

export interface AgentConfig {
  maxRetries: number;
  timeout: number;
  temperature: number;
  maxTokens: number;
}

export interface CritiqueResult {
  originalScore: number;
  improvedScore: number;
  improvements: string[];
  content: string;
}

export interface MultiAgentOptions {
  goal: string;
  improvementPasses?: number;
  includeMarketing?: boolean;
  autoPublish?: boolean;
}
