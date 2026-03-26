import { getDb } from "./db";
import { bookVersions, versionMetadata, versionTags, pages, chapters, bookImages, bookMetadata, books } from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

export interface BookSnapshot {
  bookId: number;
  title: string;
  description?: string | null;
  author?: string | null;
  isbn?: string | null;
  category?: string | null;
  pages: any[];
  chapters: any[];
  images: any[];
  metadata: any;
}

export interface VersionInfo {
  id: number;
  versionNumber: number;
  title: string;
  description?: string;
  createdBy: number;
  createdAt: Date;
  isAutoSave: boolean;
  pageCount: number;
  characterCount: number;
  changesSummary?: string;
}

export interface VersionDiff {
  pagesAdded: number;
  pagesDeleted: number;
  pagesModified: number;
  imagesAdded: number;
  imagesDeleted: number;
  chaptersAdded: number;
  chaptersDeleted: number;
  metadataChanged: number;
}

/**
 * Create a new version snapshot of the book
 */
export async function createVersionSnapshot(
  bookId: number,
  userId: number,
  changesSummary?: string,
  isAutoSave: boolean = false
): Promise<VersionInfo | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Get current book state
    const bookData = await db.select().from(bookVersions).where(eq(bookVersions.bookId, bookId)).orderBy(desc(bookVersions.versionNumber)).limit(1);
    const currentVersionNumber = bookData.length > 0 ? bookData[0].versionNumber : 0;
    const newVersionNumber = currentVersionNumber + 1;

    // Fetch all book data
    const bookPages = await db.select().from(pages).where(eq(pages.bookId, bookId));
    const bookChapters = await db.select().from(chapters).where(eq(chapters.bookId, bookId));
    const bookImgs = await db.select().from(bookImages).where(eq(bookImages.bookId, bookId));
    const bookMeta = await db.select().from(bookMetadata).where(eq(bookMetadata.bookId, bookId)).limit(1);
    const bookInfo = await db.select().from(books).where(eq(books.id, bookId)).limit(1);

    // Create snapshot
    const snapshot: BookSnapshot = {
      bookId,
      title: bookInfo[0]?.title || "",
      description: bookInfo[0]?.description,
      author: bookInfo[0]?.author,
      isbn: bookInfo[0]?.isbn,
      category: bookInfo[0]?.category,
      pages: bookPages,
      chapters: bookChapters,
      images: bookImgs,
      metadata: bookMeta[0] || {},
    };

    // Calculate stats
    const pageCount = bookPages.length;
    const characterCount = bookPages.reduce((sum, page) => sum + (page.content?.length || 0), 0);

    // Insert version
    const bookTitle = bookInfo[0]?.title || `Version ${newVersionNumber}`;
    const bookDesc = bookInfo[0]?.description;
    await db.insert(bookVersions).values({
      bookId,
      versionNumber: newVersionNumber,
      title: bookTitle,
      description: bookDesc,
      snapshot: JSON.stringify(snapshot),
      changesSummary,
      createdBy: userId,
      isAutoSave: isAutoSave ? 1 : 0,
      pageCount,
      characterCount,
    });

    // Get the inserted version ID
    const insertedVersion = await db
      .select()
      .from(bookVersions)
      .where(eq(bookVersions.bookId, bookId))
      .orderBy(desc(bookVersions.versionNumber))
      .limit(1);

    const versionId = insertedVersion[0]?.id || 0;

    // Calculate and store metadata
    const diff = await calculateVersionDiff(bookId, newVersionNumber);
    if (diff && versionId > 0) {
      await db.insert(versionMetadata).values({
        versionId,
        pagesAdded: diff.pagesAdded,
        pagesDeleted: diff.pagesDeleted,
        pagesModified: diff.pagesModified,
        imagesAdded: diff.imagesAdded,
        imagesDeleted: diff.imagesDeleted,
        chaptersAdded: diff.chaptersAdded,
        chaptersDeleted: diff.chaptersDeleted,
        metadataChanged: diff.metadataChanged,
      });
    }

    return {
      id: versionId,
      versionNumber: newVersionNumber,
      title: bookTitle || `Version ${newVersionNumber}`,
      description: bookDesc || undefined,
      createdBy: userId,
      createdAt: new Date(),
      isAutoSave,
      pageCount,
      characterCount,
      changesSummary,
    };
  } catch (error) {
    console.error("Failed to create version snapshot:", error);
    throw error;
  }
}

/**
 * Get list of versions for a book
 */
export async function getBookVersions(bookId: number, limit: number = 50): Promise<VersionInfo[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const versions = await db
    .select()
    .from(bookVersions)
    .where(eq(bookVersions.bookId, bookId))
    .orderBy(desc(bookVersions.createdAt))
    .limit(limit);

  return versions.map((v) => ({
    id: v.id,
    versionNumber: v.versionNumber,
    title: v.title,
    description: v.description || undefined,
    createdBy: v.createdBy,
    createdAt: v.createdAt,
    isAutoSave: v.isAutoSave === 1,
    pageCount: v.pageCount || 0,
    characterCount: v.characterCount || 0,
    changesSummary: v.changesSummary || undefined,
  }));
}

/**
 * Get a specific version
 */
export async function getVersion(versionId: number): Promise<BookSnapshot | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const version = await db.select().from(bookVersions).where(eq(bookVersions.id, versionId)).limit(1);

  if (version.length === 0) return null;

  try {
    return JSON.parse(version[0].snapshot);
  } catch (error) {
    console.error("Failed to parse snapshot:", error);
    return null;
  }
}

