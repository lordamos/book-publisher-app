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


/**
 * Book versions table for version history and restore functionality
 */
export const bookVersions = mysqlTable("bookVersions", {
  id: int("id").autoincrement().primaryKey(),
  bookId: int("bookId").notNull().references(() => books.id, { onDelete: "cascade" }),
  versionNumber: int("versionNumber").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  snapshot: text("snapshot").notNull(), // JSON snapshot of book state
  changesSummary: text("changesSummary"), // Summary of changes from previous version
  createdBy: int("createdBy").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  isAutoSave: int("isAutoSave").default(0), // 1 if auto-saved, 0 if manual
  pageCount: int("pageCount").default(0),
  characterCount: int("characterCount").default(0),
});

export type BookVersion = typeof bookVersions.$inferSelect;
export type InsertBookVersion = typeof bookVersions.$inferInsert;

/**
 * Version metadata table for tracking changes and diffs
 */
export const versionMetadata = mysqlTable("versionMetadata", {
  id: int("id").autoincrement().primaryKey(),
  versionId: int("versionId").notNull().references(() => bookVersions.id, { onDelete: "cascade" }),
  pagesAdded: int("pagesAdded").default(0),
  pagesDeleted: int("pagesDeleted").default(0),
  pagesModified: int("pagesModified").default(0),
  imagesAdded: int("imagesAdded").default(0),
  imagesDeleted: int("imagesDeleted").default(0),
  chaptersAdded: int("chaptersAdded").default(0),
  chaptersDeleted: int("chaptersDeleted").default(0),
  metadataChanged: int("metadataChanged").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VersionMetadata = typeof versionMetadata.$inferSelect;
export type InsertVersionMetadata = typeof versionMetadata.$inferInsert;

/**
 * Version tags table for marking important versions
 */
export const versionTags = mysqlTable("versionTags", {
  id: int("id").autoincrement().primaryKey(),
  versionId: int("versionId").notNull().references(() => bookVersions.id, { onDelete: "cascade" }),
  tag: varchar("tag", { length: 50 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VersionTag = typeof versionTags.$inferSelect;
export type InsertVersionTag = typeof versionTags.$inferInsert;

/**
 * Font preview cache table for storing generated preview images
 */
export const fontPreviewCache = mysqlTable("fontPreviewCache", {
  id: int("id").autoincrement().primaryKey(),
  previewKey: varchar("previewKey", { length: 255 }).notNull().unique(),
  headingFont: varchar("headingFont", { length: 100 }).notNull(),
  bodyFont: varchar("bodyFont", { length: 100 }).notNull(),
  headingWeight: varchar("headingWeight", { length: 20 }).notNull(),
  bodyWeight: varchar("bodyWeight", { length: 20 }).notNull(),
  headingStyle: varchar("headingStyle", { length: 20 }).notNull(),
  bodyStyle: varchar("bodyStyle", { length: 20 }).notNull(),
  // Preview URLs for different sizes
  thumbnailUrl: text("thumbnailUrl"),
  smallUrl: text("smallUrl"),
  mediumUrl: text("mediumUrl"),
  largeUrl: text("largeUrl"),
  // Metadata
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
  accessCount: int("accessCount").default(0),
  lastAccessedAt: timestamp("lastAccessedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FontPreviewCache = typeof fontPreviewCache.$inferSelect;
export type InsertFontPreviewCache = typeof fontPreviewCache.$inferInsert;

/**
 * Font pair favorites table for storing user's favorite font combinations
 */
export const fontPairFavorites = mysqlTable("fontPairFavorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  headingFont: varchar("headingFont", { length: 100 }).notNull(),
  bodyFont: varchar("bodyFont", { length: 100 }).notNull(),
  headingWeight: varchar("headingWeight", { length: 20 }).notNull(),
  bodyWeight: varchar("bodyWeight", { length: 20 }).notNull(),
  headingStyle: varchar("headingStyle", { length: 20 }).notNull(),
  bodyStyle: varchar("bodyStyle", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }),
  description: text("description"),
  usageCount: int("usageCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FontPairFavorite = typeof fontPairFavorites.$inferSelect;
export type InsertFontPairFavorite = typeof fontPairFavorites.$inferInsert;
