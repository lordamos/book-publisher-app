import { asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, books, pages, chapters, bookImages, bookMetadata, InsertBook, InsertPage, InsertChapter, InsertBookImage, InsertBookMetadata } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Book operations
export async function getBooksByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(books).where(eq(books.userId, userId)).orderBy(desc(books.updatedAt));
}

export async function getBookById(bookId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(books).where(eq(books.id, bookId)).limit(1);
  return result[0];
}

export async function createBook(data: InsertBook) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(books).values(data);
  return result[0];
}

export async function updateBook(bookId: number, data: Partial<InsertBook>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(books).set(data).where(eq(books.id, bookId));
}

// Page operations
export async function getPagesByBookId(bookId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pages).where(eq(pages.bookId, bookId)).orderBy(asc(pages.pageNumber));
}

export async function createPage(data: InsertPage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(pages).values(data);
  return result[0];
}

export async function updatePage(pageId: number, data: Partial<InsertPage>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(pages).set(data).where(eq(pages.id, pageId));
}

// Chapter operations
export async function getChaptersByBookId(bookId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chapters).where(eq(chapters.bookId, bookId)).orderBy(asc(chapters.chapterNumber));
}

export async function createChapter(data: InsertChapter) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(chapters).values(data);
  return result[0];
}

// Image operations
export async function getImagesByBookId(bookId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookImages).where(eq(bookImages.bookId, bookId));
}

export async function createBookImage(data: InsertBookImage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(bookImages).values(data);
  return result[0];
}

// Metadata operations
export async function getBookMetadata(bookId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(bookMetadata).where(eq(bookMetadata.bookId, bookId)).limit(1);
  return result[0];
}

export async function createBookMetadata(data: InsertBookMetadata) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(bookMetadata).values(data);
  return result[0];
}

export async function updateBookMetadata(bookId: number, data: Partial<InsertBookMetadata>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(bookMetadata).set(data).where(eq(bookMetadata.bookId, bookId));
}
