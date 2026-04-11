import { Page } from "@shared/types";

/**
 * Page management utilities for reordering, duplicating, and managing pages
 */

/**
 * Reorder pages in the array
 */
export function reorderPages(pages: Page[], fromIndex: number, toIndex: number): Page[] {
  const newPages = [...pages];
  const [movedPage] = newPages.splice(fromIndex, 1);
  newPages.splice(toIndex, 0, movedPage);
  return newPages;
}

/**
 * Find page index by ID
 */
export function findPageIndex(pages: Page[], pageId: number): number {
  return pages.findIndex((p) => p.id === pageId);
}

/**
 * Find page by ID
 */
export function findPage(pages: Page[], pageId: number): Page | undefined {
  return pages.find((p) => p.id === pageId);
}

/**
 * Get page number (1-indexed)
 */
export function getPageNumber(pages: Page[], pageId: number): number {
  return findPageIndex(pages, pageId) + 1;
}

/**
 * Move page to specific position
 */
export function movePageToPosition(
  pages: Page[],
  pageId: number,
  targetPosition: number
): Page[] {
  const currentIndex = findPageIndex(pages, pageId);
  if (currentIndex === -1 || targetPosition < 0 || targetPosition >= pages.length) {
    return pages;
  }
  return reorderPages(pages, currentIndex, targetPosition);
}

/**
 * Move page up (earlier in document)
 */
export function movePageUp(pages: Page[], pageId: number): Page[] {
  const currentIndex = findPageIndex(pages, pageId);
  if (currentIndex <= 0) return pages;
  return reorderPages(pages, currentIndex, currentIndex - 1);
}

/**
 * Move page down (later in document)
 */
export function movePageDown(pages: Page[], pageId: number): Page[] {
  const currentIndex = findPageIndex(pages, pageId);
  if (currentIndex >= pages.length - 1) return pages;
  return reorderPages(pages, currentIndex, currentIndex + 1);
}

/**
 * Duplicate page with new ID
 */
export function duplicatePage(pages: Page[], pageId: number): Page[] {
  const pageIndex = findPageIndex(pages, pageId);
  if (pageIndex === -1) return pages;

  const pageToDuplicate = pages[pageIndex];
  const newPage: Page = {
    ...pageToDuplicate,
    id: Math.max(...pages.map((p) => p.id)) + 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const newPages = [...pages];
  newPages.splice(pageIndex + 1, 0, newPage);
  return newPages;
}

/**
 * Delete page by ID
 */
export function deletePage(pages: Page[], pageId: number): Page[] {
  return pages.filter((p) => p.id !== pageId);
}

/**
 * Insert page at specific position
 */
export function insertPageAt(pages: Page[], page: Page, position: number): Page[] {
  const newPages = [...pages];
  newPages.splice(Math.max(0, Math.min(position, newPages.length)), 0, page);
  return newPages;
}

/**
 * Add page after specific page
 */
export function addPageAfter(pages: Page[], afterPageId: number, newPage: Page): Page[] {
  const index = findPageIndex(pages, afterPageId);
  if (index === -1) return [...pages, newPage];
  return insertPageAt(pages, newPage, index + 1);
}

/**
 * Swap two pages
 */
export function swapPages(pages: Page[], pageId1: number, pageId2: number): Page[] {
  const index1 = findPageIndex(pages, pageId1);
  const index2 = findPageIndex(pages, pageId2);

  if (index1 === -1 || index2 === -1) return pages;

  const newPages = [...pages];
  [newPages[index1], newPages[index2]] = [newPages[index2], newPages[index1]];
  return newPages;
}

/**
 * Get pages range
 */
export function getPagesRange(pages: Page[], startId: number, endId: number): Page[] {
  const startIndex = findPageIndex(pages, startId);
  const endIndex = findPageIndex(pages, endId);

  if (startIndex === -1 || endIndex === -1) return [];

  const [min, max] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];
  return pages.slice(min, max + 1);
}

/**
 * Check if page is first
 */
export function isFirstPage(pages: Page[], pageId: number): boolean {
  return findPageIndex(pages, pageId) === 0;
}

/**
 * Check if page is last
 */
export function isLastPage(pages: Page[], pageId: number): boolean {
  return findPageIndex(pages, pageId) === pages.length - 1;
}

/**
 * Get next page
 */
export function getNextPage(pages: Page[], pageId: number): Page | undefined {
  const index = findPageIndex(pages, pageId);
  if (index === -1 || index >= pages.length - 1) return undefined;
  return pages[index + 1];
}

/**
 * Get previous page
 */
export function getPreviousPage(pages: Page[], pageId: number): Page | undefined {
  const index = findPageIndex(pages, pageId);
  if (index <= 0) return undefined;
  return pages[index - 1];
}

/**
 * Validate page order
 */
export function validatePageOrder(pages: Page[]): boolean {
  if (pages.length === 0) return true;
  const ids = new Set(pages.map((p) => p.id));
  return ids.size === pages.length; // Check for duplicates
}

/**
 * Sort pages by creation date
 */
export function sortPagesByDate(pages: Page[], ascending: boolean = true): Page[] {
  const sorted = [...pages].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
  return sorted;
}

/**
 * Get total page count
 */
export function getTotalPageCount(pages: Page[]): number {
  return pages.length;
}

/**
 * Get page statistics
 */
export function getPageStatistics(pages: Page[]): {
  totalPages: number;
  emptyPages: number;
  pagesWithText: number;
  pagesWithImages: number;
} {
  let emptyPages = 0;
  let pagesWithText = 0;
  let pagesWithImages = 0;

  pages.forEach((page) => {
    try {
      const content = typeof page.content === "string" ? JSON.parse(page.content) : page.content;
      const hasText = content?.textBlocks?.length > 0;
      const hasImages = content?.images?.length > 0;

      if (!hasText && !hasImages) {
        emptyPages++;
      }
      if (hasText) pagesWithText++;
      if (hasImages) pagesWithImages++;
    } catch {
      emptyPages++;
    }
  });

  return {
    totalPages: pages.length,
    emptyPages,
    pagesWithText,
    pagesWithImages,
  };
}

/**
 * Create empty page
 */
export function createEmptyPage(bookId: number, pageNumber: number): Omit<Page, "id"> {
  return {
    bookId,
    pageNumber,
    templateType: "blank",
    content: JSON.stringify({ textBlocks: [], images: [] }),
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Clone page with new ID
 */
export function clonePage(page: Page, newId: number): Page {
  return {
    ...page,
    id: newId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Batch reorder pages
 */
export function batchReorderPages(pages: Page[], orderMap: Record<number, number>): Page[] {
  const newPages = [...pages];
  
  Object.entries(orderMap).forEach(([pageIdStr, newPosition]) => {
    const pageId = parseInt(pageIdStr, 10);
    const currentIndex = findPageIndex(newPages, pageId);
    
    if (currentIndex !== -1 && newPosition >= 0 && newPosition < newPages.length) {
      const [page] = newPages.splice(currentIndex, 1);
      newPages.splice(newPosition, 0, page);
    }
  });

  return newPages;
}
