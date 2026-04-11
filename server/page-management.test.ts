import { describe, it, expect } from "vitest";

/**
 * Page Management Tests
 * Tests for page reordering, duplication, deletion, and navigation
 */

describe("Page Management", () => {
  describe("Page Reordering", () => {
    it("should reorder pages", () => {
      const pages = [
        { id: 1, pageNumber: 1 },
        { id: 2, pageNumber: 2 },
        { id: 3, pageNumber: 3 },
      ];

      const reorderPages = (pages: any[], fromIndex: number, toIndex: number) => {
        const newPages = [...pages];
        const [movedPage] = newPages.splice(fromIndex, 1);
        newPages.splice(toIndex, 0, movedPage);
        return newPages;
      };

      const result = reorderPages(pages, 0, 2);
      expect(result[0].id).toBe(2);
      expect(result[1].id).toBe(3);
      expect(result[2].id).toBe(1);
    });

    it("should move page up", () => {
      const pages = [
        { id: 1, pageNumber: 1 },
        { id: 2, pageNumber: 2 },
        { id: 3, pageNumber: 3 },
      ];

      const movePageUp = (pages: any[], pageId: number) => {
        const currentIndex = pages.findIndex((p) => p.id === pageId);
        if (currentIndex <= 0) return pages;
        const newPages = [...pages];
        const [movedPage] = newPages.splice(currentIndex, 1);
        newPages.splice(currentIndex - 1, 0, movedPage);
        return newPages;
      };

      const result = movePageUp(pages, 3);
      expect(result[1].id).toBe(3);
      expect(result[2].id).toBe(2);
    });

    it("should move page down", () => {
      const pages = [
        { id: 1, pageNumber: 1 },
        { id: 2, pageNumber: 2 },
        { id: 3, pageNumber: 3 },
      ];

      const movePageDown = (pages: any[], pageId: number) => {
        const currentIndex = pages.findIndex((p) => p.id === pageId);
        if (currentIndex >= pages.length - 1) return pages;
        const newPages = [...pages];
        const [movedPage] = newPages.splice(currentIndex, 1);
        newPages.splice(currentIndex + 1, 0, movedPage);
        return newPages;
      };

      const result = movePageDown(pages, 1);
      expect(result[0].id).toBe(2);
      expect(result[1].id).toBe(1);
    });

    it("should not move first page up", () => {
      const pages = [
        { id: 1, pageNumber: 1 },
        { id: 2, pageNumber: 2 },
      ];

      const movePageUp = (pages: any[], pageId: number) => {
        const currentIndex = pages.findIndex((p) => p.id === pageId);
        if (currentIndex <= 0) return pages;
        const newPages = [...pages];
        const [movedPage] = newPages.splice(currentIndex, 1);
        newPages.splice(currentIndex - 1, 0, movedPage);
        return newPages;
      };

      const result = movePageUp(pages, 1);
      expect(result).toEqual(pages);
    });

    it("should not move last page down", () => {
      const pages = [
        { id: 1, pageNumber: 1 },
        { id: 2, pageNumber: 2 },
      ];

      const movePageDown = (pages: any[], pageId: number) => {
        const currentIndex = pages.findIndex((p) => p.id === pageId);
        if (currentIndex >= pages.length - 1) return pages;
        const newPages = [...pages];
        const [movedPage] = newPages.splice(currentIndex, 1);
        newPages.splice(currentIndex + 1, 0, movedPage);
        return newPages;
      };

      const result = movePageDown(pages, 2);
      expect(result).toEqual(pages);
    });
  });

  describe("Page Duplication", () => {
    it("should duplicate page", () => {
      const pages = [
        { id: 1, pageNumber: 1, content: "Page 1" },
        { id: 2, pageNumber: 2, content: "Page 2" },
      ];

      const duplicatePage = (pages: any[], pageId: number) => {
        const pageIndex = pages.findIndex((p) => p.id === pageId);
        if (pageIndex === -1) return pages;

        const pageToDuplicate = pages[pageIndex];
        const newPage = {
          ...pageToDuplicate,
          id: Math.max(...pages.map((p) => p.id)) + 1,
        };

        const newPages = [...pages];
        newPages.splice(pageIndex + 1, 0, newPage);
        return newPages;
      };

      const result = duplicatePage(pages, 1);
      expect(result).toHaveLength(3);
      expect(result[1].id).toBe(3);
      expect(result[1].content).toBe("Page 1");
    });

    it("should duplicate last page", () => {
      const pages = [
        { id: 1, pageNumber: 1 },
        { id: 2, pageNumber: 2 },
      ];

      const duplicatePage = (pages: any[], pageId: number) => {
        const pageIndex = pages.findIndex((p) => p.id === pageId);
        if (pageIndex === -1) return pages;

        const pageToDuplicate = pages[pageIndex];
        const newPage = {
          ...pageToDuplicate,
          id: Math.max(...pages.map((p) => p.id)) + 1,
        };

        const newPages = [...pages];
        newPages.splice(pageIndex + 1, 0, newPage);
        return newPages;
      };

      const result = duplicatePage(pages, 2);
      expect(result).toHaveLength(3);
      expect(result[2].id).toBe(3);
    });
  });

  describe("Page Deletion", () => {
    it("should delete page", () => {
      const pages = [
        { id: 1, pageNumber: 1 },
        { id: 2, pageNumber: 2 },
        { id: 3, pageNumber: 3 },
      ];

      const deletePage = (pages: any[], pageId: number) => {
        return pages.filter((p) => p.id !== pageId);
      };

      const result = deletePage(pages, 2);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(3);
    });

    it("should delete first page", () => {
      const pages = [
        { id: 1, pageNumber: 1 },
        { id: 2, pageNumber: 2 },
      ];

      const deletePage = (pages: any[], pageId: number) => {
        return pages.filter((p) => p.id !== pageId);
      };

      const result = deletePage(pages, 1);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
    });

    it("should delete last page", () => {
      const pages = [
        { id: 1, pageNumber: 1 },
        { id: 2, pageNumber: 2 },
      ];

      const deletePage = (pages: any[], pageId: number) => {
        return pages.filter((p) => p.id !== pageId);
      };

      const result = deletePage(pages, 2);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });
  });

  describe("Page Navigation", () => {
    it("should find page by ID", () => {
      const pages = [
        { id: 1, pageNumber: 1 },
        { id: 2, pageNumber: 2 },
        { id: 3, pageNumber: 3 },
      ];

      const findPage = (pages: any[], pageId: number) => {
        return pages.find((p) => p.id === pageId);
      };

      const result = findPage(pages, 2);
      expect(result?.id).toBe(2);
    });

    it("should get page number", () => {
      const pages = [
        { id: 1, pageNumber: 1 },
        { id: 2, pageNumber: 2 },
        { id: 3, pageNumber: 3 },
      ];

      const getPageNumber = (pages: any[], pageId: number) => {
        return pages.findIndex((p) => p.id === pageId) + 1;
      };

      expect(getPageNumber(pages, 1)).toBe(1);
      expect(getPageNumber(pages, 2)).toBe(2);
      expect(getPageNumber(pages, 3)).toBe(3);
    });

    it("should get next page", () => {
      const pages = [
        { id: 1, pageNumber: 1 },
        { id: 2, pageNumber: 2 },
        { id: 3, pageNumber: 3 },
      ];

      const getNextPage = (pages: any[], pageId: number) => {
        const index = pages.findIndex((p) => p.id === pageId);
        if (index === -1 || index >= pages.length - 1) return undefined;
        return pages[index + 1];
      };

      expect(getNextPage(pages, 1)?.id).toBe(2);
      expect(getNextPage(pages, 2)?.id).toBe(3);
      expect(getNextPage(pages, 3)).toBeUndefined();
    });

    it("should get previous page", () => {
      const pages = [
        { id: 1, pageNumber: 1 },
        { id: 2, pageNumber: 2 },
        { id: 3, pageNumber: 3 },
      ];

      const getPreviousPage = (pages: any[], pageId: number) => {
        const index = pages.findIndex((p) => p.id === pageId);
        if (index <= 0) return undefined;
        return pages[index - 1];
      };

      expect(getPreviousPage(pages, 1)).toBeUndefined();
      expect(getPreviousPage(pages, 2)?.id).toBe(1);
      expect(getPreviousPage(pages, 3)?.id).toBe(2);
    });
  });

  describe("Page Insertion", () => {
    it("should insert page at position", () => {
      const pages = [
        { id: 1, pageNumber: 1 },
        { id: 3, pageNumber: 3 },
      ];

      const insertPageAt = (pages: any[], page: any, position: number) => {
        const newPages = [...pages];
        newPages.splice(Math.max(0, Math.min(position, newPages.length)), 0, page);
        return newPages;
      };

      const result = insertPageAt(pages, { id: 2, pageNumber: 2 }, 1);
      expect(result).toHaveLength(3);
      expect(result[1].id).toBe(2);
    });

    it("should add page after specific page", () => {
      const pages = [
        { id: 1, pageNumber: 1 },
        { id: 2, pageNumber: 2 },
      ];

      const addPageAfter = (pages: any[], afterPageId: number, newPage: any) => {
        const index = pages.findIndex((p) => p.id === afterPageId);
        if (index === -1) return [...pages, newPage];
        const newPages = [...pages];
        newPages.splice(index + 1, 0, newPage);
        return newPages;
      };

      const result = addPageAfter(pages, 1, { id: 3, pageNumber: 3 });
      expect(result).toHaveLength(3);
      expect(result[1].id).toBe(3);
    });
  });

  describe("Page Statistics", () => {
    it("should count total pages", () => {
      const pages = [
        { id: 1, pageNumber: 1 },
        { id: 2, pageNumber: 2 },
        { id: 3, pageNumber: 3 },
      ];

      expect(pages.length).toBe(3);
    });

    it("should identify first page", () => {
      const pages = [
        { id: 1, pageNumber: 1 },
        { id: 2, pageNumber: 2 },
      ];

      const isFirstPage = (pages: any[], pageId: number) => {
        return pages.findIndex((p) => p.id === pageId) === 0;
      };

      expect(isFirstPage(pages, 1)).toBe(true);
      expect(isFirstPage(pages, 2)).toBe(false);
    });

    it("should identify last page", () => {
      const pages = [
        { id: 1, pageNumber: 1 },
        { id: 2, pageNumber: 2 },
      ];

      const isLastPage = (pages: any[], pageId: number) => {
        return pages.findIndex((p) => p.id === pageId) === pages.length - 1;
      };

      expect(isLastPage(pages, 1)).toBe(false);
      expect(isLastPage(pages, 2)).toBe(true);
    });
  });

  describe("Page Validation", () => {
    it("should validate page order", () => {
      const pages = [
        { id: 1, pageNumber: 1 },
        { id: 2, pageNumber: 2 },
        { id: 3, pageNumber: 3 },
      ];

      const validatePageOrder = (pages: any[]) => {
        if (pages.length === 0) return true;
        const ids = new Set(pages.map((p) => p.id));
        return ids.size === pages.length;
      };

      expect(validatePageOrder(pages)).toBe(true);
    });

    it("should detect duplicate page IDs", () => {
      const pages = [
        { id: 1, pageNumber: 1 },
        { id: 1, pageNumber: 2 },
      ];

      const validatePageOrder = (pages: any[]) => {
        if (pages.length === 0) return true;
        const ids = new Set(pages.map((p) => p.id));
        return ids.size === pages.length;
      };

      expect(validatePageOrder(pages)).toBe(false);
    });
  });
});
