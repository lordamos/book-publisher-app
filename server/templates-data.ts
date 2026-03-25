/**
 * Pre-designed book templates for different genres
 * Each template includes styling, fonts, colors, and layout preferences
 */

export interface TemplateConfig {
  name: string;
  genre: string;
  description: string;
  coverColor: string;
  accentColor: string;
  bodyFont: string;
  headingFont: string;
  bodyFontSize: number;
  headingFontSize: number;
  lineHeight: string;
  marginTop: string;
  marginBottom: string;
  marginLeft: string;
  marginRight: string;
  chapterStyle: "numbered" | "titled" | "decorated";
  includeTableOfContents: boolean;
  includeFrontMatter: boolean;
  includeBackMatter: boolean;
}

export const BOOK_TEMPLATES: Record<string, TemplateConfig> = {
  romance: {
    name: "Romance",
    genre: "Romance",
    description: "Elegant template for romance novels with soft colors and flowing typography",
    coverColor: "#d4a5a5",
    accentColor: "#c41e3a",
    bodyFont: "Georgia",
    headingFont: "Georgia",
    bodyFontSize: 12,
    headingFontSize: 28,
    lineHeight: "1.6",
    marginTop: "0.75",
    marginBottom: "0.75",
    marginLeft: "0.75",
    marginRight: "0.75",
    chapterStyle: "titled",
    includeTableOfContents: true,
    includeFrontMatter: true,
    includeBackMatter: true,
  },

  mystery: {
    name: "Mystery/Thriller",
    genre: "Mystery",
    description: "Dark and sophisticated template for mystery and thriller novels",
    coverColor: "#1a1a1a",
    accentColor: "#ffd700",
    bodyFont: "Helvetica",
    headingFont: "Helvetica-Bold",
    bodyFontSize: 11,
    headingFontSize: 26,
    lineHeight: "1.5",
    marginTop: "0.75",
    marginBottom: "0.75",
    marginLeft: "0.75",
    marginRight: "0.75",
    chapterStyle: "numbered",
    includeTableOfContents: true,
    includeFrontMatter: true,
    includeBackMatter: true,
  },

  scifi: {
    name: "Science Fiction",
    genre: "Science Fiction",
    description: "Modern, tech-inspired template for science fiction novels",
    coverColor: "#0a0e27",
    accentColor: "#00d9ff",
    bodyFont: "Courier New",
    headingFont: "Helvetica-Bold",
    bodyFontSize: 11,
    headingFontSize: 24,
    lineHeight: "1.5",
    marginTop: "0.75",
    marginBottom: "0.75",
    marginLeft: "0.75",
    marginRight: "0.75",
    chapterStyle: "decorated",
    includeTableOfContents: true,
    includeFrontMatter: true,
    includeBackMatter: true,
  },

  fantasy: {
    name: "Fantasy",
    genre: "Fantasy",
    description: "Ornate template for fantasy novels with rich colors and decorative elements",
    coverColor: "#2d1b3d",
    accentColor: "#d4af37",
    bodyFont: "Georgia",
    headingFont: "Georgia",
    bodyFontSize: 12,
    headingFontSize: 28,
    lineHeight: "1.6",
    marginTop: "1",
    marginBottom: "1",
    marginLeft: "0.75",
    marginRight: "0.75",
    chapterStyle: "decorated",
    includeTableOfContents: true,
    includeFrontMatter: true,
    includeBackMatter: true,
  },

  nonfiction: {
    name: "Non-Fiction",
    genre: "Non-Fiction",
    description: "Clean, professional template for non-fiction and educational books",
    coverColor: "#ffffff",
    accentColor: "#003366",
    bodyFont: "Helvetica",
    headingFont: "Helvetica-Bold",
    bodyFontSize: 11,
    headingFontSize: 22,
    lineHeight: "1.5",
    marginTop: "0.75",
    marginBottom: "0.75",
    marginLeft: "0.75",
    marginRight: "0.75",
    chapterStyle: "numbered",
    includeTableOfContents: true,
    includeFrontMatter: true,
    includeBackMatter: true,
  },

  memoir: {
    name: "Memoir",
    genre: "Memoir",
    description: "Personal and intimate template for memoirs and autobiographies",
    coverColor: "#8b7355",
    accentColor: "#d2b48c",
    bodyFont: "Georgia",
    headingFont: "Georgia",
    bodyFontSize: 12,
    headingFontSize: 26,
    lineHeight: "1.6",
    marginTop: "0.75",
    marginBottom: "0.75",
    marginLeft: "0.75",
    marginRight: "0.75",
    chapterStyle: "titled",
    includeTableOfContents: true,
    includeFrontMatter: true,
    includeBackMatter: true,
  },

  youngadult: {
    name: "Young Adult",
    genre: "Young Adult",
    description: "Vibrant template for young adult fiction with modern styling",
    coverColor: "#ff6b9d",
    accentColor: "#c44569",
    bodyFont: "Helvetica",
    headingFont: "Helvetica-Bold",
    bodyFontSize: 11,
    headingFontSize: 24,
    lineHeight: "1.5",
    marginTop: "0.75",
    marginBottom: "0.75",
    marginLeft: "0.75",
    marginRight: "0.75",
    chapterStyle: "titled",
    includeTableOfContents: true,
    includeFrontMatter: true,
    includeBackMatter: true,
  },

  horror: {
    name: "Horror",
    genre: "Horror",
    description: "Atmospheric template for horror and dark fiction",
    coverColor: "#1a0000",
    accentColor: "#8b0000",
    bodyFont: "Courier New",
    headingFont: "Helvetica-Bold",
    bodyFontSize: 11,
    headingFontSize: 26,
    lineHeight: "1.5",
    marginTop: "0.75",
    marginBottom: "0.75",
    marginLeft: "0.75",
    marginRight: "0.75",
    chapterStyle: "decorated",
    includeTableOfContents: true,
    includeFrontMatter: true,
    includeBackMatter: true,
  },

  poetry: {
    name: "Poetry",
    genre: "Poetry",
    description: "Minimalist template for poetry collections with elegant spacing",
    coverColor: "#f5f5f5",
    accentColor: "#333333",
    bodyFont: "Georgia",
    headingFont: "Georgia",
    bodyFontSize: 12,
    headingFontSize: 20,
    lineHeight: "1.8",
    marginTop: "1",
    marginBottom: "1",
    marginLeft: "1",
    marginRight: "1",
    chapterStyle: "titled",
    includeTableOfContents: false,
    includeFrontMatter: true,
    includeBackMatter: false,
  },

  children: {
    name: "Children's Book",
    genre: "Children",
    description: "Playful template for children's books with large fonts and bright colors",
    coverColor: "#ffb6c1",
    accentColor: "#ff69b4",
    bodyFont: "Helvetica",
    headingFont: "Helvetica-Bold",
    bodyFontSize: 14,
    headingFontSize: 32,
    lineHeight: "1.8",
    marginTop: "1",
    marginBottom: "1",
    marginLeft: "1",
    marginRight: "1",
    chapterStyle: "titled",
    includeTableOfContents: false,
    includeFrontMatter: true,
    includeBackMatter: false,
  },
};

export const GENRE_LIST = Object.keys(BOOK_TEMPLATES).map((key) => ({
  id: key,
  name: BOOK_TEMPLATES[key].name,
  genre: BOOK_TEMPLATES[key].genre,
  description: BOOK_TEMPLATES[key].description,
}));
