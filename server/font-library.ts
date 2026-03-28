/**
 * Font Library and Management System
 * 
 * Provides a curated collection of fonts for book covers with categorization,
 * pairing suggestions, and Google Fonts integration.
 */

/**
 * Font category types
 */
export type FontCategory = 'serif' | 'sans-serif' | 'display' | 'script' | 'monospace';

/**
 * Font weight options
 */
export type FontWeight = 'normal' | 'semibold' | 'bold' | '400' | '600' | '700';

/**
 * Font style options
 */
export type FontStyle = 'normal' | 'italic';

/**
 * Font definition
 */
export interface Font {
  id: string;
  name: string;
  category: FontCategory;
  googleFontName?: string;
  weights: FontWeight[];
  styles: FontStyle[];
  description: string;
  bestFor: string[];
  pairsWith: string[];
  fallback: string;
  previewText: string;
}

/**
 * Font pair suggestion
 */
export interface FontPair {
  heading: string;
  body: string;
  description: string;
  style: 'classic' | 'modern' | 'elegant' | 'bold' | 'playful';
}

/**
 * Font customization options
 */
export interface FontCustomization {
  headingFont: string;
  bodyFont: string;
  headingWeight: FontWeight;
  bodyWeight: FontWeight;
  headingStyle: FontStyle;
  bodyStyle: FontStyle;
}

/**
 * Curated font library
 */
export const FONT_LIBRARY: Record<string, Font> = {
  'playfair-display': {
    id: 'playfair-display',
    name: 'Playfair Display',
    category: 'serif',
    googleFontName: 'Playfair Display',
    weights: ['400', '700'],
    styles: ['normal', 'italic'],
    description: 'High-contrast serif typeface inspired by the transitional period of printing',
    bestFor: ['fiction', 'romance', 'luxury', 'elegant'],
    pairsWith: ['inter', 'lato', 'open-sans'],
    fallback: 'Georgia, serif',
    previewText: 'The Art of Typography'
  },

  'inter': {
    id: 'inter',
    name: 'Inter',
    category: 'sans-serif',
    googleFontName: 'Inter',
    weights: ['400', '600', '700'],
    styles: ['normal'],
    description: 'Carefully crafted sans-serif typeface designed for screen readability',
    bestFor: ['business', 'modern', 'tech', 'minimalist'],
    pairsWith: ['playfair-display', 'lora', 'merriweather'],
    fallback: 'Arial, sans-serif',
    previewText: 'Clean & Modern Design'
  },

  'lora': {
    id: 'lora',
    name: 'Lora',
    category: 'serif',
    googleFontName: 'Lora',
    weights: ['400', '600', '700'],
    styles: ['normal', 'italic'],
    description: 'Calligraphic serif typeface optimized for readability in print and digital',
    bestFor: ['editorial', 'literary', 'academic', 'traditional'],
    pairsWith: ['inter', 'open-sans', 'lato'],
    fallback: 'Garamond, serif',
    previewText: 'Elegant & Timeless'
  },

  'open-sans': {
    id: 'open-sans',
    name: 'Open Sans',
    category: 'sans-serif',
    googleFontName: 'Open Sans',
    weights: ['400', '600', '700'],
    styles: ['normal', 'italic'],
    description: 'Humanist sans-serif typeface with friendly and open appearance',
    bestFor: ['business', 'friendly', 'accessible', 'corporate'],
    pairsWith: ['playfair-display', 'lora', 'merriweather'],
    fallback: 'Verdana, sans-serif',
    previewText: 'Open & Friendly'
  },

  'montserrat': {
    id: 'montserrat',
    name: 'Montserrat',
    category: 'sans-serif',
    googleFontName: 'Montserrat',
    weights: ['400', '600', '700'],
    styles: ['normal', 'italic'],
    description: 'Urban typeface inspired by the signs and posters of Buenos Aires',
    bestFor: ['modern', 'bold', 'creative', 'contemporary'],
    pairsWith: ['lora', 'merriweather', 'playfair-display'],
    fallback: 'Arial, sans-serif',
    previewText: 'Bold & Urban'
  },

  'merriweather': {
    id: 'merriweather',
    name: 'Merriweather',
    category: 'serif',
    googleFontName: 'Merriweather',
    weights: ['400', '700'],
    styles: ['normal', 'italic'],
    description: 'Traditional serif typeface designed for excellent readability on screen',
    bestFor: ['literary', 'traditional', 'editorial', 'classic'],
    pairsWith: ['open-sans', 'inter', 'lato'],
    fallback: 'Georgia, serif',
    previewText: 'Traditional & Readable'
  },

  'lato': {
    id: 'lato',
    name: 'Lato',
    category: 'sans-serif',
    googleFontName: 'Lato',
    weights: ['400', '700'],
    styles: ['normal', 'italic'],
    description: 'Warm sans-serif typeface with distinctive character and personality',
    bestFor: ['friendly', 'approachable', 'modern', 'casual'],
    pairsWith: ['playfair-display', 'lora', 'merriweather'],
    fallback: 'Tahoma, sans-serif',
    previewText: 'Warm & Approachable'
  },

  'raleway': {
    id: 'raleway',
    name: 'Raleway',
    category: 'sans-serif',
    googleFontName: 'Raleway',
    weights: ['400', '600', '700'],
    styles: ['normal', 'italic'],
    description: 'Elegant sans-serif typeface with thin weight variations',
    bestFor: ['elegant', 'luxury', 'fashion', 'modern'],
    pairsWith: ['lora', 'playfair-display', 'merriweather'],
    fallback: 'Arial, sans-serif',
    previewText: 'Elegant & Refined'
  },

  'poppins': {
    id: 'poppins',
    name: 'Poppins',
    category: 'sans-serif',
    googleFontName: 'Poppins',
    weights: ['400', '600', '700'],
    styles: ['normal'],
    description: 'Geometric sans-serif typeface with playful and modern character',
    bestFor: ['playful', 'contemporary', 'creative', 'youthful'],
    pairsWith: ['lora', 'merriweather', 'playfair-display'],
    fallback: 'Arial, sans-serif',
    previewText: 'Playful & Modern'
  },

  'crimson-text': {
    id: 'crimson-text',
    name: 'Crimson Text',
    category: 'serif',
    googleFontName: 'Crimson Text',
    weights: ['400', '600', '700'],
    styles: ['normal', 'italic'],
    description: 'Classical proportioned serif typeface for book typography',
    bestFor: ['literary', 'academic', 'classical', 'traditional'],
    pairsWith: ['inter', 'open-sans', 'lato'],
    fallback: 'Garamond, serif',
    previewText: 'Classical & Literary'
  },

  'dancing-script': {
    id: 'dancing-script',
    name: 'Dancing Script',
    category: 'script',
    googleFontName: 'Dancing Script',
    weights: ['400', '700'],
    styles: ['normal'],
    description: 'Lively script typeface with handwritten character',
    bestFor: ['romance', 'creative', 'artistic', 'feminine'],
    pairsWith: ['open-sans', 'lato', 'inter'],
    fallback: 'Cursive, sans-serif',
    previewText: 'Dancing & Artistic'
  },

  'roboto-mono': {
    id: 'roboto-mono',
    name: 'Roboto Mono',
    category: 'monospace',
    googleFontName: 'Roboto Mono',
    weights: ['400', '700'],
    styles: ['normal'],
    description: 'Monospace typeface for technical and code-related content',
    bestFor: ['technical', 'code', 'minimalist', 'modern'],
    pairsWith: ['inter', 'open-sans', 'lato'],
    fallback: 'Courier New, monospace',
    previewText: 'Code & Technical'
  }
};