/**
 * Restore a book to a specific version
 */
export async function restoreVersion(bookId: number, versionId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Get the version snapshot
    const version = await getVersion(versionId);
    if (!version) throw new Error("Version not found");

    // Create a backup of current state before restoring
    await createVersionSnapshot(bookId, userId, `Restored from version ${versionId}`, false);

    // Delete current pages and chapters
    await db.delete(pages).where(eq(pages.bookId, bookId));
    await db.delete(chapters).where(eq(chapters.bookId, bookId));
    await db.delete(bookImages).where(eq(bookImages.bookId, bookId));

    // Restore pages
    if (version.pages && version.pages.length > 0) {
      for (const page of version.pages) {
        const { id, createdAt, updatedAt, ...pageData } = page;
        await db.insert(pages).values({
          ...pageData,
          bookId,
        });
      }
    }

    // Restore chapters
    if (version.chapters && version.chapters.length > 0) {
      for (const chapter of version.chapters) {
        const { id, createdAt, updatedAt, ...chapterData } = chapter;
        await db.insert(chapters).values({
          ...chapterData,
          bookId,
        });
      }
    }

    // Restore images
    if (version.images && version.images.length > 0) {
      for (const image of version.images) {
        const { id, createdAt, updatedAt, ...imageData } = image;
        await db.insert(bookImages).values({
          ...imageData,
          bookId,
        });
      }
    }

    return true;
  } catch (error) {
    console.error("Failed to restore version:", error);
    throw error;
  }
}

/**
 * Calculate differences between versions
 */
export async function calculateVersionDiff(bookId: number, currentVersionNumber: number): Promise<VersionDiff | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Get current and previous versions
    const versions = await db
      .select()
      .from(bookVersions)
      .where(eq(bookVersions.bookId, bookId))
      .orderBy(desc(bookVersions.versionNumber))
      .limit(2);

    if (versions.length < 2) {
      // First version, no diff
      return {
        pagesAdded: 0,
        pagesDeleted: 0,
        pagesModified: 0,
        imagesAdded: 0,
        imagesDeleted: 0,
        chaptersAdded: 0,
        chaptersDeleted: 0,
        metadataChanged: 0,
      };
    }

    const currentSnapshot = JSON.parse(versions[0].snapshot);
    const previousSnapshot = JSON.parse(versions[1].snapshot);

    const diff: VersionDiff = {
      pagesAdded: Math.max(0, currentSnapshot.pages.length - previousSnapshot.pages.length),
      pagesDeleted: Math.max(0, previousSnapshot.pages.length - currentSnapshot.pages.length),
      pagesModified: 0,
      imagesAdded: Math.max(0, currentSnapshot.images.length - previousSnapshot.images.length),
      imagesDeleted: Math.max(0, previousSnapshot.images.length - currentSnapshot.images.length),
      chaptersAdded: Math.max(0, currentSnapshot.chapters.length - previousSnapshot.chapters.length),
      chaptersDeleted: Math.max(0, previousSnapshot.chapters.length - currentSnapshot.chapters.length),
      metadataChanged: currentSnapshot.metadata !== previousSnapshot.metadata ? 1 : 0,
    };

    return diff;
  } catch (error) {
    console.error("Failed to calculate diff:", error);
    return null;
  }
}

/**
 * Delete a version
 */
export async function deleteVersion(versionId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.delete(bookVersions).where(eq(bookVersions.id, versionId));
    return true;
  } catch (error) {
    console.error("Failed to delete version:", error);
    throw error;
  }
}

/**
 * Add a tag to a version
 */
export async function tagVersion(versionId: number, tag: string, description?: string): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.insert(versionTags).values({
      versionId,
      tag,
      description,
    });
    return true;
  } catch (error) {
    console.error("Failed to tag version:", error);
    throw error;
  }
}

/**
 * Get version metadata
 */
export async function getVersionMetadata(versionId: number): Promise<VersionDiff | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const metadata = await db.select().from(versionMetadata).where(eq(versionMetadata.versionId, versionId)).limit(1);

  if (metadata.length === 0) return null;

  return {
    pagesAdded: metadata[0].pagesAdded || 0,
    pagesDeleted: metadata[0].pagesDeleted || 0,
    pagesModified: metadata[0].pagesModified || 0,
    imagesAdded: metadata[0].imagesAdded || 0,
    imagesDeleted: metadata[0].imagesDeleted || 0,
    chaptersAdded: metadata[0].chaptersAdded || 0,
    chaptersDeleted: metadata[0].chaptersDeleted || 0,
    metadataChanged: metadata[0].metadataChanged || 0,
  };
}

/**
 * Clean up old auto-save versions (keep only last N versions)
 */
export async function cleanupOldVersions(bookId: number, keepCount: number = 50): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const versions = await db
      .select()
      .from(bookVersions)
      .where(eq(bookVersions.bookId, bookId))
      .orderBy(desc(bookVersions.createdAt));

    let deletedCount = 0;

    // Delete versions beyond keepCount, prioritizing auto-saves
    for (let i = keepCount; i < versions.length; i++) {
      if (versions[i].isAutoSave === 1) {
        await deleteVersion(versions[i].id);
        deletedCount++;
      }
    }

    return deletedCount;
  } catch (error) {
    console.error("Failed to cleanup old versions:", error);
    throw error;
  }
}
