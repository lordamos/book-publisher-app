/**
 * Cover Design Templates Module
 * 
 * Provides customizable cover design templates with dynamic fields for title, author, and ISBN.
 * Supports multiple design styles and export to various formats.
 */

/**
 * Template field types
 */
export type FieldType = 'text' | 'image' | 'shape' | 'barcode';

/**
 * Text field configuration
 */
export interface TextField {
  type: 'text';
  id: string;
  placeholder: string;
  defaultValue?: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold' | 'semibold';
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  textAlign: 'left' | 'center' | 'right';
  maxLength?: number;
  lineHeight?: number;
}

/**
 * Image field configuration
 */
export interface ImageField {
  type: 'image';
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  placeholder?: string;
  aspectRatio?: number;
}

/**
 * Shape field configuration
 */
export interface ShapeField {
  type: 'shape';
  id: string;
  shape: 'rectangle' | 'circle' | 'gradient';
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
}

/**
 * Barcode field configuration
 */
export interface BarcodeField {
  type: 'barcode';
  id: string;
  format: 'ean13' | 'code128' | 'qr';
  x: number;
  y: number;
  width: number;
  height: number;
  value?: string;
}

/**
 * Union type for all field types
 */
export type TemplateField = TextField | ImageField | ShapeField | BarcodeField;

/**
 * Cover template definition
 */
