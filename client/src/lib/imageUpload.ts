/**
 * Image upload and storage utilities
 */

export interface ImageData {
  url: string;
  width: number;
  height: number;
  x: number;
  y: number;
  name?: string;
  size?: number;
  type?: string;
}

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Please upload a valid image (JPEG, PNG, WebP, or GIF)",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "Image size must be less than 5MB",
    };
  }

  return { valid: true };
}

/**
 * Get image dimensions from file
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Convert file to data URL for preview
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Compress image before upload
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to compress image"));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Calculate aspect ratio
 */
export function calculateAspectRatio(width: number, height: number): number {
  return width / height;
}

/**
 * Resize image maintaining aspect ratio
 */
export function resizeImageMaintainAspectRatio(
  currentWidth: number,
  currentHeight: number,
  newWidth?: number,
  newHeight?: number
): { width: number; height: number } {
  const aspectRatio = calculateAspectRatio(currentWidth, currentHeight);

  if (newWidth && !newHeight) {
    return {
      width: newWidth,
      height: Math.round(newWidth / aspectRatio),
    };
  }

  if (newHeight && !newWidth) {
    return {
      width: Math.round(newHeight * aspectRatio),
      height: newHeight,
    };
  }

  return { width: currentWidth, height: currentHeight };
}

/**
 * Validate image dimensions
 */
export function validateImageDimensions(
  width: number,
  height: number,
  minWidth: number = 50,
  maxWidth: number = 600,
  minHeight: number = 50,
  maxHeight: number = 600
): { valid: boolean; error?: string } {
  if (width < minWidth || width > maxWidth) {
    return {
      valid: false,
      error: `Width must be between ${minWidth} and ${maxWidth} pixels`,
    };
  }

  if (height < minHeight || height > maxHeight) {
    return {
      valid: false,
      error: `Height must be between ${minHeight} and ${maxHeight} pixels`,
    };
  }

  return { valid: true };
}

/**
 * Generate unique image ID
 */
export function generateImageId(): string {
  return `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate image position to center on canvas
 */
export function calculateCenterPosition(
  canvasWidth: number,
  canvasHeight: number,
  imageWidth: number,
  imageHeight: number
): { x: number; y: number } {
  return {
    x: (canvasWidth - imageWidth) / 2,
    y: (canvasHeight - imageHeight) / 2,
  };
}

/**
 * Check if image is within canvas bounds
 */
export function isImageInBounds(
  imageX: number,
  imageY: number,
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number
): boolean {
  return (
    imageX >= 0 &&
    imageY >= 0 &&
    imageX + imageWidth <= canvasWidth &&
    imageY + imageHeight <= canvasHeight
  );
}

/**
 * Clamp image position to canvas bounds
 */
export function clampImageToBounds(
  imageX: number,
  imageY: number,
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  return {
    x: Math.max(0, Math.min(imageX, canvasWidth - imageWidth)),
    y: Math.max(0, Math.min(imageY, canvasHeight - imageHeight)),
  };
}

/**
 * Get file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Extract image metadata
 */
export function extractImageMetadata(file: File): {
  name: string;
  size: number;
  type: string;
  lastModified: number;
} {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
  };
}
