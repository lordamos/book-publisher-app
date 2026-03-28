/**
 * Tests for Font Library Module
 */

import { describe, it, expect } from 'vitest';
import {
  getFont,
  getAllFonts,
  getFontsByCategory,
  getHeadingFonts,
  getBodyFonts,
  getFontPairsByStyle,
  getRecommendedFontPairs,
  getFontPairings,
  validateFontCustomization,
  getGoogleFontsImportUrl,
  getCssFontFamily,
  getFontCssVariables,
  getFontMetadata,
  FONT_LIBRARY,
  FONT_PAIRS
} from './font-library';

describe('Font Library', () => {
  describe('Font Collection', () => {
    it('should have predefined fonts', () => {
      const fonts = getAllFonts();
      expect(fonts.length).toBeGreaterThan(0);
      expect(fonts.length).toBeGreaterThanOrEqual(10);
    });

    it('should have all required font properties', () => {
      const fonts = getAllFonts();
      fonts.forEach(font => {
        expect(font).toHaveProperty('id');
        expect(font).toHaveProperty('name');
        expect(font).toHaveProperty('category');
        expect(font).toHaveProperty('weights');
        expect(font).toHaveProperty('styles');
        expect(font).toHaveProperty('description');
        expect(font).toHaveProperty('bestFor');
        expect(font).toHaveProperty('pairsWith');
        expect(font).toHaveProperty('fallback');
        expect(font).toHaveProperty('previewText');
        expect(Array.isArray(font.weights)).toBe(true);
        expect(Array.isArray(font.styles)).toBe(true);
        expect(Array.isArray(font.bestFor)).toBe(true);
        expect(Array.isArray(font.pairsWith)).toBe(true);
      });
    });

    it('should have font pairs', () => {
      expect(FONT_PAIRS.length).toBeGreaterThan(0);
      FONT_PAIRS.forEach(pair => {
        expect(pair).toHaveProperty('heading');
        expect(pair).toHaveProperty('body');
        expect(pair).toHaveProperty('description');
        expect(pair).toHaveProperty('style');
        expect(['classic', 'modern', 'elegant', 'bold', 'playful']).toContain(pair.style);
      });
    });
  });

  describe('getFont', () => {
    it('should retrieve font by ID', () => {
      const font = getFont('playfair-display');
      expect(font).toBeDefined();
      expect(font?.id).toBe('playfair-display');
      expect(font?.name).toBe('Playfair Display');
      expect(font?.category).toBe('serif');
    });

    it('should return undefined for non-existent font', () => {
      const font = getFont('non-existent-font');
      expect(font).toBeUndefined();
    });

    it('should retrieve all predefined fonts', () => {
      const fontIds = ['playfair-display', 'inter', 'lora', 'open-sans', 'montserrat', 'merriweather'];
      
      fontIds.forEach(id => {
        const font = getFont(id);
        expect(font).toBeDefined();
        expect(font?.id).toBe(id);
      });
    });
  });

  describe('getFontsByCategory', () => {
    it('should filter fonts by category', () => {
      const serifFonts = getFontsByCategory('serif');
      expect(serifFonts.length).toBeGreaterThan(0);
      serifFonts.forEach(f => {
        expect(f.category).toBe('serif');
      });
    });

    it('should support all categories', () => {
      const categories = ['serif', 'sans-serif', 'display', 'script', 'monospace'] as const;
      
      categories.forEach(category => {
        const fonts = getFontsByCategory(category);
        expect(Array.isArray(fonts)).toBe(true);
      });
    });
  });

  describe('getHeadingFonts', () => {
    it('should return fonts suitable for headings', () => {
      const fonts = getHeadingFonts();
      expect(fonts.length).toBeGreaterThan(0);
      fonts.forEach(f => {
        expect(['serif', 'display', 'script']).toContain(f.category);
      });
    });
  });

  describe('getBodyFonts', () => {
    it('should return fonts suitable for body text', () => {
      const fonts = getBodyFonts();
      expect(fonts.length).toBeGreaterThan(0);
      fonts.forEach(f => {
        expect(['serif', 'sans-serif']).toContain(f.category);
      });
    });
  });

  describe('getFontPairsByStyle', () => {
    it('should filter font pairs by style', () => {
      const classicPairs = getFontPairsByStyle('classic');
      expect(classicPairs.length).toBeGreaterThan(0);
      classicPairs.forEach(p => {
        expect(p.style).toBe('classic');
      });
    });

    it('should support all pair styles', () => {
      const styles = ['classic', 'modern', 'elegant', 'bold', 'playful'] as const;
      
      styles.forEach(style => {
        const pairs = getFontPairsByStyle(style);
        expect(Array.isArray(pairs)).toBe(true);
      });
    });
  });

  describe('getRecommendedFontPairs', () => {
    it('should return recommended font pairs', () => {
      const pairs = getRecommendedFontPairs(5);
      expect(pairs.length).toBeLessThanOrEqual(5);
      expect(pairs.length).toBeGreaterThan(0);
    });

    it('should return all pairs if count is high', () => {
      const pairs = getRecommendedFontPairs(1000);
      expect(pairs.length).toBeLessThanOrEqual(FONT_PAIRS.length);
    });
  });

  describe('getFontPairings', () => {
    it('should return fonts that pair well with a given font', () => {
      const pairings = getFontPairings('playfair-display');
      expect(Array.isArray(pairings)).toBe(true);
      expect(pairings.length).toBeGreaterThan(0);
    });

    it('should return empty array for non-existent font', () => {
      const pairings = getFontPairings('non-existent-font');
      expect(pairings).toEqual([]);
    });
  });

  describe('validateFontCustomization', () => {
    it('should validate correct customization', () => {
      const customization = {
        headingFont: 'playfair-display',
        bodyFont: 'inter',
        headingWeight: '700' as const,
        bodyWeight: '400' as const,
        headingStyle: 'normal' as const,
        bodyStyle: 'normal' as const
      };

      const result = validateFontCustomization(customization);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-existent heading font', () => {
      const customization = {
        headingFont: 'non-existent-font',
        bodyFont: 'inter',
        headingWeight: '700' as const,
        bodyWeight: '400' as const,
        headingStyle: 'normal' as const,
        bodyStyle: 'normal' as const
      };

      const result = validateFontCustomization(customization);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Heading font'))).toBe(true);
    });

    it('should reject non-existent body font', () => {
      const customization = {
        headingFont: 'playfair-display',
        bodyFont: 'non-existent-font',
        headingWeight: '700' as const,
        bodyWeight: '400' as const,
        headingStyle: 'normal' as const,
        bodyStyle: 'normal' as const
      };

      const result = validateFontCustomization(customization);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Body font'))).toBe(true);
    });

    it('should reject invalid font weight', () => {
      const customization = {
        headingFont: 'playfair-display',
        bodyFont: 'inter',
        headingWeight: '999' as any,
        bodyWeight: '400' as const,
        headingStyle: 'normal' as const,
        bodyStyle: 'normal' as const
      };

      const result = validateFontCustomization(customization);
      expect(result.valid).toBe(false);
    });
  });

  describe('getGoogleFontsImportUrl', () => {
    it('should generate Google Fonts import URL', () => {
      const url = getGoogleFontsImportUrl(['playfair-display', 'inter']);
      expect(url).toContain('fonts.googleapis.com');
      expect(url).toContain('Playfair+Display');
      expect(url).toContain('Inter');
    });

    it('should return empty string for empty font list', () => {
      const url = getGoogleFontsImportUrl([]);
      expect(url).toBe('');
    });

    it('should return empty string for non-existent fonts', () => {
      const url = getGoogleFontsImportUrl(['non-existent-font']);
      expect(url).toBe('');
    });
  });

  describe('getCssFontFamily', () => {
    it('should generate CSS font-family declaration', () => {
      const fontFamily = getCssFontFamily('playfair-display');
      expect(fontFamily).toContain('Playfair Display');
      expect(fontFamily).toContain('serif');
    });

    it('should use fallback for non-existent font', () => {
      const fontFamily = getCssFontFamily('non-existent-font');
      expect(fontFamily).toBe('sans-serif');
    });

    it('should include proper quotes and fallback', () => {
      const fontFamily = getCssFontFamily('inter');
      expect(fontFamily).toMatch(/^".*",/);
    });
  });

  describe('getFontCssVariables', () => {
    it('should generate CSS variables for font customization', () => {
      const customization = {
        headingFont: 'playfair-display',
        bodyFont: 'inter',
        headingWeight: '700' as const,
        bodyWeight: '400' as const,
        headingStyle: 'normal' as const,
        bodyStyle: 'normal' as const
      };

      const cssVars = getFontCssVariables(customization);
      expect(cssVars).toHaveProperty('--font-heading');
      expect(cssVars).toHaveProperty('--font-body');
      expect(cssVars).toHaveProperty('--font-heading-weight');
      expect(cssVars).toHaveProperty('--font-body-weight');
      expect(cssVars).toHaveProperty('--font-heading-style');
      expect(cssVars).toHaveProperty('--font-body-style');
      expect(cssVars['--font-heading-weight']).toBe('700');
      expect(cssVars['--font-body-weight']).toBe('400');
    });
  });

  describe('getFontMetadata', () => {
    it('should return complete font metadata', () => {
      const metadata = getFontMetadata();
      expect(metadata).toHaveProperty('fonts');
      expect(metadata).toHaveProperty('pairs');
      expect(metadata).toHaveProperty('categories');
      expect(Array.isArray(metadata.fonts)).toBe(true);
      expect(Array.isArray(metadata.pairs)).toBe(true);
      expect(Array.isArray(metadata.categories)).toBe(true);
    });

    it('should include all font categories', () => {
      const metadata = getFontMetadata();
      expect(metadata.categories).toContain('serif');
      expect(metadata.categories).toContain('sans-serif');
      expect(metadata.categories).toContain('display');
      expect(metadata.categories).toContain('script');
      expect(metadata.categories).toContain('monospace');
    });
  });

  describe('FONT_LIBRARY constant', () => {
    it('should be a non-empty object', () => {
      expect(FONT_LIBRARY).toBeDefined();
      expect(typeof FONT_LIBRARY).toBe('object');
      expect(Object.keys(FONT_LIBRARY).length).toBeGreaterThan(0);
    });

    it('should have font IDs as keys', () => {
      Object.entries(FONT_LIBRARY).forEach(([key, font]) => {
        expect(key).toBe(font.id);
      });
    });
  });

  describe('Font Weights and Styles', () => {
    it('should have valid weights for all fonts', () => {
      const fonts = getAllFonts();
      fonts.forEach(font => {
        expect(font.weights.length).toBeGreaterThan(0);
        font.weights.forEach(weight => {
          expect(['400', '600', '700', 'normal', 'semibold', 'bold']).toContain(weight);
        });
      });
    });

    it('should have valid styles for all fonts', () => {
      const fonts = getAllFonts();
      fonts.forEach(font => {
        expect(font.styles.length).toBeGreaterThan(0);
        font.styles.forEach(style => {
          expect(['normal', 'italic']).toContain(style);
        });
      });
    });
  });
});
