/**
 * Publisher Agent
 * Formats content and exports to KDP-compliant format
 */

import { PublisherAgentOutput, AgentResult } from "./types";

export async function publisherAgent(content: string): Promise<AgentResult> {
  const startTime = Date.now();

  try {
    // Format the content
    const formatted = await formatBook(content);

    // Export to KDP format
    const kdpExport = await exportKDP(formatted);

    const output: PublisherAgentOutput = {
      formatted: {
        content: formatted,
        metadata: {
          formatted: true,
          timestamp: new Date().toISOString(),
        },
        pages: estimatePageCount(formatted),
      },
      kdpExport: {
        pdfUrl: kdpExport.url,
        metadata: kdpExport.metadata,
        validated: kdpExport.validated,
      },
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
      error: error instanceof Error ? error.message : "Unknown error in Publisher Agent",
      timestamp: Date.now(),
      duration,
    };
  }
}

/**
 * Format book content for publishing
 * Applies standard formatting, margins, fonts, etc.
 */
async function formatBook(content: string): Promise<string> {
  // Apply standard formatting
  const formatted = content
    // Normalize line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    // Add proper spacing
    .split('\n\n')
    .map((para) => {
      // Indent paragraphs
      return '  ' + para.trim();
    })
    .join('\n\n')
    // Add chapter breaks
    .replace(/^(Chapter \d+:|#.*?)$/gm, '\n\n---\n\n$1\n\n');

  return formatted;
}

/**
 * Export to KDP-compliant format
 */
async function exportKDP(content: string): Promise<{
  url: string;
  metadata: Record<string, any>;
  validated: boolean;
}> {
  // Validate KDP requirements
  const validation = validateKDPRequirements(content);

  if (!validation.valid) {
    throw new Error(`KDP validation failed: ${validation.errors.join(', ')}`);
  }

  // Create KDP metadata
  const metadata = {
    format: 'PDF',
    kdpCompliant: true,
    pageCount: estimatePageCount(content),
    wordCount: content.split(/\s+/).length,
    margins: {
      top: 0.5,
      bottom: 0.5,
      left: 0.75,
      right: 0.75,
    },
    paperSize: '6x9',
    validated: true,
    timestamp: new Date().toISOString(),
  };

  // Simulate PDF URL generation
  // In real implementation, this would generate actual PDF
  const pdfUrl = `https://cdn.example.com/kdp/${Date.now()}.pdf`;

  return {
    url: pdfUrl,
    metadata,
    validated: true,
  };
}

/**
 * Validate KDP requirements
 */
function validateKDPRequirements(content: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const wordCount = content.split(/\s+/).length;
  const pageCount = estimatePageCount(content);

  // Check word count (minimum 1000 words)
  if (wordCount < 1000) {
    errors.push(`Minimum 1000 words required (current: ${wordCount})`);
  }

  // Check page count (minimum 24 pages for KDP)
  if (pageCount < 24) {
    errors.push(`Minimum 24 pages required (current: ${pageCount})`);
  }

  // Check page count (maximum 800 pages)
  if (pageCount > 800) {
    errors.push(`Maximum 800 pages allowed (current: ${pageCount})`);
  }

  // Check for required sections
  if (!content.toLowerCase().includes('chapter')) {
    errors.push('Book must contain at least one chapter');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Estimate page count based on word count
 * Assumes ~250 words per page
 */
function estimatePageCount(content: string): number {
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / 250);
}

/**
 * Generate KDP metadata
 */
export async function generateKDPMetadata(
  title: string,
  author: string,
  description: string,
  isbn: string,
  categories: string[]
): Promise<AgentResult> {
  const startTime = Date.now();

  try {
    const metadata = {
      title: title.substring(0, 255), // KDP title limit
      author: author.substring(0, 100), // KDP author limit
      description: description.substring(0, 4000), // KDP description limit
      isbn,
      categories: categories.slice(0, 3), // KDP category limit
      language: 'English',
      publicationDate: new Date().toISOString().split('T')[0],
      copyrightYear: new Date().getFullYear(),
      kdpCompliant: true,
    };

    const duration = Date.now() - startTime;

    return {
      success: true,
      data: metadata,
      timestamp: Date.now(),
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error generating KDP metadata",
      timestamp: Date.now(),
      duration,
    };
  }
}

/**
 * Validate ISBN
 */
export function validateISBN(isbn: string): boolean {
  // Remove hyphens and spaces
  const cleanISBN = isbn.replace(/[-\s]/g, '');

  // Check ISBN-10
  if (cleanISBN.length === 10) {
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      const digit = parseInt(cleanISBN[i], 10);
      if (isNaN(digit)) return false;
      sum += digit * (10 - i);
    }
    return sum % 11 === 0;
  }

  // Check ISBN-13
  if (cleanISBN.length === 13) {
    let sum = 0;
    for (let i = 0; i < 13; i++) {
      const digit = parseInt(cleanISBN[i], 10);
      if (isNaN(digit)) return false;
      sum += digit * (i % 2 === 0 ? 1 : 3);
    }
    return sum % 10 === 0;
  }

  return false;
}
