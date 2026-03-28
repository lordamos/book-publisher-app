/**
 * Font Preview Cache Service
 * 
 * Manages caching and retrieval of font preview images
 */

import { getDb } from './db';
import { fontPreviewCache, fontPairFavorites } from '../drizzle/schema';
import { eq, and, lt } from 'drizzle-orm';
import { storagePut, storageGet } from './storage';
import { type FontCustomization } from './font-library';
import {
  generateFontPreviewSvg,
  generateAllFontPreviews,
  generatePreviewKey,
  generateS3PreviewKey,
  PREVIEW_SIZES,
  DEFAULT_PREVIEW_CONTENT,
  validatePreviewContent,
  type FontPreviewContent
} from './font-preview-generator';

/**
 * Get cached preview URLs for a font combination
 */
export async function getCachedFontPreview(customization: FontCustomization) {
  const previewKey = generatePreviewKey(customization);
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const cached = await db
    .select()
    .from(fontPreviewCache)
    .where(eq(fontPreviewCache.previewKey, previewKey))
    .limit(1);

  if (cached.length > 0) {
    const cache = cached[0];

    // Update access count and last accessed time
    await db
      .update(fontPreviewCache)
      .set({
        accessCount: (cache.accessCount || 0) + 1,
        lastAccessedAt: new Date()
      })
      .where(eq(fontPreviewCache.id, cache.id));

    return {
      found: true,
      preview: {
        thumbnail: cache.thumbnailUrl,
        small: cache.smallUrl,
        medium: cache.mediumUrl,
        large: cache.largeUrl
      },
      metadata: {
        generatedAt: cache.generatedAt,
        accessCount: (cache.accessCount || 0) + 1
      }
    };
  }

  return { found: false };
}

/**
 * Generate and cache font preview images
 */