/**
 * Font pair suggestions for different book genres and styles
 */
export const FONT_PAIRS: FontPair[] = [
  {
    heading: 'playfair-display',
    body: 'inter',
    description: 'Classic elegance meets modern clarity',
    style: 'classic'
  },
  {
    heading: 'playfair-display',
    body: 'lora',
    description: 'Traditional serif pairing for literary works',
    style: 'elegant'
  },
  {
    heading: 'montserrat',
    body: 'open-sans',
    description: 'Bold modern combination for contemporary books',
    style: 'bold'
  },
  {
    heading: 'raleway',
    body: 'lato',
    description: 'Elegant and warm pairing for luxury content',
    style: 'elegant'
  },
  {
    heading: 'poppins',
    body: 'inter',
    description: 'Playful yet professional for modern audiences',
    style: 'playful'
  },
  {
    heading: 'crimson-text',
    body: 'open-sans',
    description: 'Classical serif with contemporary sans-serif',
    style: 'classic'
  },
  {
    heading: 'lora',
    body: 'inter',
    description: 'Balanced serif and sans-serif combination',
    style: 'modern'
  },
  {
    heading: 'dancing-script',
    body: 'lato',
    description: 'Artistic script with friendly body text',
    style: 'playful'
  },
  {
    heading: 'merriweather',
    body: 'open-sans',
    description: 'Traditional serif with accessible sans-serif',
    style: 'classic'
  },
  {
    heading: 'montserrat',
    body: 'lato',
    description: 'Urban bold with warm approachable body',
    style: 'bold'
  }
];

/**
 * Get font by ID
 */
export function getFont(fontId: string): Font | undefined {
  return FONT_LIBRARY[fontId];
}

/**
 * Get all fonts
 */
export function getAllFonts(): Font[] {
  return Object.values(FONT_LIBRARY);
}

/**
 * Get fonts by category
 */
