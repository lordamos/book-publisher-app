/**
 * Tests for Cover Templates Module
 */

import { describe, it, expect } from 'vitest';
import {
  getTemplate,
  getAllTemplates,
  getTemplatesByCategory,
  getTemplatesByStyle,
  validateCustomization,
  COVER_TEMPLATES
} from './cover-templates';

describe('Cover Templates', () => {
  describe('Template Library', () => {
    it('should have predefined templates', () => {
      const templates = getAllTemplates();
      expect(templates.length).toBeGreaterThan(0);
      expect(templates.length).toBeGreaterThanOrEqual(5);
    });

    it('should have all required template properties', () => {
      const templates = getAllTemplates();
      templates.forEach(template => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('category');
        expect(template).toHaveProperty('style');
        expect(template).toHaveProperty('width');
        expect(template).toHaveProperty('height');
        expect(template).toHaveProperty('backgroundColor');
        expect(template).toHaveProperty('fields');
        expect(template.width).toBe(1000);
        expect(template.height).toBe(1600);
        expect(Array.isArray(template.fields)).toBe(true);
      });
    });

    it('should have all field types', () => {
      const templates = getAllTemplates();
      const allFields = templates.flatMap(t => t.fields);
      const fieldTypes = new Set(allFields.map(f => f.type));
      
      expect(fieldTypes.has('text')).toBe(true);
      expect(fieldTypes.has('shape')).toBe(true);
    });
  });

  describe('getTemplate', () => {
    it('should retrieve template by ID', () => {
      const template = getTemplate('modern-gradient');
      expect(template).toBeDefined();
      expect(template?.id).toBe('modern-gradient');
      expect(template?.name).toBe('Modern Gradient');
    });

    it('should return undefined for non-existent template', () => {
      const template = getTemplate('non-existent-template');
      expect(template).toBeUndefined();
    });

    it('should retrieve all predefined templates', () => {
      const templateIds = ['modern-gradient', 'classic-elegant', 'minimalist-clean', 'artistic-bold', 'professional-corporate', 'romance-elegant'];
      
      templateIds.forEach(id => {
        const template = getTemplate(id);
        expect(template).toBeDefined();
        expect(template?.id).toBe(id);
      });
    });
  });

  describe('getTemplatesByCategory', () => {
    it('should filter templates by category', () => {
      const fictionTemplates = getTemplatesByCategory('fiction');
      expect(fictionTemplates.length).toBeGreaterThan(0);
      fictionTemplates.forEach(t => {
        expect(t.category).toBe('fiction');
      });
    });

    it('should return empty array for category with no templates', () => {
      const templates = getTemplatesByCategory('children');
      expect(Array.isArray(templates)).toBe(true);
    });

    it('should support all categories', () => {
      const categories = ['fiction', 'nonfiction', 'educational', 'children', 'business', 'romance', 'mystery', 'sci-fi'] as const;
      
      categories.forEach(category => {
        const templates = getTemplatesByCategory(category);
        expect(Array.isArray(templates)).toBe(true);
      });
    });
  });

  describe('getTemplatesByStyle', () => {
    it('should filter templates by style', () => {
      const modernTemplates = getTemplatesByStyle('modern');
      expect(modernTemplates.length).toBeGreaterThan(0);
      modernTemplates.forEach(t => {
        expect(t.style).toBe('modern');
      });
    });

    it('should support all styles', () => {
      const styles = ['modern', 'classic', 'minimalist', 'artistic', 'professional'] as const;
      
      styles.forEach(style => {
        const templates = getTemplatesByStyle(style);
        expect(Array.isArray(templates)).toBe(true);
      });
    });
  });

  describe('validateCustomization', () => {
    it('should validate correct customization', () => {
      const customization = {
        templateId: 'modern-gradient',
        title: 'My Book Title',
        author: 'John Doe'
      };

      const result = validateCustomization(customization);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty title', () => {
      const customization = {
        templateId: 'modern-gradient',
        title: '',
        author: 'John Doe'
      };

      const result = validateCustomization(customization);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Title'))).toBe(true);
    });

    it('should reject empty author', () => {
      const customization = {
        templateId: 'modern-gradient',
        title: 'My Book Title',
        author: ''
      };

      const result = validateCustomization(customization);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Author'))).toBe(true);
    });

    it('should reject title exceeding max length', () => {
      const customization = {
        templateId: 'modern-gradient',
        title: 'A'.repeat(201),
        author: 'John Doe'
      };

      const result = validateCustomization(customization);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Title'))).toBe(true);
    });

    it('should reject author exceeding max length', () => {
      const customization = {
        templateId: 'modern-gradient',
        title: 'My Book Title',
        author: 'A'.repeat(101)
      };

      const result = validateCustomization(customization);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Author'))).toBe(true);
    });

    it('should accept valid ISBN', () => {
      const customization = {
        templateId: 'modern-gradient',
        title: 'My Book Title',
        author: 'John Doe',
        isbn: '978-0-123456-78-9'
      };

      const result = validateCustomization(customization);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid ISBN', () => {
      const customization = {
        templateId: 'modern-gradient',
        title: 'My Book Title',
        author: 'John Doe',
        isbn: 'invalid-isbn'
      };

      const result = validateCustomization(customization);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('ISBN'))).toBe(true);
    });

    it('should accept optional ISBN', () => {
      const customization = {
        templateId: 'modern-gradient',
        title: 'My Book Title',
        author: 'John Doe'
      };

      const result = validateCustomization(customization);
      expect(result.valid).toBe(true);
    });

    it('should accept optional subtitle and tagline', () => {
      const customization = {
        templateId: 'modern-gradient',
        title: 'My Book Title',
        author: 'John Doe',
        subtitle: 'A Subtitle',
        tagline: 'A Tagline'
      };

      const result = validateCustomization(customization);
      expect(result.valid).toBe(true);
    });
  });

  describe('Template Fields', () => {
    it('should have text fields with proper configuration', () => {
      const template = getTemplate('modern-gradient');
      expect(template).toBeDefined();
      
      const textFields = template!.fields.filter(f => f.type === 'text');
      expect(textFields.length).toBeGreaterThan(0);
      
      textFields.forEach(field => {
        if (field.type === 'text') {
          expect(field).toHaveProperty('fontSize');
          expect(field).toHaveProperty('fontFamily');
          expect(field).toHaveProperty('color');
          expect(field).toHaveProperty('x');
          expect(field).toHaveProperty('y');
          expect(field).toHaveProperty('width');
          expect(field).toHaveProperty('height');
          expect(field.fontSize).toBeGreaterThan(0);
        }
      });
    });

    it('should have shape fields with proper configuration', () => {
      const template = getTemplate('classic-elegant');
      expect(template).toBeDefined();
      
      const shapeFields = template!.fields.filter(f => f.type === 'shape');
      expect(shapeFields.length).toBeGreaterThan(0);
      
      shapeFields.forEach(field => {
        if (field.type === 'shape') {
          expect(field).toHaveProperty('shape');
          expect(field).toHaveProperty('fill');
          expect(['rectangle', 'circle', 'gradient']).toContain(field.shape);
        }
      });
    });

    it('should have valid field positions', () => {
      const templates = getAllTemplates();
      
      templates.forEach(template => {
        template.fields.forEach(field => {
          expect(field.x).toBeGreaterThanOrEqual(0);
          expect(field.y).toBeGreaterThanOrEqual(0);
          expect(field.width).toBeGreaterThan(0);
          expect(field.height).toBeGreaterThan(0);
          expect(field.x + field.width).toBeLessThanOrEqual(template.width + 100);
          expect(field.y + field.height).toBeLessThanOrEqual(template.height + 100);
        });
      });
    });
  });

  describe('Template Metadata', () => {
    it('should have creation and update dates', () => {
      const templates = getAllTemplates();
      templates.forEach(template => {
        expect(template.createdAt).toBeInstanceOf(Date);
        expect(template.updatedAt).toBeInstanceOf(Date);
      });
    });

    it('should have author and version info', () => {
      const templates = getAllTemplates();
      templates.forEach(template => {
        expect(template.author).toBeDefined();
        expect(template.version).toBeDefined();
        expect(template.author.length).toBeGreaterThan(0);
        expect(template.version.length).toBeGreaterThan(0);
      });
    });
  });

  describe('COVER_TEMPLATES constant', () => {
    it('should be a non-empty object', () => {
      expect(COVER_TEMPLATES).toBeDefined();
      expect(typeof COVER_TEMPLATES).toBe('object');
      expect(Object.keys(COVER_TEMPLATES).length).toBeGreaterThan(0);
    });

    it('should have template IDs as keys', () => {
      Object.entries(COVER_TEMPLATES).forEach(([key, template]) => {
        expect(key).toBe(template.id);
      });
    });
  });
});