export async function generateAndCacheFontPreview(
  customization: FontCustomization,
  content: FontPreviewContent = DEFAULT_PREVIEW_CONTENT
) {
  const previewKey = generatePreviewKey(customization);
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Check if already cached
  const existing = await getCachedFontPreview(customization);
  if (existing.found) {
    return existing;
  }

  try {
    // Generate all preview sizes
    const previews = await generateAllFontPreviews(customization, content);

    // Upload to S3
    const uploadedUrls: Record<string, string> = {};

    for (const [sizeKey, buffer] of Object.entries(previews)) {
      const s3Key = generateS3PreviewKey(customization, sizeKey as keyof typeof PREVIEW_SIZES);
      const { url } = await storagePut(s3Key, buffer, 'image/jpeg');
      uploadedUrls[sizeKey] = url;
    }

    // Save to database
    await db.insert(fontPreviewCache).values({
      previewKey,
      headingFont: customization.headingFont,
      bodyFont: customization.bodyFont,
      headingWeight: customization.headingWeight,
      bodyWeight: customization.bodyWeight,
      headingStyle: customization.headingStyle,
      bodyStyle: customization.bodyStyle,
      thumbnailUrl: uploadedUrls.thumbnail,
      smallUrl: uploadedUrls.small,
      mediumUrl: uploadedUrls.medium,
      largeUrl: uploadedUrls.large,
      generatedAt: new Date(),
      accessCount: 1
    });

    return {
      success: true,
      preview: {
        thumbnail: uploadedUrls.thumbnail,
        small: uploadedUrls.small,
        medium: uploadedUrls.medium,
        large: uploadedUrls.large
      },
      metadata: {
        generatedAt: new Date(),
        accessCount: 1
      }
    };
  } catch (error) {
    throw new Error(`Failed to generate and cache font preview: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get or generate font preview
 */
export async function getOrGenerateFontPreview(
  customization: FontCustomization,
  content: FontPreviewContent = DEFAULT_PREVIEW_CONTENT
) {
  const cached = await getCachedFontPreview(customization);
  if (cached.found) {
    return cached;
  }

  return generateAndCacheFontPreview(customization, content);
}

/**
 * Save font pair to favorites
 */
export async function saveFontPairFavorite(
  userId: number,
  customization: FontCustomization,
  name?: string,
  description?: string
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const existing = await db
    .select()
    .from(fontPairFavorites)
    .where(
      and(
        eq(fontPairFavorites.userId, userId),
        eq(fontPairFavorites.headingFont, customization.headingFont),
        eq(fontPairFavorites.bodyFont, customization.bodyFont)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Update existing favorite
    await db
      .update(fontPairFavorites)
      .set({
        name: name || existing[0].name,
        description: description || existing[0].description,
        usageCount: (existing[0].usageCount || 0) + 1
      })
      .where(eq(fontPairFavorites.id, existing[0].id));

    return { success: true, created: false };
  }

  // Create new favorite
  await db.insert(fontPairFavorites).values({
    userId,
    headingFont: customization.headingFont,
    bodyFont: customization.bodyFont,
    headingWeight: customization.headingWeight,
    bodyWeight: customization.bodyWeight,
    headingStyle: customization.headingStyle,
    bodyStyle: customization.bodyStyle,
    name: name || `${customization.headingFont} + ${customization.bodyFont}`,
    description,
    usageCount: 1
  });

  return { success: true, created: true };
}

/**
 * Get user's favorite font pairs
 */
export async function getUserFontPairFavorites(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const favorites = await db
    .select()
    .from(fontPairFavorites)
    .where(eq(fontPairFavorites.userId, userId))
    .orderBy((t) => t.usageCount);

  return favorites;
}

/**
 * Remove font pair from favorites
 */
export async function removeFontPairFavorite(userId: number, favoriteId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const favorite = await db
    .select()
    .from(fontPairFavorites)
    .where(
      and(
        eq(fontPairFavorites.id, favoriteId),
        eq(fontPairFavorites.userId, userId)
      )
    )
    .limit(1);

  if (favorite.length === 0) {
    return { success: false, error: 'Favorite not found' };
  }

  await db
    .delete(fontPairFavorites)
    .where(eq(fontPairFavorites.id, favoriteId));

  return { success: true };
}

/**
 * Clear expired preview cache
 */
export async function clearExpiredPreviewCache() {
  const now = new Date();
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Delete expired cache entries (older than 30 days)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  await db
    .delete(fontPreviewCache)
    .where(lt(fontPreviewCache.generatedAt, thirtyDaysAgo));

  return { cleared: true };
}

/**
 * Get preview cache statistics
 */
export async function getPreviewCacheStats() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const all = await db.select().from(fontPreviewCache);

  const totalSize = all.reduce((sum: number, cache: any) => {
    // Rough estimate: each preview is ~50KB
    return sum + 50;
  }, 0);

  const mostAccessed = all.sort((a: any, b: any) => (b.accessCount || 0) - (a.accessCount || 0)).slice(0, 10);

  return {
    totalCached: all.length,
    estimatedSizeKB: totalSize,
    totalAccesses: all.reduce((sum: number, cache: any) => sum + (cache.accessCount || 0), 0),
    mostAccessed: mostAccessed.map((cache: any) => ({
      previewKey: cache.previewKey,
      accessCount: cache.accessCount,
      generatedAt: cache.generatedAt
    }))
  };
}

/**
 * Batch generate previews for all font pairs
 */
export async function batchGenerateAllFontPreviews(
  fontPairs: Array<{ heading: string; body: string }>,
  onProgress?: (current: number, total: number) => void
) {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[]
  };

  for (let i = 0; i < fontPairs.length; i++) {
    try {
      const pair = fontPairs[i];
      const customization: FontCustomization = {
        headingFont: pair.heading,
        bodyFont: pair.body,
        headingWeight: '700',
        bodyWeight: '400',
        headingStyle: 'normal',
        bodyStyle: 'normal'
      };

      await generateAndCacheFontPreview(customization);
      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push(
        `Pair ${i + 1}: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    onProgress?.(i + 1, fontPairs.length);
  }

  return results;
}
