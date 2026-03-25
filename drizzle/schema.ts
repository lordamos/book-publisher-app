import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const books = mysqlTable("books", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  author: varchar("author", { length: 255 }),
  isbn: varchar("isbn", { length: 20 }),
  category: varchar("category", { length: 100 }),
  coverImageUrl: text("coverImageUrl"),
  status: mysqlEnum("status", ["draft", "in_progress", "ready_for_export", "published"]).default("draft").notNull(),
  pageCount: int("pageCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSavedAt: timestamp("lastSavedAt").defaultNow().onUpdateNow().notNull(),
});

export type Book = typeof books.$inferSelect;
export type InsertBook = typeof books.$inferInsert;

export const pages = mysqlTable("pages", {
  id: int("id").autoincrement().primaryKey(),
  bookId: int("bookId").notNull().references(() => books.id, { onDelete: "cascade" }),
  pageNumber: int("pageNumber").notNull(),
  templateType: mysqlEnum("templateType", ["cover", "chapter", "full_image", "text_only", "blank"]).default("text_only").notNull(),
  content: text("content"), // JSON stringified content
  metadata: text("metadata"), // JSON stringified metadata (layout, margins, etc.)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Page = typeof pages.$inferSelect;
export type InsertPage = typeof pages.$inferInsert;

export const chapters = mysqlTable("chapters", {
  id: int("id").autoincrement().primaryKey(),
  bookId: int("bookId").notNull().references(() => books.id, { onDelete: "cascade" }),
  chapterNumber: int("chapterNumber").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  startPageId: int("startPageId").references(() => pages.id),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Chapter = typeof chapters.$inferSelect;
export type InsertChapter = typeof chapters.$inferInsert;

export const bookImages = mysqlTable("bookImages", {
  id: int("id").autoincrement().primaryKey(),
  bookId: int("bookId").notNull().references(() => books.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  fileKey: varchar("fileKey", { length: 255 }).notNull(),
  fileName: varchar("fileName", { length: 255 }),
  mimeType: varchar("mimeType", { length: 50 }),
  fileSize: int("fileSize"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BookImage = typeof bookImages.$inferSelect;
export type InsertBookImage = typeof bookImages.$inferInsert;

export const bookMetadata = mysqlTable("bookMetadata", {
  id: int("id").autoincrement().primaryKey(),
  bookId: int("bookId").notNull().unique().references(() => books.id, { onDelete: "cascade" }),
  trimSize: varchar("trimSize", { length: 50 }).default("6x9"),
  pageSize: varchar("pageSize", { length: 50 }).default("letter"),
  bleed: varchar("bleed", { length: 10 }).default("0.125"),
  marginTop: varchar("marginTop", { length: 10 }).default("0.75"),
  marginBottom: varchar("marginBottom", { length: 10 }).default("0.75"),
  marginLeft: varchar("marginLeft", { length: 10 }).default("0.75"),
  marginRight: varchar("marginRight", { length: 10 }).default("0.75"),
  paperType: varchar("paperType", { length: 50 }).default("white"),
  bindingType: varchar("bindingType", { length: 50 }).default("perfect"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BookMetadata = typeof bookMetadata.$inferSelect;
export type InsertBookMetadata = typeof bookMetadata.$inferInsert;

/**
 * Book templates for different genres
 */
export const templates = mysqlTable("templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  genre: varchar("genre", { length: 100 }).notNull(),
  description: text("description"),
  coverColor: varchar("coverColor", { length: 7 }).default("#1a1a1a"),
  accentColor: varchar("accentColor", { length: 7 }).default("#ff6b6b"),
  bodyFont: varchar("bodyFont", { length: 100 }).default("Helvetica"),
  headingFont: varchar("headingFont", { length: 100 }).default("Helvetica-Bold"),
  bodyFontSize: int("bodyFontSize").default(12),
  headingFontSize: int("headingFontSize").default(24),
  lineHeight: varchar("lineHeight", { length: 10 }).default("1.5"),
  marginTop: varchar("marginTop", { length: 10 }).default("0.75"),
  marginBottom: varchar("marginBottom", { length: 10 }).default("0.75"),
  marginLeft: varchar("marginLeft", { length: 10 }).default("0.75"),
  marginRight: varchar("marginRight", { length: 10 }).default("0.75"),
  chapterStyle: varchar("chapterStyle", { length: 50 }).default("numbered"),
  includeTableOfContents: int("includeTableOfContents").default(1),
  includeFrontMatter: int("includeFrontMatter").default(1),
  includeBackMatter: int("includeBackMatter").default(1),
  isPublic: int("isPublic").default(1),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = typeof templates.$inferInsert;
