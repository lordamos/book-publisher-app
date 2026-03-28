/**
 * Font Preview Image Generator
 * 
 * Generates preview images for font combinations using SVG and sharp
 */

import sharp from 'sharp';
import { getCssFontFamily, getFont, FontCustomization } from './font-library';

/**
 * Preview image dimensions
 */
export const PREVIEW_SIZES = {
  thumbnail: { width: 200, height: 120 },
  small: { width: 300, height: 180 },
  medium: { width: 400, height: 240 },
  large: { width: 600, height: 360 }
} as const;

/**
 * Font preview content
 */
export interface FontPreviewContent {
  title: string;
  subtitle: string;
  bodyText: string;
  backgroundColor: string;
  textColor: string;
}

/**
 * Default preview content
 */
export const DEFAULT_PREVIEW_CONTENT: FontPreviewContent = {
  title: 'The Art of Typography',
  subtitle: 'Beautiful Font Combinations',
  bodyText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  backgroundColor: '#ffffff',
  textColor: '#1a1a1a'
};

/**
 * Generate SVG preview for font combination
 */
export function generateFontPreviewSvg(
  customization: FontCustomization,
  content: FontPreviewContent = DEFAULT_PREVIEW_CONTENT,
  size: keyof typeof PREVIEW_SIZES = 'medium'
): string {
  const { width, height } = PREVIEW_SIZES[size];
  const headingFont = getFont(customization.headingFont);
  const bodyFont = getFont(customization.bodyFont);

  if (!headingFont || !bodyFont) {
    throw new Error('Invalid font customization');
  }

  const headingFontFamily = getCssFontFamily(customization.headingFont);
  const bodyFontFamily = getCssFontFamily(customization.bodyFont);

  const padding = Math.max(20, width * 0.1);
  const titleFontSize = Math.max(16, width * 0.12);
  const subtitleFontSize = Math.max(12, width * 0.08);
  const bodyFontSize = Math.max(10, width * 0.06);
  const lineHeight = bodyFontSize * 1.5;

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;600;700&family=Lora:wght@400;600;700&family=Open+Sans:wght@400;600;700&family=Montserrat:wght@400;600;700&family=Merriweather:wght@400;700&family=Lato:wght@400;700&family=Raleway:wght@400;600;700&family=Poppins:wght@400;600;700&family=Crimson+Text:wght@400;600;700&family=Dancing+Script:wght@400;700&family=Roboto+Mono:wght@400;700&display=swap');
        </style>
      </defs>
      
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="${content.backgroundColor}"/>
      
      <!-- Title -->
      <text
        x="${padding}"
        y="${padding + titleFontSize}"
        font-family="${headingFontFamily}"
        font-size="${titleFontSize}"
        font-weight="${customization.headingWeight}"
        font-style="${customization.headingStyle}"
        fill="${content.textColor}"
        text-anchor="start"
      >
        ${escapeXml(content.title)}
      </text>
      
      <!-- Subtitle -->
      <text
        x="${padding}"
        y="${padding + titleFontSize + subtitleFontSize + 8}"
        font-family="${headingFontFamily}"
        font-size="${subtitleFontSize}"
        font-weight="400"
        font-style="italic"
        fill="${content.textColor}"
        opacity="0.7"
        text-anchor="start"
      >
        ${escapeXml(content.subtitle)}
      </text>
      
      <!-- Body text -->
      <text
        x="${padding}"
        y="${padding + titleFontSize + subtitleFontSize + lineHeight + 20}"
        font-family="${bodyFontFamily}"
        font-size="${bodyFontSize}"
        font-weight="${customization.bodyWeight}"
        font-style="${customization.bodyStyle}"
        fill="${content.textColor}"
        opacity="0.8"
        text-anchor="start"
        word-spacing="0.1em"
      >
        ${escapeXml(content.bodyText.substring(0, 60))}...
      </text>
      
      <!-- Font names footer -->
      <text
        x="${padding}"
        y="${height - 8}"
        font-family="Arial, sans-serif"
        font-size="8"
        fill="${content.textColor}"
        opacity="0.5"
        text-anchor="start"
      >
        ${escapeXml(headingFont.name)} + ${escapeXml(bodyFont.name)}
      </text>
    </svg>
  `;
}

/**
 * Convert SVG to PNG buffer
 */
export async function svgPreviewToPng(
  svg: string,
  width: number,
  height: number
): Promise<Buffer> {
  try {
    const buffer = await sharp(Buffer.from(svg))
      .png({ quality: 90 })
      .resize(width, height, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .toBuffer();

    return buffer;
  } catch (error) {
    throw new Error(`Failed to convert SVG to PNG: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Convert SVG to JPEG buffer
 */
export async function svgPreviewToJpeg(
  svg: string,
  width: number,
  height: number,
  quality: number = 85
): Promise<Buffer> {
  try {
    const buffer = await sharp(Buffer.from(svg))
      .jpeg({ quality, progressive: true })
      .resize(width, height, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255 }
      })
      .toBuffer();

    return buffer;
  } catch (error) {
    throw new Error(`Failed to convert SVG to JPEG: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Generate all preview sizes for a font combination
 */
export async function generateAllFontPreviews(
  customization: FontCustomization,
  content: FontPreviewContent = DEFAULT_PREVIEW_CONTENT
): Promise<Record<keyof typeof PREVIEW_SIZES, Buffer>> {
  const previews: Record<string, Buffer> = {};

  for (const [sizeKey, dimensions] of Object.entries(PREVIEW_SIZES)) {
    const svg = generateFontPreviewSvg(customization, content, sizeKey as keyof typeof PREVIEW_SIZES);
    const buffer = await svgPreviewToJpeg(svg, dimensions.width, dimensions.height);
    previews[sizeKey] = buffer;
  }

  return previews as Record<keyof typeof PREVIEW_SIZES, Buffer>;
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate preview key for caching
 */
export function generatePreviewKey(customization: FontCustomization): string {
  const key = `${customization.headingFont}-${customization.bodyFont}-${customization.headingWeight}-${customization.bodyWeight}-${customization.headingStyle}-${customization.bodyStyle}`;
  return key.replace(/\s+/g, '_').toLowerCase();
}

/**
 * Generate S3 key for preview image
 */
export function generateS3PreviewKey(
  customization: FontCustomization,
  size: keyof typeof PREVIEW_SIZES
): string {
  const previewKey = generatePreviewKey(customization);
  return `font-previews/${previewKey}/${size}.jpg`;
}

/**
 * Validate preview content
 */
export function validatePreviewContent(content: Partial<FontPreviewContent>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (content.title && content.title.length > 100) {
    errors.push('Title must be less than 100 characters');
  }

  if (content.subtitle && content.subtitle.length > 100) {
    errors.push('Subtitle must be less than 100 characters');
  }

  if (content.bodyText && content.bodyText.length > 500) {
    errors.push('Body text must be less than 500 characters');
  }

  if (content.backgroundColor && !isValidHexColor(content.backgroundColor)) {
    errors.push('Invalid background color format');
  }

  if (content.textColor && !isValidHexColor(content.textColor)) {
    errors.push('Invalid text color format');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate hex color
 */
function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Get preview metadata
 */
export function getPreviewMetadata(customization: FontCustomization) {
  return {
    previewKey: generatePreviewKey(customization),
    sizes: Object.keys(PREVIEW_SIZES),
    s3Keys: Object.keys(PREVIEW_SIZES).map(size =>
      generateS3PreviewKey(customization, size as keyof typeof PREVIEW_SIZES)
    ),
    generatedAt: new Date().toISOString()
  };
}
