/**
 * Cover Templates tRPC Router
 */

import { publicProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import {
  getTemplate,
  getAllTemplates,
  getTemplatesByCategory,
  getTemplatesByStyle,
  validateCustomization,
  COVER_TEMPLATES
} from '../cover-templates';
import {
  renderTemplateToSVG,
  svgToJpeg,
  svgToPng,
  generateCoverPreviews,
  validateSvgContent
} from '../cover-template-engine';
import { storagePut } from '../storage';

/**
 * Customization schema for validation
 */
const CustomizationSchema = z.object({
  templateId: z.string().min(1, 'Template ID is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  author: z.string().min(1, 'Author is required').max(100, 'Author must be less than 100 characters'),
  isbn: z.string().regex(/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[X0-9]$/, 'Invalid ISBN format').optional(),
  subtitle: z.string().optional(),
  tagline: z.string().optional(),
  customColors: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
    accent: z.string().optional()
  }).optional(),
  customFonts: z.object({
    heading: z.string().optional(),
    body: z.string().optional()
  }).optional(),
  coverImage: z.string().optional(),
  additionalFields: z.record(z.string(), z.any()).optional()
});

export const coverTemplatesRouter = router({
  /**
   * Get all available templates
   */
  listTemplates: publicProcedure
    .query(async () => {
      const templates = getAllTemplates();
      return {
        success: true,
        count: templates.length,
        templates: templates.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description,
          category: t.category,
          style: t.style,
          previewImage: t.previewImage
        }))
      };
    }),

  /**
   * Get template by ID
   */
  getTemplate: publicProcedure
    .input(z.object({ templateId: z.string() }))
    .query(async ({ input }) => {
      const template = getTemplate(input.templateId);

      if (!template) {
        return {
          success: false,
          error: `Template not found: ${input.templateId}`
        };
      }

      return {
        success: true,
        template
      };
    }),

  /**
   * Get templates by category
   */
  getTemplatesByCategory: publicProcedure
    .input(z.object({
      category: z.enum(['fiction', 'nonfiction', 'educational', 'children', 'business', 'romance', 'mystery', 'sci-fi'] as const)
    }))
    .query(async ({ input }) => {
      const templates = getTemplatesByCategory(input.category);

      return {
        success: true,
        count: templates.length,
        templates: templates.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description,
          category: t.category,
          style: t.style
        }))
      };
    }),

  /**
   * Get templates by style
   */
  getTemplatesByStyle: publicProcedure
    .input(z.object({
      style: z.enum(['modern', 'classic', 'minimalist', 'artistic', 'professional'] as const)
    }))
    .query(async ({ input }) => {
      const templates = getTemplatesByStyle(input.style);

      return {
        success: true,
        count: templates.length,
        templates: templates.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description,
          category: t.category,
          style: t.style
        }))
      };
    }),

  /**
   * Generate cover preview (SVG)
   */
  generatePreview: publicProcedure
    .input(CustomizationSchema)
    .mutation(async ({ input }) => {
      try {
        // Validate customization
        const validation = validateCustomization(input);
        if (!validation.valid) {
          return {
            success: false,
            errors: validation.errors
          };
        }

        // Get template
        const template = getTemplate(input.templateId);
        if (!template) {
          return {
            success: false,
            error: `Template not found: ${input.templateId}`
          };
        }

        // Render to SVG
        const svgContent = await renderTemplateToSVG(template, input);

        if (!validateSvgContent(svgContent)) {
          return {
            success: false,
            error: 'Failed to generate SVG content'
          };
        }

        return {
          success: true,
          svgContent,
          templateId: input.templateId,
          width: template.width,
          height: template.height
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          error: `Preview generation failed: ${errorMessage}`
        };
      }
    }),

  /**
   * Generate cover as PNG
   */
  generatePNG: publicProcedure
    .input(CustomizationSchema)
    .mutation(async ({ input }) => {
      try {
        // Validate customization
        const validation = validateCustomization(input);
        if (!validation.valid) {
          return {
            success: false,
            errors: validation.errors
          };
        }

        // Get template
        const template = getTemplate(input.templateId);
        if (!template) {
          return {
            success: false,
            error: `Template not found: ${input.templateId}`
          };
        }

        // Render to SVG
        const svgContent = await renderTemplateToSVG(template, input);

        // Convert to PNG
        const pngBuffer = await svgToPng(svgContent, template.width, template.height);

        // Upload to S3
        const fileKey = `covers/${input.templateId}/${Date.now()}-${input.title.replace(/\s+/g, '-').toLowerCase()}.png`;
        const { url } = await storagePut(fileKey, pngBuffer, 'image/png');

        return {
          success: true,
          url,
          fileKey,
          format: 'png',
          size: pngBuffer.length
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          error: `PNG generation failed: ${errorMessage}`
        };
      }
    }),

  /**
   * Generate cover as JPEG
   */
  generateJPEG: publicProcedure
    .input(CustomizationSchema.extend({
      quality: z.number().min(1).max(100).default(85)
    }))
    .mutation(async ({ input }) => {
      try {
        const { quality, ...customization } = input;

        // Validate customization
        const validation = validateCustomization(customization);
        if (!validation.valid) {
          return {
            success: false,
            errors: validation.errors
          };
        }

        // Get template
        const template = getTemplate(customization.templateId);
        if (!template) {
          return {
            success: false,
            error: `Template not found: ${customization.templateId}`
          };
        }

        // Render to SVG
        const svgContent = await renderTemplateToSVG(template, customization);

        // Convert to JPEG
        const jpegBuffer = await svgToJpeg(svgContent, template.width, template.height, quality);

        // Upload to S3
        const fileKey = `covers/${customization.templateId}/${Date.now()}-${customization.title.replace(/\s+/g, '-').toLowerCase()}.jpg`;
        const { url } = await storagePut(fileKey, jpegBuffer, 'image/jpeg');

        return {
          success: true,
          url,
          fileKey,
          format: 'jpeg',
          quality,
          size: jpegBuffer.length
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          error: `JPEG generation failed: ${errorMessage}`
        };
      }
    }),

  /**
   * Generate cover previews at multiple sizes
   */
  generatePreviews: publicProcedure
    .input(CustomizationSchema)
    .mutation(async ({ input }) => {
      try {
        // Validate customization
        const validation = validateCustomization(input);
        if (!validation.valid) {
          return {
            success: false,
            errors: validation.errors
          };
        }

        // Get template
        const template = getTemplate(input.templateId);
        if (!template) {
          return {
            success: false,
            error: `Template not found: ${input.templateId}`
          };
        }

        // Render to SVG
        const svgContent = await renderTemplateToSVG(template, input);

        // Generate previews
        const previews = await generateCoverPreviews(svgContent, template.width, template.height);

        // Upload all previews to S3
        const baseKey = `covers/${input.templateId}/${Date.now()}-${input.title.replace(/\s+/g, '-').toLowerCase()}`;
        const uploadPromises = [
          storagePut(`${baseKey}-thumbnail.jpg`, previews.thumbnail, 'image/jpeg'),
          storagePut(`${baseKey}-small.jpg`, previews.small, 'image/jpeg'),
          storagePut(`${baseKey}-medium.jpg`, previews.medium, 'image/jpeg'),
          storagePut(`${baseKey}-large.jpg`, previews.large, 'image/jpeg')
        ];

        const results = await Promise.all(uploadPromises);

        return {
          success: true,
          previews: {
            thumbnail: results[0].url,
            small: results[1].url,
            medium: results[2].url,
            large: results[3].url
          }
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          error: `Preview generation failed: ${errorMessage}`
        };
      }
    }),

  /**
   * Validate customization
   */
  validateCustomization: publicProcedure
    .input(CustomizationSchema)
    .query(async ({ input }) => {
      const validation = validateCustomization(input);

      return {
        valid: validation.valid,
        errors: validation.errors
      };
    }),

  /**
   * Get template categories
   */
  getCategories: publicProcedure
    .query(() => {
      return {
        categories: ['fiction', 'nonfiction', 'educational', 'children', 'business', 'romance', 'mystery', 'sci-fi']
      };
    }),

  /**
   * Get template styles
   */
  getStyles: publicProcedure
    .query(() => {
      return {
        styles: ['modern', 'classic', 'minimalist', 'artistic', 'professional']
      };
    })
});

// Font endpoints will be added here
