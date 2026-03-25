/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// Content Models
export interface TextBlock {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color: string;
  align: "left" | "center" | "right" | "justify";
}

export interface ImageElement {
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PageContent {
  textBlocks: TextBlock[];
  images: ImageElement[];
}
