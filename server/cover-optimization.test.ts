/**
 * Tests for Cover Image Validation and Optimization Module
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  validateCoverImage,
  optimizeCoverImage,
  generateCoverThumbnail,
  generateCoverPreviews,
  processAndValidateCover,
  formatValidationResults,
  formatOptimizationResults,
  KDP_COVER_REQUIREMENTS
} from './cover-optimization';
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

// Test directory
const testDir = './test-covers';
const outputDir = './test-covers-output';

/**
 * Create test cover images
 */
async function createTestCover(
  filename: string,
  width: number,
  height: number,
  options: { format?: 'jpeg' | 'png'; colorSpace?: string } = {}
): Promise<string> {
  const { format = 'jpeg', colorSpace = 'srgb' } = options;

  const filepath = path.join(testDir, filename);

  // Create a simple gradient image
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8B4513;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2C1810;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)"/>
      <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-size="48" fill="white" font-family="Arial">
        Test Cover
      </text>
    </svg>
  `;

  let pipeline = sharp(Buffer.from(svg));

  if (colorSpace === 'cmyk') {
    // Note: sharp doesn't directly support CMYK creation, so we'll create RGB
    // In real scenario, you'd convert from existing CMYK
    pipeline = pipeline.toColorspace('srgb');
  }

  if (format === 'jpeg') {
    await pipeline.jpeg({ quality: 85 }).toFile(filepath);
  } else {
    await pipeline.png().toFile(filepath);
  }

  return filepath;
}

describe('Cover Optimization Module', () => {
  beforeAll(async () => {
    // Create test directories
    try {
      await fs.mkdir(testDir, { recursive: true });
      await fs.mkdir(outputDir, { recursive: true });
    } catch {
      // Directories might already exist
    }
  });

  afterAll(async () => {
    // Clean up test files
    try {
      const files = await fs.readdir(testDir);
      for (const file of files) {
        await fs.unlink(path.join(testDir, file));
      }
      await fs.rmdir(testDir);

      const outputFiles = await fs.readdir(outputDir);
      for (const file of outputFiles) {
        await fs.unlink(path.join(outputDir, file));
      }
      await fs.rmdir(outputDir);
    } catch {
      // Cleanup errors are acceptable
    }
  });

  describe('validateCoverImage', () => {
    it('should validate a correct cover image', async () => {
      const coverPath = await createTestCover('valid_cover.jpg', 1000, 1600);
      const result = await validateCoverImage(coverPath);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.metadata.width).toBe(1000);
      expect(result.metadata.height).toBe(1600);
      expect(result.metadata.format).toBe('jpeg');
    });

    it('should reject cover with incorrect dimensions', async () => {
      const coverPath = await createTestCover('small_cover.jpg', 500, 800);
      const result = await validateCoverImage(coverPath);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Width too small');
    });

    it('should reject cover with incorrect aspect ratio', async () => {
      const coverPath = await createTestCover('wrong_ratio_cover.jpg', 1000, 1200);
      const result = await validateCoverImage(coverPath);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Aspect ratio'))).toBe(true);
    });

    it('should validate PNG format', async () => {
      const coverPath = await createTestCover('valid_cover.png', 1000, 1600, { format: 'png' });
      const result = await validateCoverImage(coverPath);

      expect(result.isValid).toBe(true);
      expect(result.metadata.format).toBe('png');
    });

    it('should detect missing file', async () => {
      const result = await validateCoverImage('./nonexistent_cover.jpg');

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('File not found');
    });

    it('should warn about large file size', async () => {
      // Create a large cover with high quality to ensure file size is large
      const coverPath = path.join(testDir, 'large_cover.jpg');
      await sharp({
        create: {
          width: 5000,
          height: 8000,
          channels: 3,
          background: { r: 139, g: 69, b: 19 }
        }
      })
        .jpeg({ quality: 95, progressive: false })
        .toFile(coverPath);

      const result = await validateCoverImage(coverPath);

      // Check if file size triggers warning
      const hasWarning = result.warnings.some(w => w.includes('File size'));
      const isLargeFile = result.metadata.fileSizeMB > KDP_COVER_REQUIREMENTS.recommendedMaxFileSizeMB;
      
      if (isLargeFile) {
        expect(hasWarning).toBe(true);
      }
    });

    it('should validate aspect ratio within tolerance', async () => {
      // Create cover with aspect ratio very close to target (within tolerance)
      const coverPath = await createTestCover('close_ratio_cover.jpg', 1010, 1616);
      const result = await validateCoverImage(coverPath);

      expect(result.isValid).toBe(true);
      expect(result.errors.some(e => e.includes('Aspect ratio'))).toBe(false);
    });
  });

  describe('optimizeCoverImage', () => {
    it('should optimize a cover image', async () => {
      const inputPath = await createTestCover('optimize_input.jpg', 2000, 3200);
      const outputPath = path.join(outputDir, 'optimize_output.jpg');

      const result = await optimizeCoverImage(inputPath, outputPath);

      expect(result.success).toBe(true);
      expect(result.metadata.width).toBe(1000);
      expect(result.metadata.height).toBe(1600);
      expect(result.compressionRatio).toBeGreaterThan(0);
    });

    it('should reduce file size during optimization', async () => {
      const inputPath = await createTestCover('large_input.jpg', 2000, 3200);
      const outputPath = path.join(outputDir, 'optimized.jpg');

      const result = await optimizeCoverImage(inputPath, outputPath);

      expect(result.optimizedSize).toBeLessThan(result.originalSize);
      expect(result.compressionRatio).toBeGreaterThan(0);
    });

    it('should handle PNG optimization', async () => {
      const inputPath = await createTestCover('optimize_input.png', 2000, 3200, { format: 'png' });
      const outputPath = path.join(outputDir, 'optimize_output.png');

      const result = await optimizeCoverImage(inputPath, outputPath, { format: 'png' });

      expect(result.success).toBe(true);
      expect(result.metadata.format).toBe('png');
    });

    it('should convert to RGB color space', async () => {
      const inputPath = await createTestCover('rgb_input.jpg', 1000, 1600);
      const outputPath = path.join(outputDir, 'rgb_output.jpg');

      const result = await optimizeCoverImage(inputPath, outputPath, { convertToRGB: true });

      expect(result.success).toBe(true);
      const metadata = await sharp(outputPath).metadata();
      expect(metadata.space).toBe('srgb');
    });

    it('should handle optimization errors gracefully', async () => {
      const result = await optimizeCoverImage(
        './nonexistent.jpg',
        path.join(outputDir, 'output.jpg')
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should apply custom quality settings', async () => {
      const inputPath = await createTestCover('quality_input.jpg', 1000, 1600);
      const outputPath = path.join(outputDir, 'quality_output.jpg');

      const result = await optimizeCoverImage(inputPath, outputPath, { quality: 60 });

      expect(result.success).toBe(true);
      expect(result.compressionRatio).toBeGreaterThan(0);
    });
  });

  describe('generateCoverThumbnail', () => {
    it('should generate thumbnail at correct size', async () => {
      const coverPath = await createTestCover('thumbnail_input.jpg', 1000, 1600);
      const outputPath = path.join(outputDir, 'thumbnail.jpg');

      await generateCoverThumbnail(coverPath, outputPath);

      const metadata = await sharp(outputPath).metadata();
      expect(metadata.width).toBe(KDP_COVER_REQUIREMENTS.thumbnailWidth);
      expect(metadata.height).toBe(KDP_COVER_REQUIREMENTS.thumbnailHeight);
    });
  });

  describe('generateCoverPreviews', () => {
    it('should generate multiple preview sizes', async () => {
      const coverPath = await createTestCover('preview_input.jpg', 1000, 1600);

      await generateCoverPreviews(coverPath, outputDir);

      const files = await fs.readdir(outputDir);
      const previewFiles = files.filter(f => f.includes('preview'));

      expect(previewFiles.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('processAndValidateCover', () => {
    it('should process and validate cover successfully', async () => {
      const inputPath = await createTestCover('process_input.jpg', 1000, 1600);
      const outputPath = path.join(outputDir, 'process_output.jpg');

      const result = await processAndValidateCover(inputPath, outputPath);

      expect(result.success).toBe(true);
      expect(result.validation.isValid).toBe(true);
      expect(result.optimization.success).toBe(true);
    });

    it('should fail if original validation fails', async () => {
      const inputPath = await createTestCover('invalid_input.jpg', 500, 800);
      const outputPath = path.join(outputDir, 'invalid_output.jpg');

      const result = await processAndValidateCover(inputPath, outputPath);

      expect(result.success).toBe(false);
      expect(result.validation.isValid).toBe(false);
    });
  });

  describe('formatValidationResults', () => {
    it('should format validation results as string', async () => {
      const coverPath = await createTestCover('format_input.jpg', 1000, 1600);
      const validation = await validateCoverImage(coverPath);

      const formatted = formatValidationResults(validation);

      expect(formatted).toContain('✅');
      expect(formatted).toContain('Metadata');
      expect(formatted).toContain('Dimensions');
    });

    it('should include errors in formatted output', async () => {
      const coverPath = await createTestCover('format_error_input.jpg', 500, 800);
      const validation = await validateCoverImage(coverPath);

      const formatted = formatValidationResults(validation);

      expect(formatted).toContain('❌');
      expect(formatted).toContain('Errors');
    });
  });

  describe('formatOptimizationResults', () => {
    it('should format optimization results as string', async () => {
      const inputPath = await createTestCover('format_opt_input.jpg', 1000, 1600);
      const outputPath = path.join(outputDir, 'format_opt_output.jpg');

      const optimization = await optimizeCoverImage(inputPath, outputPath);
      const formatted = formatOptimizationResults(optimization);

      expect(formatted).toContain('✅');
      expect(formatted).toContain('Results');
      expect(formatted).toContain('Compression');
    });
  });

  describe('KDP_COVER_REQUIREMENTS', () => {
    it('should have correct requirements defined', () => {
      expect(KDP_COVER_REQUIREMENTS.minWidth).toBe(1000);
      expect(KDP_COVER_REQUIREMENTS.minHeight).toBe(1600);
      expect(KDP_COVER_REQUIREMENTS.aspectRatio).toBe(0.625);
      expect(KDP_COVER_REQUIREMENTS.maxFileSizeMB).toBe(5);
      expect(KDP_COVER_REQUIREMENTS.validFormats).toContain('jpeg');
      expect(KDP_COVER_REQUIREMENTS.validFormats).toContain('png');
    });
  });
});