export interface CoverTemplate {
  id: string;
  name: string;
  description: string;
  category: 'fiction' | 'nonfiction' | 'educational' | 'children' | 'business' | 'romance' | 'mystery' | 'sci-fi';
  style: 'modern' | 'classic' | 'minimalist' | 'artistic' | 'professional';
  width: number;  // in pixels
  height: number; // in pixels
  backgroundColor: string;
  backgroundImage?: string;
  fields: TemplateField[];
  previewImage?: string;
  author: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Template customization options
 */
export interface TemplateCustomization {
  templateId: string;
  title: string;
  author: string;
  isbn?: string;
  subtitle?: string;
  tagline?: string;
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  customFonts?: {
    heading?: string;
    body?: string;
  };
  coverImage?: string;
  additionalFields?: Record<string, any>;
}

/**
 * Generated cover result
 */
export interface GeneratedCover {
  id: string;
  templateId: string;
  customization: TemplateCustomization;
  svgContent: string;
  pngUrl?: string;
  jpegUrl?: string;
  generatedAt: Date;
}

/**
 * Template preview configuration
 */
export interface TemplatePreview {
  templateId: string;
  previewSize: 'thumbnail' | 'small' | 'medium' | 'large';
  width: number;
  height: number;
  format: 'jpeg' | 'png';
}

/**
 * Predefined cover templates
 */
export const COVER_TEMPLATES: Record<string, CoverTemplate> = {
  'modern-gradient': {
    id: 'modern-gradient',
    name: 'Modern Gradient',
    description: 'Contemporary design with gradient background and bold typography',
    category: 'fiction',
    style: 'modern',
    width: 1000,
    height: 1600,
    backgroundColor: '#FFFFFF',
    fields: [
      {
        type: 'shape',
        id: 'gradient-bg',
        shape: 'gradient',
        x: 0,
        y: 0,
        width: 1000,
        height: 1600,
        fill: 'url(#gradient1)',
        opacity: 1
      },
      {
        type: 'image',
        id: 'cover-image',
        x: 50,
        y: 100,
        width: 900,
        height: 900,
        placeholder: 'Cover Image'
      },
      {
        type: 'text',
        id: 'title',
        placeholder: 'Book Title',
        fontSize: 72,
        fontFamily: 'Playfair Display',
        fontWeight: 'bold',
        color: '#FFFFFF',
        x: 50,
        y: 1050,
        width: 900,
        height: 200,
        textAlign: 'center',
        lineHeight: 1.2
      },
      {
        type: 'text',
        id: 'author',
        placeholder: 'Author Name',
        fontSize: 36,
        fontFamily: 'Inter',
        fontWeight: 'normal',
        color: '#FFFFFF',
        x: 50,
        y: 1300,
        width: 900,
        height: 100,
        textAlign: 'center'
      },
      {
        type: 'barcode',
        id: 'isbn-barcode',
        format: 'ean13',
        x: 800,
        y: 1450,
        width: 150,
        height: 100
      }
    ],
    author: 'Book Publisher Pro',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  'classic-elegant': {
    id: 'classic-elegant',
    name: 'Classic Elegant',
    description: 'Timeless design with serif typography and ornamental elements',
    category: 'nonfiction',
    style: 'classic',
    width: 1000,
    height: 1600,
    backgroundColor: '#F5E6D3',
    fields: [
      {
        type: 'shape',
        id: 'top-border',
        shape: 'rectangle',
        x: 0,
        y: 0,
        width: 1000,
        height: 100,
        fill: '#8B4513',
        opacity: 1
      },
      {
        type: 'shape',
        id: 'bottom-border',
        shape: 'rectangle',
        x: 0,
        y: 1500,
        width: 1000,
        height: 100,
        fill: '#8B4513',
        opacity: 1
      },
      {
        type: 'text',
        id: 'title',
        placeholder: 'Book Title',
        fontSize: 64,
        fontFamily: 'Playfair Display',
        fontWeight: 'bold',
        color: '#2C1810',
        x: 100,
        y: 400,
        width: 800,
        height: 400,
        textAlign: 'center',
        lineHeight: 1.3
      },
      {
        type: 'text',
        id: 'subtitle',
        placeholder: 'Subtitle (Optional)',
        fontSize: 28,
        fontFamily: 'Inter',
        fontWeight: 'normal',
        color: '#5C4033',
        x: 100,
        y: 850,
        width: 800,
        height: 100,
        textAlign: 'center'
      },
      {
        type: 'text',
        id: 'author',
        placeholder: 'Author Name',
        fontSize: 32,
        fontFamily: 'Playfair Display',
        fontWeight: 'semibold',
        color: '#8B4513',
        x: 100,
        y: 1200,
        width: 800,
        height: 80,
        textAlign: 'center'
      }
    ],
    author: 'Book Publisher Pro',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  'minimalist-clean': {
    id: 'minimalist-clean',
    name: 'Minimalist Clean',
    description: 'Simple and elegant design with plenty of whitespace',
    category: 'business',
    style: 'minimalist',
    width: 1000,
    height: 1600,
    backgroundColor: '#FFFFFF',
    fields: [
      {
        type: 'shape',
        id: 'accent-line',
        shape: 'rectangle',
        x: 0,
        y: 600,
        width: 1000,
        height: 4,
        fill: '#000000',
        opacity: 1
      },
      {
        type: 'text',
        id: 'title',
        placeholder: 'Book Title',
        fontSize: 56,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        color: '#000000',
        x: 100,
        y: 300,
        width: 800,
        height: 300,
        textAlign: 'center',
        lineHeight: 1.2
      },
      {
        type: 'text',
        id: 'author',
        placeholder: 'Author Name',
        fontSize: 28,
        fontFamily: 'Inter',
        fontWeight: 'normal',
        color: '#666666',
        x: 100,
        y: 700,
        width: 800,
        height: 100,
        textAlign: 'center'
      },
      {
        type: 'text',
        id: 'isbn-label',
        placeholder: 'ISBN: 978-0-000000-00-0',
        fontSize: 16,
        fontFamily: 'Inter',
        fontWeight: 'normal',
        color: '#999999',
        x: 100,
        y: 1500,
        width: 800,
        height: 50,
        textAlign: 'center'
      }
    ],
    author: 'Book Publisher Pro',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  'artistic-bold': {
    id: 'artistic-bold',
    name: 'Artistic Bold',
    description: 'Creative design with vibrant colors and artistic elements',
    category: 'fiction',
    style: 'artistic',
    width: 1000,
    height: 1600,
    backgroundColor: '#1A1A1A',
    fields: [
      {
        type: 'shape',
        id: 'color-block-1',
        shape: 'rectangle',
        x: 0,
        y: 0,
        width: 500,
        height: 800,
        fill: '#FF6B6B',
        opacity: 0.9
      },
      {
        type: 'shape',
        id: 'color-block-2',
        shape: 'rectangle',
        x: 500,
        y: 800,
        width: 500,
        height: 800,
        fill: '#4ECDC4',
        opacity: 0.9
      },
      {
        type: 'text',
        id: 'title',
        placeholder: 'Book Title',
        fontSize: 68,
        fontFamily: 'Playfair Display',
        fontWeight: 'bold',
        color: '#FFFFFF',
        x: 50,
        y: 600,
        width: 900,
        height: 300,
        textAlign: 'center',
        lineHeight: 1.2
      },
      {
        type: 'text',
        id: 'author',
        placeholder: 'Author Name',
        fontSize: 32,
        fontFamily: 'Inter',
        fontWeight: 'semibold',
        color: '#FFFFFF',
        x: 50,
        y: 1100,
        width: 900,
        height: 100,
        textAlign: 'center'
      }
    ],
    author: 'Book Publisher Pro',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  'professional-corporate': {
    id: 'professional-corporate',
    name: 'Professional Corporate',
    description: 'Business-focused design with professional aesthetics',
    category: 'business',
    style: 'professional',
    width: 1000,
    height: 1600,
    backgroundColor: '#FFFFFF',
    fields: [
      {
        type: 'shape',
        id: 'header-bg',
        shape: 'rectangle',
        x: 0,
        y: 0,
        width: 1000,
        height: 400,
        fill: '#003366',
        opacity: 1
      },
      {
        type: 'text',
        id: 'tagline',
        placeholder: 'Tagline or Subtitle',
        fontSize: 24,
        fontFamily: 'Inter',
        fontWeight: 'normal',
        color: '#CCCCCC',
        x: 100,
        y: 100,
        width: 800,
        height: 80,
        textAlign: 'center'
      },
      {
        type: 'text',
        id: 'title',
        placeholder: 'Book Title',
        fontSize: 60,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        color: '#FFFFFF',
        x: 100,
        y: 200,
        width: 800,
        height: 150,
        textAlign: 'center',
        lineHeight: 1.2
      },
      {
        type: 'text',
        id: 'author',
        placeholder: 'Author Name',
        fontSize: 32,
        fontFamily: 'Inter',
        fontWeight: 'normal',
        color: '#333333',
        x: 100,
        y: 700,
        width: 800,
        height: 100,
        textAlign: 'center'
      },
      {
        type: 'text',
        id: 'description',
        placeholder: 'Brief description or key benefits',
        fontSize: 20,
        fontFamily: 'Inter',
        fontWeight: 'normal',
        color: '#666666',
        x: 100,
        y: 900,
        width: 800,
        height: 300,
        textAlign: 'center',
        lineHeight: 1.5
      }
    ],
    author: 'Book Publisher Pro',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  'romance-elegant': {
    id: 'romance-elegant',
    name: 'Romance Elegant',
    description: 'Romantic design with soft colors and elegant typography',
    category: 'romance',
    style: 'artistic',
    width: 1000,
    height: 1600,
    backgroundColor: '#FFF5F7',
    fields: [
      {
        type: 'shape',
        id: 'accent-circle',
        shape: 'circle',
        x: 300,
        y: 200,
        width: 400,
        height: 400,
        fill: '#FFB6C1',
        opacity: 0.3
      },
      {
        type: 'text',
        id: 'title',
        placeholder: 'Book Title',
        fontSize: 64,
        fontFamily: 'Playfair Display',
        fontWeight: 'bold',
        color: '#C41E3A',
        x: 100,
        y: 500,
        width: 800,
        height: 300,
        textAlign: 'center',
        lineHeight: 1.3
      },
      {
        type: 'text',
        id: 'author',
        placeholder: 'Author Name',
        fontSize: 32,
        fontFamily: 'Playfair Display',
        fontWeight: 'normal',
        color: '#8B5A8E',
        x: 100,
        y: 1000,
        width: 800,
        height: 100,
        textAlign: 'center'
      },
      {
        type: 'shape',
        id: 'bottom-accent',
        shape: 'rectangle',
        x: 200,
        y: 1450,
        width: 600,
        height: 2,
        fill: '#FFB6C1',
        opacity: 1
      }
    ],
    author: 'Book Publisher Pro',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

/**
 * Get template by ID
 */
export function getTemplate(templateId: string): CoverTemplate | undefined {
  return COVER_TEMPLATES[templateId];
}

/**
 * Get all templates
 */
export function getAllTemplates(): CoverTemplate[] {
  return Object.values(COVER_TEMPLATES);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: CoverTemplate['category']): CoverTemplate[] {
  return Object.values(COVER_TEMPLATES).filter(t => t.category === category);
}

/**
 * Get templates by style
 */
export function getTemplatesByStyle(style: CoverTemplate['style']): CoverTemplate[] {
  return Object.values(COVER_TEMPLATES).filter(t => t.style === style);
}

/**
 * Validate template customization
 */
export function validateCustomization(customization: TemplateCustomization): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!customization.title || customization.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (customization.title && customization.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  if (!customization.author || customization.author.trim().length === 0) {
    errors.push('Author is required');
  }

  if (customization.author && customization.author.length > 100) {
    errors.push('Author name must be less than 100 characters');
  }

  if (customization.isbn) {
    const isbnRegex = /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[X0-9]$/;
    if (!isbnRegex.test(customization.isbn)) {
      errors.push('Invalid ISBN format');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