export function getFontsByCategory(category: FontCategory): Font[] {
  return Object.values(FONT_LIBRARY).filter(f => f.category === category);
}

/**
 * Get fonts suitable for headings
 */
export function getHeadingFonts(): Font[] {
  return Object.values(FONT_LIBRARY).filter(f =>
    ['serif', 'display', 'script'].includes(f.category)
  );
}

/**
 * Get fonts suitable for body text
 */
export function getBodyFonts(): Font[] {
  return Object.values(FONT_LIBRARY).filter(f =>
    ['serif', 'sans-serif'].includes(f.category)
  );
}

/**
 * Get font pairs for a specific style
 */
export function getFontPairsByStyle(style: FontPair['style']): FontPair[] {
  return FONT_PAIRS.filter(p => p.style === style);
}

/**
 * Get recommended font pairs
 */
export function getRecommendedFontPairs(count: number = 5): FontPair[] {
  return FONT_PAIRS.slice(0, count);
}

/**
 * Get fonts that pair well with a given font
 */
export function getFontPairings(fontId: string): string[] {
  const font = getFont(fontId);
  return font?.pairsWith || [];
}

/**
 * Validate font customization
 */
export function validateFontCustomization(customization: FontCustomization): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  const headingFont = getFont(customization.headingFont);
  if (!headingFont) {
    errors.push(`Heading font not found: ${customization.headingFont}`);
  } else if (!headingFont.weights.includes(customization.headingWeight)) {
    errors.push(`Font weight ${customization.headingWeight} not available for ${headingFont.name}`);
  }

  const bodyFont = getFont(customization.bodyFont);
  if (!bodyFont) {
    errors.push(`Body font not found: ${customization.bodyFont}`);
  } else if (!bodyFont.weights.includes(customization.bodyWeight)) {
    errors.push(`Font weight ${customization.bodyWeight} not available for ${bodyFont.name}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get Google Fonts import URL
 */
export function getGoogleFontsImportUrl(fontIds: string[]): string {
  const fonts = fontIds
    .map(id => getFont(id))
    .filter((f): f is Font => !!f && !!f.googleFontName);

  if (fonts.length === 0) return '';

  const fontParams = fonts
    .map(f => {
      const weights = f.weights.filter(w => w !== 'normal' && w !== 'semibold');
      const hasItalic = f.styles.includes('italic');
      const weightStr = weights.length > 0 ? weights.join(';') : '400';
      const italicStr = hasItalic ? ';1' : '';
      return `${f.googleFontName!.replace(/\s+/g, '+')}:wght@${weightStr}${italicStr}`;
    })
    .join('&family=');

  return `https://fonts.googleapis.com/css2?family=${fontParams}&display=swap`;
}

/**
 * Get CSS font-family declaration
 */
export function getCssFontFamily(fontId: string): string {
  const font = getFont(fontId);
  if (!font) return 'sans-serif';

  const fontName = font.googleFontName || font.name;
  return `"${fontName}", ${font.fallback}`;
}

/**
 * Get font CSS variables for template
 */
export function getFontCssVariables(customization: FontCustomization): Record<string, string> {
  const headingFont = getFont(customization.headingFont);
  const bodyFont = getFont(customization.bodyFont);

  return {
    '--font-heading': headingFont ? getCssFontFamily(customization.headingFont) : 'serif',
    '--font-body': bodyFont ? getCssFontFamily(customization.bodyFont) : 'sans-serif',
    '--font-heading-weight': customization.headingWeight,
    '--font-body-weight': customization.bodyWeight,
    '--font-heading-style': customization.headingStyle,
    '--font-body-style': customization.bodyStyle
  };
}

/**
 * Get font preview HTML
 */
export function getFontPreviewHtml(fontId: string, text: string = ''): string {
  const font = getFont(fontId);
  if (!font) return '';

  const displayText = text || font.previewText;
  const fontFamily = getCssFontFamily(fontId);

  return `
    <div style="font-family: ${fontFamily}; padding: 20px; background: #f5f5f5; border-radius: 8px;">
      <h3 style="font-size: 24px; margin: 0 0 10px 0;">${font.name}</h3>
      <p style="font-size: 16px; margin: 0; color: #666;">${displayText}</p>
      <p style="font-size: 12px; margin: 10px 0 0 0; color: #999;">${font.description}</p>
    </div>
  `;
}

/**
 * Get all font metadata for UI
 */
export function getFontMetadata() {
  return {
    fonts: getAllFonts().map(f => ({
      id: f.id,
      name: f.name,
      category: f.category,
      description: f.description,
      bestFor: f.bestFor,
      previewText: f.previewText
    })),
    pairs: FONT_PAIRS,
    categories: ['serif', 'sans-serif', 'display', 'script', 'monospace'] as FontCategory[]
  };
}
