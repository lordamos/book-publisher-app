/**
 * Cover Image Validation and Optimization Module
 * 
 * Provides comprehensive cover image validation and optimization for KDP publishing.
 * Handles validation of dimensions, color space, file size, and optimization.
 */

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * KDP Cover Requirements
 */
export const KDP_COVER_REQUIREMENTS = {
  minWidth: 1000,
  minHeight: 1600,
  maxWidth: 10000,
  maxHeight: 16000,
  aspectRatio: 1000 / 1600, // 0.625
  aspectRatioTolerance: 0.01,
  validFormats: ['jpeg', 'png'],
  maxFileSizeMB: 5,
  recommendedMaxFileSizeMB: 2,
  colorSpace: 'srgb',
  dpi: 72,
  thumbnailWidth: 116,
  thumbnailHeight: 174
} as const;

/**
 * Cover validation result
 */
export interface CoverValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata: {
    width: number;
    height: number;
    format: string;
    colorSpace: string;
    fileSize: number;
    fileSizeMB: number;
    dpi: number;
    aspectRatio: number;
  };
}

/**
 * Cover optimization options
 */
export interface CoverOptimizationOptions {
  targetWidth?: number;
  targetHeight?: number;
  quality?: number;
  removeMargins?: boolean;
  convertToRGB?: boolean;
  compressLevel?: number;
  format?: 'jpeg' | 'png';
}

/**
 * Cover optimization result
 */
export interface CoverOptimizationResult {
  success: boolean;
  inputPath: string;
  outputPath: string;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  metadata: {
    width: number;
    height: number;
    format: string;
    fileSize: number;
  };
  error?: string;
}

/**
 * Validates a cover image against KDP requirements
 */
export async function validateCoverImage(
  imagePath: string
): Promise<CoverValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Check file exists
    try {
      await fs.access(imagePath);
    } catch {
      return {
        isValid: false,
        errors: [`File not found: ${imagePath}`],
        warnings: [],
        metadata: {} as any
      };
    }

    // Get file stats
    const stats = await fs.stat(imagePath);
    const fileSizeMB = stats.size / (1024 * 1024);

    // Get image metadata
    const image = sharp(imagePath);
    const metadata = await image.metadata();

    // Validate dimensions exist
    if (!metadata.width || !metadata.height) {
      errors.push('Unable to read image dimensions');
      return { isValid: false, errors, warnings, metadata: {} as any };
    }

    // Validate dimensions are minimum size
    if (metadata.width < KDP_COVER_REQUIREMENTS.minWidth) {
      errors.push(
        `Width too small: ${metadata.width}px (minimum ${KDP_COVER_REQUIREMENTS.minWidth}px)`
      );
    }

    if (metadata.height < KDP_COVER_REQUIREMENTS.minHeight) {
      errors.push(
        `Height too small: ${metadata.height}px (minimum ${KDP_COVER_REQUIREMENTS.minHeight}px)`
      );
    }

    // Validate dimensions are not too large
    if (metadata.width > KDP_COVER_REQUIREMENTS.maxWidth) {
      warnings.push(
        `Width very large: ${metadata.width}px (recommended max ${KDP_COVER_REQUIREMENTS.maxWidth}px)`
      );
    }

    if (metadata.height > KDP_COVER_REQUIREMENTS.maxHeight) {
      warnings.push(
        `Height very large: ${metadata.height}px (recommended max ${KDP_COVER_REQUIREMENTS.maxHeight}px)`
      );
    }

    // Validate aspect ratio
    const aspectRatio = metadata.width / metadata.height;
    const expectedRatio = KDP_COVER_REQUIREMENTS.aspectRatio;
    const ratioDifference = Math.abs(aspectRatio - expectedRatio);

    if (ratioDifference > KDP_COVER_REQUIREMENTS.aspectRatioTolerance) {
      errors.push(
        `Aspect ratio incorrect: ${aspectRatio.toFixed(3)} (expected ${expectedRatio.toFixed(3)}, tolerance ±${KDP_COVER_REQUIREMENTS.aspectRatioTolerance})`
      );
    }

    // Validate file format
    if (!KDP_COVER_REQUIREMENTS.validFormats.includes((metadata.format || '') as any)) {
      errors.push(
        `Invalid format: ${metadata.format} (must be JPEG or PNG)`
      );
    }

    // Validate color space
    if (metadata.space && metadata.space !== KDP_COVER_REQUIREMENTS.colorSpace) {
      errors.push(
        `Invalid color space: ${metadata.space} (must be sRGB, not CMYK)`
      );
    }

    // Validate file size
    if (fileSizeMB > KDP_COVER_REQUIREMENTS.maxFileSizeMB) {
      errors.push(
        `File size too large: ${fileSizeMB.toFixed(2)} MB (maximum ${KDP_COVER_REQUIREMENTS.maxFileSizeMB} MB)`
      );
    }

    // Warn if file size is large but under limit
    if (fileSizeMB > KDP_COVER_REQUIREMENTS.recommendedMaxFileSizeMB) {
      warnings.push(
        `File size large: ${fileSizeMB.toFixed(2)} MB (recommended under ${KDP_COVER_REQUIREMENTS.recommendedMaxFileSizeMB} MB for faster loading)`
      );
    }

    // Check for white margins (common issue)
    const hasWhiteMargins = await checkForWhiteMargins(imagePath);
    if (hasWhiteMargins) {
      warnings.push(
        'Cover appears to have white margins - consider extending content to edges'
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format || 'unknown',
        colorSpace: metadata.space || 'unknown',
        fileSize: stats.size,
        fileSizeMB,
        dpi: KDP_COVER_REQUIREMENTS.dpi,
        aspectRatio
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      isValid: false,
      errors: [`Validation error: ${errorMessage}`],
      warnings: [],
      metadata: {} as any
    };
  }
}

