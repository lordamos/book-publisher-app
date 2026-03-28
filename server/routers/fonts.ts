/**
 * Fonts tRPC Router
 */

import { publicProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import {
  getAllFonts,
  getFont,
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
  FontCustomization
} from '../font-library';

/**
 * Font customization schema
 */
const FontCustomizationSchema = z.object({
  headingFont: z.string().min(1, 'Heading font is required'),
  bodyFont: z.string().min(1, 'Body font is required'),
  headingWeight: z.enum(['400', '600', '700', 'normal', 'semibold', 'bold'] as const).default('700'),
  bodyWeight: z.enum(['400', '600', '700', 'normal', 'semibold', 'bold'] as const).default('400'),
  headingStyle: z.enum(['normal', 'italic'] as const).default('normal'),
  bodyStyle: z.enum(['normal', 'italic'] as const).default('normal')
});

export const fontsRouter = router({
  /**
   * Get all available fonts
   */
  listFonts: publicProcedure
    .query(() => {
      const fonts = getAllFonts();
      return {
        success: true,
        count: fonts.length,
        fonts: fonts.map(f => ({
          id: f.id,
          name: f.name,
          category: f.category,
          description: f.description,
          bestFor: f.bestFor,
          previewText: f.previewText
        }))
      };
    }),

  /**
   * Get font by ID
   */
  getFont: publicProcedure
    .input(z.object({ fontId: z.string() }))
    .query(({ input }) => {
      const font = getFont(input.fontId);
      if (!font) {
        return {
          success: false,
          error: `Font not found: ${input.fontId}`
        };
      }

      return {
        success: true,
        font: {
          id: font.id,
          name: font.name,
          category: font.category,
          description: font.description,
          bestFor: font.bestFor,
          weights: font.weights,
          styles: font.styles,
          previewText: font.previewText
        }
      };
    }),

  /**
   * Get fonts suitable for headings
   */
  getHeadingFonts: publicProcedure
    .query(() => {
      const fonts = getHeadingFonts();
      return {
        success: true,
        count: fonts.length,
        fonts: fonts.map(f => ({
          id: f.id,
          name: f.name,
          category: f.category,
          description: f.description
        }))
      };
    }),

  /**
   * Get fonts suitable for body text
   */
  getBodyFonts: publicProcedure
    .query(() => {
      const fonts = getBodyFonts();
      return {
        success: true,
        count: fonts.length,
        fonts: fonts.map(f => ({
          id: f.id,
          name: f.name,
          category: f.category,
          description: f.description
        }))
      };
    }),

  /**
   * Get font pair suggestions
   */
  getFontPairs: publicProcedure
    .input(z.object({
      style: z.enum(['classic', 'modern', 'elegant', 'bold', 'playful'] as const).optional()
    }))
    .query(({ input }) => {
      const pairs = input.style
        ? getFontPairsByStyle(input.style)
        : getRecommendedFontPairs(10);

      return {
        success: true,
        count: pairs.length,
        pairs: pairs.map(p => ({
          heading: p.heading,
          body: p.body,
          description: p.description,
          style: p.style
        }))
      };
    }),

  /**
   * Get font pairings for a specific font
   */
  getFontPairings: publicProcedure
    .input(z.object({ fontId: z.string() }))
    .query(({ input }) => {
      const font = getFont(input.fontId);
      if (!font) {
        return {
          success: false,
          error: `Font not found: ${input.fontId}`
        };
      }

      const pairingIds = getFontPairings(input.fontId);
      const pairingFonts = pairingIds
        .map(id => getFont(id))
        .filter((f): f is typeof font => !!f);

      return {
        success: true,
        font: {
          id: font.id,
          name: font.name,
          category: font.category
        },
        pairings: pairingFonts.map(f => ({
          id: f.id,
          name: f.name,
          category: f.category
        }))
      };
    }),

  /**
   * Validate font customization
   */
  validateFontCustomization: publicProcedure
    .input(FontCustomizationSchema)
    .query(({ input }) => {
      const validation = validateFontCustomization(input as FontCustomization);
      return {
        valid: validation.valid,
        errors: validation.errors
      };
    }),

  /**
   * Get font CSS variables
   */
  getFontCssVariables: publicProcedure
    .input(FontCustomizationSchema)
    .query(({ input }) => {
      const validation = validateFontCustomization(input as FontCustomization);
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      const cssVars = getFontCssVariables(input as FontCustomization);
      return {
        success: true,
        cssVariables: cssVars
      };
    }),

  /**
   * Get Google Fonts import URL
   */
  getGoogleFontsUrl: publicProcedure
    .input(z.object({
      fontIds: z.array(z.string())
    }))
    .query(({ input }) => {
      const url = getGoogleFontsImportUrl(input.fontIds);
      return {
        success: true,
        url: url || undefined
      };
    }),

  /**
   * Get font metadata
   */
  getFontMetadata: publicProcedure
    .query(() => {
      const metadata = getFontMetadata();
      return {
        success: true,
        metadata
      };
    })
});
