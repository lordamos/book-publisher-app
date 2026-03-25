import { eq } from "drizzle-orm";
import { templates } from "../drizzle/schema";
import { getDb } from "./db";
import { BOOK_TEMPLATES, TemplateConfig } from "./templates-data";

export async function initializeTemplates() {
  const db = await getDb();
  if (!db) return;

  try {
    // Check if templates already exist
    const existing = await db.select().from(templates).limit(1);
    if (existing.length > 0) {
      return; // Templates already initialized
    }

    // Insert default templates
    for (const [key, config] of Object.entries(BOOK_TEMPLATES)) {
      await db.insert(templates).values({
        name: config.name,
        genre: config.genre,
        description: config.description,
        coverColor: config.coverColor,
        accentColor: config.accentColor,
        bodyFont: config.bodyFont,
        headingFont: config.headingFont,
        bodyFontSize: config.bodyFontSize,
        headingFontSize: config.headingFontSize,
        lineHeight: config.lineHeight,
        marginTop: config.marginTop,
        marginBottom: config.marginBottom,
        marginLeft: config.marginLeft,
        marginRight: config.marginRight,
        chapterStyle: config.chapterStyle,
        includeTableOfContents: config.includeTableOfContents ? 1 : 0,
        includeFrontMatter: config.includeFrontMatter ? 1 : 0,
        includeBackMatter: config.includeBackMatter ? 1 : 0,
        isPublic: 1,
      });
    }

    console.log("[Templates] Initialized default templates");
  } catch (error) {
    console.error("[Templates] Failed to initialize:", error);
  }
}

export async function getAllTemplates() {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db.select().from(templates).where(eq(templates.isPublic, 1));
    return result;
  } catch (error) {
    console.error("[Templates] Failed to fetch templates:", error);
    return [];
  }
}

export async function getTemplateById(id: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(templates)
      .where(eq(templates.id, id))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Templates] Failed to fetch template:", error);
    return null;
  }
}

export async function getTemplatesByGenre(genre: string) {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select()
      .from(templates)
      .where(eq(templates.genre, genre));
    return result;
  } catch (error) {
    console.error("[Templates] Failed to fetch templates by genre:", error);
    return [];
  }
}

export async function createCustomTemplate(
  userId: number,
  config: TemplateConfig
) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(templates).values({
      name: config.name,
      genre: config.genre,
      description: config.description,
      coverColor: config.coverColor,
      accentColor: config.accentColor,
      bodyFont: config.bodyFont,
      headingFont: config.headingFont,
      bodyFontSize: config.bodyFontSize,
      headingFontSize: config.headingFontSize,
      lineHeight: config.lineHeight,
      marginTop: config.marginTop,
      marginBottom: config.marginBottom,
      marginLeft: config.marginLeft,
      marginRight: config.marginRight,
      chapterStyle: config.chapterStyle,
      includeTableOfContents: config.includeTableOfContents ? 1 : 0,
      includeFrontMatter: config.includeFrontMatter ? 1 : 0,
      includeBackMatter: config.includeBackMatter ? 1 : 0,
      isPublic: 0,
      createdBy: userId,
    });

    return result;
  } catch (error) {
    console.error("[Templates] Failed to create template:", error);
    return null;
  }
}

export async function updateTemplate(id: number, config: Partial<TemplateConfig>) {
  const db = await getDb();
  if (!db) return null;

  try {
    const updateData: any = {};

    if (config.name) updateData.name = config.name;
    if (config.genre) updateData.genre = config.genre;
    if (config.description) updateData.description = config.description;
    if (config.coverColor) updateData.coverColor = config.coverColor;
    if (config.accentColor) updateData.accentColor = config.accentColor;
    if (config.bodyFont) updateData.bodyFont = config.bodyFont;
    if (config.headingFont) updateData.headingFont = config.headingFont;
    if (config.bodyFontSize) updateData.bodyFontSize = config.bodyFontSize;
    if (config.headingFontSize) updateData.headingFontSize = config.headingFontSize;
    if (config.lineHeight) updateData.lineHeight = config.lineHeight;
    if (config.marginTop) updateData.marginTop = config.marginTop;
    if (config.marginBottom) updateData.marginBottom = config.marginBottom;
    if (config.marginLeft) updateData.marginLeft = config.marginLeft;
    if (config.marginRight) updateData.marginRight = config.marginRight;
    if (config.chapterStyle) updateData.chapterStyle = config.chapterStyle;
    if (config.includeTableOfContents !== undefined) {
      updateData.includeTableOfContents = config.includeTableOfContents ? 1 : 0;
    }
    if (config.includeFrontMatter !== undefined) {
      updateData.includeFrontMatter = config.includeFrontMatter ? 1 : 0;
    }
    if (config.includeBackMatter !== undefined) {
      updateData.includeBackMatter = config.includeBackMatter ? 1 : 0;
    }

    const result = await db
      .update(templates)
      .set(updateData)
      .where(eq(templates.id, id));

    return result;
  } catch (error) {
    console.error("[Templates] Failed to update template:", error);
    return null;
  }
}

export async function deleteTemplate(id: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.delete(templates).where(eq(templates.id, id));
    return result;
  } catch (error) {
    console.error("[Templates] Failed to delete template:", error);
    return null;
  }
}