/**
 * Checks if cover has white margins
 */
async function checkForWhiteMargins(imagePath: string): Promise<boolean> {
  try {
    // Create a small sample to check corners
    const sample = await sharp(imagePath)
      .resize(50, 50, { fit: 'cover', position: 'top-left' })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { data, info } = sample;
    const pixelSize = info.channels;

    // Check if most pixels in top-left corner are white (R, G, B > 240)
    let whitePixels = 0;
    for (let i = 0; i < data.length; i += pixelSize) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (r > 240 && g > 240 && b > 240) {
        whitePixels++;
      }
    }

    const whitePixelRatio = whitePixels / (data.length / pixelSize);
    return whitePixelRatio > 0.8; // If > 80% of corner is white
  } catch {
    return false; // If check fails, assume no white margins
  }
}

/**
 * Optimizes a cover image for KDP
 */
export async function optimizeCoverImage(
  inputPath: string,
  outputPath: string,
  options: CoverOptimizationOptions = {}
): Promise<CoverOptimizationResult> {
  const {
    targetWidth = KDP_COVER_REQUIREMENTS.minWidth,
    targetHeight = KDP_COVER_REQUIREMENTS.minHeight,
    quality = 85,
    removeMargins = true,
    convertToRGB = true,
    compressLevel = 9,
    format = 'jpeg' as const
  } = options;

  try {
    // Get original file size
    const originalStats = await fs.stat(inputPath);
    const originalSize = originalStats.size;

    // Build optimization pipeline
    let pipeline: sharp.Sharp = sharp(inputPath);

    // Step 1: Convert to RGB if needed
    if (convertToRGB) {
      pipeline = pipeline.toColorspace('srgb');
    }

    // Step 2: Remove white margins if detected
    if (removeMargins) {
      try {
        pipeline = pipeline.trim({
          background: '#FFFFFF',
          threshold: 10
        });
      } catch {
        // If trim fails, continue without trimming
      }
    }

    // Step 3: Resize to target dimensions
    pipeline = pipeline.resize(targetWidth, targetHeight, {
      fit: 'cover',
      position: 'center',
      withoutEnlargement: false
    });

    // Step 4: Apply format-specific optimization
    if (format === 'jpeg') {
      pipeline = pipeline.jpeg({
        quality,
        progressive: true,
        mozjpeg: true
      }) as sharp.Sharp;
    } else if (format === 'png') {
      pipeline = pipeline.png({
        compressionLevel: compressLevel,
        adaptiveFiltering: true
      }) as sharp.Sharp;
    } else {
      // Default to JPEG
      pipeline = pipeline.jpeg({
        quality,
        progressive: true,
        mozjpeg: true
      }) as sharp.Sharp;
    }

    // Step 5: Write optimized image
    await pipeline.toFile(outputPath);

    // Get optimized file size
    const optimizedStats = await fs.stat(outputPath);
    const optimizedSize = optimizedStats.size;
    const compressionRatio = 1 - (optimizedSize / originalSize);

    // Get optimized metadata
    const optimizedMetadata = await sharp(outputPath).metadata();

    return {
      success: true,
      inputPath,
      outputPath,
      originalSize,
      optimizedSize,
      compressionRatio,
      metadata: {
        width: optimizedMetadata.width || 0,
        height: optimizedMetadata.height || 0,
        format: optimizedMetadata.format || 'unknown',
        fileSize: optimizedSize
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      inputPath,
      outputPath,
      originalSize: 0,
      optimizedSize: 0,
      compressionRatio: 0,
      metadata: {} as any,
      error: errorMessage
    };
  }
}

/**
 * Generates a thumbnail preview of the cover at KDP search result size
 */
export async function generateCoverThumbnail(
  coverPath: string,
  outputPath: string
): Promise<void> {
  await sharp(coverPath)
    .resize(KDP_COVER_REQUIREMENTS.thumbnailWidth, KDP_COVER_REQUIREMENTS.thumbnailHeight, {
      fit: 'cover',
      position: 'center'
    })
    .toFile(outputPath);
}

/**
 * Generates cover previews at multiple sizes for testing
 */
export async function generateCoverPreviews(
  coverPath: string,
  outputDir: string
): Promise<void> {
  const sizes = [
    { width: 116, height: 174, label: 'thumbnail' },
    { width: 300, height: 480, label: 'small' },
    { width: 600, height: 960, label: 'medium' },
    { width: 1000, height: 1600, label: 'full' }
  ];

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `cover_preview_${size.label}.jpg`);
    await sharp(coverPath)
      .resize(size.width, size.height, {
        fit: 'cover',
        position: 'center'
      })
      .toFile(outputPath);
  }
}

