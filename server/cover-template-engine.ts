/**
 * Cover Template Rendering Engine
 * 
 * Renders cover templates to SVG, PNG, and JPEG formats with customizable fields.
 */

import { CoverTemplate, TemplateCustomization, TextField, ImageField, ShapeField, BarcodeField } from './cover-templates';
import sharp from 'sharp';
import bwipjs from 'bwip-js';

/**
 * Render template to SVG
 */
export async function renderTemplateToSVG(
  template: CoverTemplate,
  customization: TemplateCustomization
): Promise<string> {
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${template.width}" height="${template.height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${customization.customColors?.primary || '#8B4513'};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${customization.customColors?.secondary || '#2C1810'};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${template.width}" height="${template.height}" fill="${template.backgroundColor}"/>
`;

  // Render each field
  for (const field of template.fields) {
    if (field.type === 'text') {
      svg += renderTextField(field, customization);
    } else if (field.type === 'image') {
      svg += renderImageField(field, customization);
    } else if (field.type === 'shape') {
      svg += renderShapeField(field);
    } else if (field.type === 'barcode') {
      svg += renderBarcodeField(field, customization);
    }
  }

  svg += '</svg>';
  return svg;
}

/**
 * Render text field to SVG
 */
function renderTextField(field: TextField, customization: TemplateCustomization): string {
  let text = '';

  if (field.id === 'title') {
    text = customization.title;
  } else if (field.id === 'author') {
    text = customization.author;
  } else if (field.id === 'subtitle') {
    text = customization.subtitle || '';
  } else if (field.id === 'tagline') {
    text = customization.tagline || '';
  } else if (field.id === 'isbn-label') {
    text = customization.isbn ? `ISBN: ${customization.isbn}` : '';
  } else if (field.id === 'description') {
    text = customization.additionalFields?.description || '';
  } else {
    text = customization.additionalFields?.[field.id] || field.placeholder;
  }

  if (!text) return '';

  // Wrap text if it exceeds width
  const wrappedText = wrapText(text, field.width, field.fontSize);
  const lines = wrappedText.split('\n');

  let svg = `  <!-- Text: ${field.id} -->\n`;

  lines.forEach((line, index) => {
    const yOffset = index * (field.fontSize * (field.lineHeight || 1.2));
    svg += `  <text 
    x="${field.x + field.width / 2}" 
    y="${field.y + field.fontSize + yOffset}" 
    font-family="${field.fontFamily}" 
    font-size="${field.fontSize}" 
    font-weight="${field.fontWeight === 'bold' ? 'bold' : field.fontWeight === 'semibold' ? '600' : 'normal'}" 
    fill="${field.color}" 
    text-anchor="${field.textAlign === 'center' ? 'middle' : field.textAlign === 'right' ? 'end' : 'start'}"
    dominant-baseline="hanging"
  >${escapeXml(line)}</text>\n`;
  });

  return svg;
}

/**
 * Render image field to SVG
 */
function renderImageField(field: ImageField, customization: TemplateCustomization): string {
  if (!customization.coverImage) {
    return `  <!-- Image placeholder: ${field.id} -->\n  <rect x="${field.x}" y="${field.y}" width="${field.width}" height="${field.height}" fill="#CCCCCC" stroke="#999999" stroke-width="2"/>\n`;
  }

  return `  <!-- Image: ${field.id} -->\n  <image x="${field.x}" y="${field.y}" width="${field.width}" height="${field.height}" xlink:href="${customization.coverImage}" preserveAspectRatio="xMidYMid slice"/>\n`;
}

/**
 * Render shape field to SVG
 */
function renderShapeField(field: ShapeField): string {
  let svg = `  <!-- Shape: ${field.id} -->\n`;

  if (field.shape === 'rectangle') {
    svg += `  <rect 
    x="${field.x}" 
    y="${field.y}" 
    width="${field.width}" 
    height="${field.height}" 
    fill="${field.fill}" 
    ${field.stroke ? `stroke="${field.stroke}"` : ''} 
    ${field.strokeWidth ? `stroke-width="${field.strokeWidth}"` : ''} 
    opacity="${field.opacity || 1}"
  />\n`;
  } else if (field.shape === 'circle') {
    const cx = field.x + field.width / 2;
    const cy = field.y + field.height / 2;
    const r = Math.min(field.width, field.height) / 2;

    svg += `  <circle 
    cx="${cx}" 
    cy="${cy}" 
    r="${r}" 
    fill="${field.fill}" 
    ${field.stroke ? `stroke="${field.stroke}"` : ''} 
    ${field.strokeWidth ? `stroke-width="${field.strokeWidth}"` : ''} 
    opacity="${field.opacity || 1}"
  />\n`;
  } else if (field.shape === 'gradient') {
    svg += `  <rect 
    x="${field.x}" 
    y="${field.y}" 
    width="${field.width}" 
    height="${field.height}" 
    fill="${field.fill}" 
    opacity="${field.opacity || 1}"
  />\n`;
  }

  return svg;
}

/**
 * Render barcode field to SVG
 */
function renderBarcodeField(field: BarcodeField, customization: TemplateCustomization): string {
  // For now, return a placeholder. In production, use a barcode library
  const barcodeValue = customization.isbn || '9780000000000';

  return `  <!-- Barcode: ${field.id} -->\n  <rect 
    x="${field.x}" 
    y="${field.y}" 
    width="${field.width}" 
    height="${field.height}" 
    fill="#FFFFFF" 
    stroke="#000000" 
    stroke-width="1"
  />\n  <text 
    x="${field.x + field.width / 2}" 
    y="${field.y + field.height / 2}" 
    font-family="monospace" 
    font-size="12" 
    fill="#000000" 
    text-anchor="middle" 
    dominant-baseline="middle"
  >${escapeXml(barcodeValue)}</text>\n`;
}

/**
 * Wrap text to fit within width
 */
function wrapText(text: string, maxWidth: number, fontSize: number): string {
  // Approximate character width based on font size
  const charWidth = fontSize * 0.5;
  const charsPerLine = Math.floor(maxWidth / charWidth);

  if (charsPerLine <= 0) return text;

  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length <= charsPerLine) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);

  return lines.join('\n');
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
 * Convert SVG to PNG
 */
export async function svgToPng(
  svgContent: string,
  width: number,
  height: number
): Promise<Buffer> {
  return await sharp(Buffer.from(svgContent))
    .png()
    .toBuffer();
}

/**
 * Convert SVG to JPEG
 */
export async function svgToJpeg(
  svgContent: string,
  width: number,
  height: number,
  quality: number = 85
): Promise<Buffer> {
  return await sharp(Buffer.from(svgContent))
    .jpeg({ quality, progressive: true })
    .toBuffer();
}

/**
 * Generate cover preview at specific size
 */
export async function generateCoverPreview(
  svgContent: string,
  width: number,
  height: number,
  previewWidth: number,
  previewHeight: number,
  format: 'jpeg' | 'png' = 'jpeg'
): Promise<Buffer> {
  let pipeline = sharp(Buffer.from(svgContent))
    .resize(previewWidth, previewHeight, {
      fit: 'cover',
      position: 'center'
    });

  if (format === 'jpeg') {
    pipeline = pipeline.jpeg({ quality: 85, progressive: true });
  } else {
    pipeline = pipeline.png();
  }

  return await pipeline.toBuffer();
}

/**
 * Generate multiple preview sizes
 */
export async function generateCoverPreviews(
  svgContent: string,
  width: number,
  height: number
): Promise<{
  thumbnail: Buffer;
  small: Buffer;
  medium: Buffer;
  large: Buffer;
}> {
  const sizes = {
    thumbnail: { w: 116, h: 174 },
    small: { w: 300, h: 480 },
    medium: { w: 600, h: 960 },
    large: { w: 1000, h: 1600 }
  };

  const previews = await Promise.all([
    generateCoverPreview(svgContent, width, height, sizes.thumbnail.w, sizes.thumbnail.h),
    generateCoverPreview(svgContent, width, height, sizes.small.w, sizes.small.h),
    generateCoverPreview(svgContent, width, height, sizes.medium.w, sizes.medium.h),
    generateCoverPreview(svgContent, width, height, sizes.large.w, sizes.large.h)
  ]);

  return {
    thumbnail: previews[0],
    small: previews[1],
    medium: previews[2],
    large: previews[3]
  };
}

/**
 * Validate SVG content
 */
export function validateSvgContent(svgContent: string): boolean {
  try {
    const svgRegex = /<svg[\s\S]*?<\/svg>/;
    return svgRegex.test(svgContent);
  } catch {
    return false;
  }
}

/**
 * Get SVG dimensions
 */
export function getSvgDimensions(svgContent: string): { width: number; height: number } | null {
  try {
    const widthMatch = svgContent.match(/width="(\d+)"/);
    const heightMatch = svgContent.match(/height="(\d+)"/);

    if (widthMatch && heightMatch) {
      return {
        width: parseInt(widthMatch[1]),
        height: parseInt(heightMatch[1])
      };
    }

    return null;
  } catch {
    return null;
  }
}
