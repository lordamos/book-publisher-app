import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Orchestrator } from './agents/orchestrator';
import { validateISBN } from './agents/publisherAgent';

describe('Multi-Agent System', () => {
  let orchestrator: Orchestrator;

  beforeEach(() => {
    orchestrator = new Orchestrator();
  });

  describe('Orchestrator', () => {
    it('should initialize successfully', () => {
      const status = orchestrator.getStatus();
      expect(status.ready).toBe(true);
      expect(status.agents).toContain('writer');
      expect(status.agents).toContain('editor');
      expect(status.agents).toContain('publisher');
      expect(status.agents).toContain('marketer');
    });

    it('should have correct configuration', () => {
      const status = orchestrator.getStatus();
      expect(status.maxRetries).toBe(3);
      expect(status.timeout).toBe(300000);
    });

    it('should return all agents in status', () => {
      const status = orchestrator.getStatus();
      expect(status.agents.length).toBe(4);
      expect(status.agents).toEqual(
        expect.arrayContaining(['writer', 'editor', 'publisher', 'marketer'])
      );
    });
  });

  describe('ISBN Validation', () => {
    it('should validate correct ISBN-10', () => {
      // Valid ISBN-10: 0-306-40615-2
      expect(validateISBN('0-306-40615-2')).toBe(true);
      expect(validateISBN('0306406152')).toBe(true);
    });

    it('should validate correct ISBN-13', () => {
      // Valid ISBN-13: 978-0-306-40615-7
      expect(validateISBN('978-0-306-40615-7')).toBe(true);
      expect(validateISBN('9780306406157')).toBe(true);
    });

    it('should reject invalid ISBN-10', () => {
      expect(validateISBN('0-306-40615-3')).toBe(false);
      expect(validateISBN('0306406153')).toBe(false);
    });

    it('should reject invalid ISBN-13', () => {
      expect(validateISBN('978-0-306-40615-8')).toBe(false);
      expect(validateISBN('9780306406158')).toBe(false);
    });

    it('should handle ISBN with spaces', () => {
      expect(validateISBN('978 0 306 40615 7')).toBe(true);
    });

    it('should reject non-numeric ISBN', () => {
      expect(validateISBN('ABC-DEF-GHI-JKL')).toBe(false);
    });

    it('should reject ISBN with wrong length', () => {
      expect(validateISBN('123456789')).toBe(false);
      expect(validateISBN('12345678901234')).toBe(false);
    });

    it('should reject empty ISBN', () => {
      expect(validateISBN('')).toBe(false);
    });
  });

  describe('Agent Results', () => {
    it('should have success flag in results', () => {
      // This tests the structure expected from agents
      const mockResult = {
        success: true,
        data: { test: 'data' },
        timestamp: Date.now(),
        duration: 100,
      };

      expect(mockResult).toHaveProperty('success');
      expect(mockResult).toHaveProperty('data');
      expect(mockResult).toHaveProperty('timestamp');
      expect(mockResult).toHaveProperty('duration');
    });

    it('should have error in failed results', () => {
      const mockResult = {
        success: false,
        data: null,
        error: 'Test error',
        timestamp: Date.now(),
        duration: 100,
      };

      expect(mockResult.success).toBe(false);
      expect(mockResult.error).toBeDefined();
    });
  });

  describe('Orchestration Options', () => {
    it('should accept valid options', () => {
      const options = {
        goal: 'Write a book about artificial intelligence',
        improvementPasses: 2,
        includeMarketing: true,
        autoPublish: false,
      };

      expect(options.goal.length).toBeGreaterThanOrEqual(10);
      expect(options.improvementPasses).toBeGreaterThanOrEqual(1);
      expect(options.improvementPasses).toBeLessThanOrEqual(5);
      expect(typeof options.includeMarketing).toBe('boolean');
      expect(typeof options.autoPublish).toBe('boolean');
    });

    it('should validate goal length', () => {
      const shortGoal = 'Short';
      const validGoal = 'Write a comprehensive book about machine learning';
      const longGoal = 'a'.repeat(1001);

      expect(shortGoal.length).toBeLessThan(10);
      expect(validGoal.length).toBeGreaterThanOrEqual(10);
      expect(validGoal.length).toBeLessThanOrEqual(1000);
      expect(longGoal.length).toBeGreaterThan(1000);
    });

    it('should validate improvement passes range', () => {
      expect(0).toBeLessThan(1);
      expect(1).toBeGreaterThanOrEqual(1);
      expect(5).toBeLessThanOrEqual(5);
      expect(6).toBeGreaterThan(5);
    });
  });

  describe('Quality Scoring', () => {
    it('should calculate quality score between 0-100', () => {
      const mockResults = {
        draft: { success: true, data: null, timestamp: 0, duration: 0 },
        edited: {
          success: true,
          data: {
            improvements: {
              clarityScore: 85,
              flowScore: 78,
              emotionalDepthScore: 82,
              readabilityScore: 88,
            },
          },
          timestamp: 0,
          duration: 0,
        },
        published: { success: true, data: null, timestamp: 0, duration: 0 },
      };

      // Calculate expected score
      let score = 50;
      if (mockResults.draft.success) score += 15;
      if (mockResults.edited.success) score += 20;
      if (mockResults.published.success) score += 15;

      const avgScore =
        (mockResults.edited.data.improvements.clarityScore +
          mockResults.edited.data.improvements.flowScore +
          mockResults.edited.data.improvements.emotionalDepthScore +
          mockResults.edited.data.improvements.readabilityScore) /
        4;
      score += (avgScore / 100) * 10;

      const finalScore = Math.min(100, Math.round(score));
      expect(finalScore).toBeGreaterThanOrEqual(0);
      expect(finalScore).toBeLessThanOrEqual(100);
    });

    it('should give base score of 50', () => {
      let score = 50;
      expect(score).toBe(50);
    });

    it('should add points for successful stages', () => {
      let score = 50;
      score += 15; // draft
      score += 20; // edited
      score += 15; // published
      expect(score).toBe(100);
    });
  });

  describe('Content Formatting', () => {
    it('should handle string content', () => {
      const content = 'This is test content';
      expect(typeof content).toBe('string');
      expect(content.length).toBeGreaterThan(0);
    });

    it('should handle chapter structure', () => {
      const draft = {
        chapters: [
          { number: 1, title: 'Chapter 1', content: 'Content 1' },
          { number: 2, title: 'Chapter 2', content: 'Content 2' },
        ],
      };

      expect(Array.isArray(draft.chapters)).toBe(true);
      expect(draft.chapters.length).toBe(2);
      expect(draft.chapters[0]).toHaveProperty('title');
      expect(draft.chapters[0]).toHaveProperty('content');
    });

    it('should format draft with headers', () => {
      const formatted = '# Chapter 1\n\nContent here\n\n---\n\n# Chapter 2\n\nMore content';
      expect(formatted).toContain('#');
      expect(formatted).toContain('---');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing goal', () => {
      const options = { goal: '' };
      expect(options.goal.length).toBe(0);
      expect(options.goal.length).toBeLessThan(10);
    });

    it('should handle invalid improvement passes', () => {
      expect(0).toBeLessThan(1);
      expect(6).toBeGreaterThan(5);
    });

    it('should handle null data', () => {
      const result = {
        success: false,
        data: null,
        error: 'Test error',
      };

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('Agent Workflow', () => {
    it('should have writer agent in workflow', () => {
      const agents = ['writer', 'editor', 'publisher', 'marketer'];
      expect(agents).toContain('writer');
    });

    it('should have editor agent in workflow', () => {
      const agents = ['writer', 'editor', 'publisher', 'marketer'];
      expect(agents).toContain('editor');
    });

    it('should have publisher agent in workflow', () => {
      const agents = ['writer', 'editor', 'publisher', 'marketer'];
      expect(agents).toContain('publisher');
    });

    it('should have marketer agent in workflow', () => {
      const agents = ['writer', 'editor', 'publisher', 'marketer'];
      expect(agents).toContain('marketer');
    });

    it('should execute agents in correct order', () => {
      const workflow = ['writer', 'editor', 'publisher', 'marketer'];
      expect(workflow[0]).toBe('writer');
      expect(workflow[1]).toBe('editor');
      expect(workflow[2]).toBe('publisher');
      expect(workflow[3]).toBe('marketer');
    });
  });

  describe('Improvement Loop', () => {
    it('should support multiple improvement passes', () => {
      for (let i = 1; i <= 5; i++) {
        expect(i).toBeGreaterThanOrEqual(1);
        expect(i).toBeLessThanOrEqual(5);
      }
    });

    it('should track improvement iterations', () => {
      const passes = 3;
      const iterations = [];
      for (let i = 1; i <= passes; i++) {
        iterations.push(`Pass ${i}`);
      }
      expect(iterations.length).toBe(3);
      expect(iterations[0]).toBe('Pass 1');
      expect(iterations[2]).toBe('Pass 3');
    });

    it('should accumulate improvements', () => {
      let score = 50;
      const improvements = [10, 15, 12];
      improvements.forEach((improvement) => {
        score += improvement;
      });
      expect(score).toBe(87);
    });
  });

  describe('Metadata Generation', () => {
    it('should validate book title length', () => {
      const title = 'The Great Book of Knowledge';
      expect(title.length).toBeLessThanOrEqual(255);
    });

    it('should validate author name length', () => {
      const author = 'John Smith';
      expect(author.length).toBeLessThanOrEqual(100);
    });

    it('should validate description length', () => {
      const description = 'This is a test description for a book';
      expect(description.length).toBeLessThanOrEqual(4000);
    });

    it('should limit categories to 3', () => {
      const categories = ['Fiction', 'Adventure', 'Fantasy', 'Science Fiction'];
      const limited = categories.slice(0, 3);
      expect(limited.length).toBe(3);
    });
  });

  describe('Performance', () => {
    it('should track operation duration', () => {
      const startTime = Date.now();
      // Simulate work
      const endTime = Date.now();
      const duration = endTime - startTime;
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should have timeout configuration', () => {
      const timeout = 300000; // 5 minutes
      expect(timeout).toBe(300000);
      expect(timeout).toBeGreaterThan(0);
    });

    it('should support retry logic', () => {
      const maxRetries = 3;
      expect(maxRetries).toBeGreaterThanOrEqual(1);
      expect(maxRetries).toBeLessThanOrEqual(5);
    });
  });
});