/**
 * Complete cover processing pipeline
 */
export async function processAndValidateCover(
  inputPath: string,
  outputPath: string,
  options: CoverOptimizationOptions = {}
): Promise<{
  validation: CoverValidationResult;
  optimization: CoverOptimizationResult;
  success: boolean;
}> {
  // Step 1: Validate original
  const validation = await validateCoverImage(inputPath);

  if (!validation.isValid) {
    return {
      validation,
      optimization: {
        success: false,
        inputPath,
        outputPath,
        originalSize: 0,
        optimizedSize: 0,
        compressionRatio: 0,
        metadata: {} as any,
        error: 'Original cover validation failed'
      },
      success: false
    };
  }

  // Step 2: Optimize cover
  const optimization = await optimizeCoverImage(inputPath, outputPath, options);

  if (!optimization.success) {
    return {
      validation,
      optimization,
      success: false
    };
  }

  // Step 3: Validate optimized cover
  const optimizedValidation = await validateCoverImage(outputPath);

  return {
    validation: optimizedValidation,
    optimization,
    success: optimizedValidation.isValid && optimization.success
  };
}

/**
 * Batch process multiple covers
 */
export async function batchProcessCovers(
  inputDir: string,
  outputDir: string,
  options: CoverOptimizationOptions = {}
): Promise<Array<{
  file: string;
  result: Awaited<ReturnType<typeof processAndValidateCover>>;
}>> {
  const files = await fs.readdir(inputDir);
  const imageFiles = files.filter(f =>
    /\.(jpg|jpeg|png)$/i.test(f)
  );

  const results = [];

  for (const file of imageFiles) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, `optimized_${file}`);

    const result = await processAndValidateCover(inputPath, outputPath, options);
    results.push({ file, result });
  }

  return results;
}

/**
 * Format validation results for display
 */
export function formatValidationResults(
  validation: CoverValidationResult
): string {
  let output = '';

  if (validation.isValid) {
    output += '✅ Cover validation PASSED\n\n';
  } else {
    output += '❌ Cover validation FAILED\n\n';
  }

  if (validation.errors.length > 0) {
    output += 'Errors:\n';
    validation.errors.forEach(err => {
      output += `  ❌ ${err}\n`;
    });
    output += '\n';
  }

  if (validation.warnings.length > 0) {
    output += 'Warnings:\n';
    validation.warnings.forEach(warn => {
      output += `  ⚠️  ${warn}\n`;
    });
    output += '\n';
  }

  output += 'Metadata:\n';
  output += `  Dimensions: ${validation.metadata.width}x${validation.metadata.height}px\n`;
  output += `  Aspect Ratio: ${validation.metadata.aspectRatio.toFixed(3)}\n`;
  output += `  Format: ${validation.metadata.format}\n`;
  output += `  Color Space: ${validation.metadata.colorSpace}\n`;
  output += `  File Size: ${validation.metadata.fileSizeMB.toFixed(2)} MB\n`;

  return output;
}

/**
 * Format optimization results for display
 */
export function formatOptimizationResults(
  optimization: CoverOptimizationResult
): string {
  let output = '';

  if (optimization.success) {
    output += '✅ Cover optimization SUCCESSFUL\n\n';
  } else {
    output += `❌ Cover optimization FAILED: ${optimization.error}\n\n`;
    return output;
  }

  output += 'Results:\n';
  output += `  Original Size: ${(optimization.originalSize / 1024 / 1024).toFixed(2)} MB\n`;
  output += `  Optimized Size: ${(optimization.optimizedSize / 1024 / 1024).toFixed(2)} MB\n`;
  output += `  Compression: ${(optimization.compressionRatio * 100).toFixed(1)}%\n`;
  output += `  Dimensions: ${optimization.metadata.width}x${optimization.metadata.height}px\n`;
  output += `  Output: ${optimization.outputPath}\n`;

  return output;
}
