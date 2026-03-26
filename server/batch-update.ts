import { getDb } from "./db";
import { pages } from "../drizzle/schema";
import { eq, and, inArray, gte, lte } from "drizzle-orm";

export type PageSelectionMode = "all" | "type" | "range" | "custom";
export type PageTypeFilter = "cover" | "chapter" | "full_image" | "text_only" | "blank" | "all";

export interface BatchUpdateOptions {
  bookId: number;
  selectionMode: PageSelectionMode;
  pageTypeFilter?: PageTypeFilter;
  pageIds?: number[];
  startPage?: number;
  endPage?: number;
  updates: {
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
    fontSize?: number;
    lineHeight?: string;
    marginTop?: string;
    marginBottom?: string;
    marginLeft?: string;
    marginRight?: string;
  };
}

export interface BatchUpdateResult {
  success: boolean;
  pagesUpdated: number;
  pageIds: number[];
  errors: Array<{
    pageId: number;
    error: string;
  }>;
  duration: number;
}

/**
 * Apply batch updates to multiple pages
 */
export async function applyBatchUpdate(options: BatchUpdateOptions): Promise<BatchUpdateResult> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const startTime = Date.now();
  const errors: Array<{ pageId: number; error: string }> = [];
  let pagesUpdated = 0;
  const updatedPageIds: number[] = [];

  try {
    // Get pages to update based on selection mode
    const pagesToUpdate = await getPagesBySelectionMode(db, options);

    if (pagesToUpdate.length === 0) {
      return {
        success: true,
        pagesUpdated: 0,
        pageIds: [],
        errors: [],
        duration: Date.now() - startTime,
      };
    }

    // Apply updates to each page
    for (const page of pagesToUpdate) {
      try {
        const updatedPage = await updatePageStyles(db, page.id, options.updates);
        if (updatedPage) {
          pagesUpdated++;
          updatedPageIds.push(page.id);
        }
      } catch (error) {
        errors.push({
          pageId: page.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return {
      success: errors.length === 0,
      pagesUpdated,
      pageIds: updatedPageIds,
      errors,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    throw new Error(`Batch update failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Get pages based on selection mode
 */
async function getPagesBySelectionMode(
  db: Awaited<ReturnType<typeof getDb>>,
  options: BatchUpdateOptions
): Promise<any[]> {
  if (!db) throw new Error("Database not available");

  const conditions = [eq(pages.bookId, options.bookId)];

  // Add page type filter
  if (options.pageTypeFilter && options.pageTypeFilter !== "all") {
    conditions.push(eq(pages.templateType, options.pageTypeFilter));
  }

  // Handle different selection modes
  switch (options.selectionMode) {
    case "all":
      return await db.select().from(pages).where(and(...conditions));

    case "type":
      if (!options.pageTypeFilter || options.pageTypeFilter === "all") {
        throw new Error("Page type filter required for type selection mode");
      }
      return await db.select().from(pages).where(and(...conditions));

    case "range":
      if (options.startPage === undefined || options.endPage === undefined) {
        throw new Error("Start and end page required for range selection mode");
      }
      conditions.push(gte(pages.pageNumber, options.startPage));
      conditions.push(lte(pages.pageNumber, options.endPage));
      return await db.select().from(pages).where(and(...conditions));

    case "custom":
      if (!options.pageIds || options.pageIds.length === 0) {
        throw new Error("Page IDs required for custom selection mode");
      }
      conditions.push(inArray(pages.id, options.pageIds));
      return await db.select().from(pages).where(and(...conditions));

    default:
      throw new Error(`Unknown selection mode: ${options.selectionMode}`);
  }
}

/**
 * Update page styles
 */
async function updatePageStyles(
  db: Awaited<ReturnType<typeof getDb>>,
  pageId: number,
  updates: BatchUpdateOptions["updates"]
): Promise<boolean> {
  if (!db) throw new Error("Database not available");

  // Build update object with only provided fields
  const updateData: Record<string, any> = {};

  if (updates.backgroundColor !== undefined) updateData.backgroundColor = updates.backgroundColor;
  if (updates.textColor !== undefined) updateData.textColor = updates.textColor;
  if (updates.fontFamily !== undefined) updateData.fontFamily = updates.fontFamily;
  if (updates.fontSize !== undefined) updateData.fontSize = updates.fontSize;
  if (updates.lineHeight !== undefined) updateData.lineHeight = updates.lineHeight;
  if (updates.marginTop !== undefined) updateData.marginTop = updates.marginTop;
  if (updates.marginBottom !== undefined) updateData.marginBottom = updates.marginBottom;
  if (updates.marginLeft !== undefined) updateData.marginLeft = updates.marginLeft;
  if (updates.marginRight !== undefined) updateData.marginRight = updates.marginRight;

  if (Object.keys(updateData).length === 0) {
    return false; // No updates to apply
  }

  updateData.updatedAt = new Date();

  await db.update(pages).set(updateData).where(eq(pages.id, pageId));

  return true;
}

/**
 * Get preview of pages that would be updated
 */
export async function getUpdatePreview(options: BatchUpdateOptions): Promise<any[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const pagesToUpdate = await getPagesBySelectionMode(db, options);

  return pagesToUpdate.map((page) => ({
    id: page.id,
    pageNumber: page.pageNumber,
    templateType: page.templateType,
    title: page.title,
  }));
}

/**
 * Validate batch update options
 */
export function validateBatchUpdateOptions(options: BatchUpdateOptions): string[] {
  const errors: string[] = [];

  if (!options.bookId || options.bookId <= 0) {
    errors.push("Valid book ID is required");
  }

  if (!options.selectionMode) {
    errors.push("Selection mode is required");
  }

  if (options.selectionMode === "range") {
    if (options.startPage === undefined || options.endPage === undefined) {
      errors.push("Start and end page are required for range selection");
    }
    if (
      options.startPage !== undefined &&
      options.endPage !== undefined &&
      options.startPage > options.endPage
    ) {
      errors.push("Start page cannot be greater than end page");
    }
  }

  if (options.selectionMode === "custom") {
    if (!options.pageIds || options.pageIds.length === 0) {
      errors.push("At least one page ID is required for custom selection");
    }
  }

  if (Object.keys(options.updates).length === 0) {
    errors.push("At least one update field is required");
  }

  return errors;
}

/**
 * Get statistics for batch update
 */
export async function getBatchUpdateStats(
  bookId: number
): Promise<{
  totalPages: number;
  pagesByType: Record<string, number>;
  pageRange: { min: number; max: number };
}> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const allPages = await db.select().from(pages).where(eq(pages.bookId, bookId));

  const pagesByType: Record<string, number> = {
    cover: 0,
    chapter: 0,
    full_image: 0,
    text_only: 0,
    blank: 0,
  };

  let minPage = Infinity;
  let maxPage = 0;

  for (const page of allPages) {
    pagesByType[page.templateType] = (pagesByType[page.templateType] || 0) + 1;
    minPage = Math.min(minPage, page.pageNumber || 1);
    maxPage = Math.max(maxPage, page.pageNumber || 1);
  }

  return {
    totalPages: allPages.length,
    pagesByType,
    pageRange: { min: minPage === Infinity ? 1 : minPage, max: maxPage },
  };
}
