/**
 * List and hyperlink formatting utilities
 */

export interface ListFormat {
  type: "none" | "bullet" | "numbered";
  level: number;
}

/**
 * Apply list formatting
 */
export function applyListFormat(type: "bullet" | "numbered") {
  if (type === "bullet") {
    document.execCommand("insertUnorderedList", false);
  } else if (type === "numbered") {
    document.execCommand("insertOrderedList", false);
  }
}

/**
 * Detect current list formatting
 */
export function detectListFormat(): ListFormat {
  const isBulletList = document.queryCommandState("insertUnorderedList");
  const isNumberedList = document.queryCommandState("insertOrderedList");

  if (isBulletList) {
    return { type: "bullet", level: 0 };
  } else if (isNumberedList) {
    return { type: "numbered", level: 0 };
  }

  return { type: "none", level: 0 };
}

/**
 * Increase list indentation
 */
export function increaseListIndent() {
  document.execCommand("indent", false);
}

/**
 * Decrease list indentation
 */
export function decreaseListIndent() {
  document.execCommand("outdent", false);
}

/**
 * Insert hyperlink
 */
export function insertHyperlink(url: string, text: string) {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    return;
  }

  // If URL is empty, remove the link
  if (!url) {
    document.execCommand("unlink", false);
    return;
  }

  // Create a link element
  const range = selection.getRangeAt(0);
  const link = document.createElement("a");
  link.href = url;
  link.textContent = text;
  link.target = "_blank"; // Open in new tab
  link.rel = "noopener noreferrer"; // Security

  try {
    range.deleteContents();
    range.insertNode(link);
    selection.removeAllRanges();
  } catch (error) {
    console.error("Failed to insert hyperlink:", error);
    // Fallback to execCommand
    document.execCommand("createLink", false, url);
  }
}

/**
 * Detect if current selection is a hyperlink
 */
export function detectHyperlink(): { url: string; text: string } | null {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);
  const commonAncestor = range.commonAncestorContainer;
  const element =
    commonAncestor.nodeType === Node.TEXT_NODE
      ? (commonAncestor.parentElement as HTMLElement)
      : (commonAncestor as HTMLElement);

  if (!element) return null;

  // Find the closest anchor tag
  const link = element.closest("a");
  if (link && link instanceof HTMLAnchorElement) {
    return {
      url: link.href,
      text: link.textContent || "",
    };
  }

  return null;
}

/**
 * Remove hyperlink from selection
 */
export function removeHyperlink() {
  document.execCommand("unlink", false);
}

/**
 * Check if current selection is a hyperlink
 */
export function isHyperlink(): boolean {
  return detectHyperlink() !== null;
}

/**
 * Check if list formatting is active
 */
export function isListActive(): boolean {
  const isBulletList = document.queryCommandState("insertUnorderedList");
  const isNumberedList = document.queryCommandState("insertOrderedList");
  return isBulletList || isNumberedList;
}

/**
 * Toggle list format
 */
export function toggleListFormat(type: "bullet" | "numbered") {
  const currentFormat = detectListFormat();

  // If same type is active, turn it off
  if (currentFormat.type === type) {
    applyListFormat(type);
  } else {
    // Switch to new type
    applyListFormat(type);
  }
}

/**
 * Get list items from current selection
 */
export function getListItems(): string[] {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    return [];
  }

  const range = selection.getRangeAt(0);
  const commonAncestor = range.commonAncestorContainer;
  const element =
    commonAncestor.nodeType === Node.TEXT_NODE
      ? (commonAncestor.parentElement as HTMLElement)
      : (commonAncestor as HTMLElement);

  if (!element) return [];

  // Find the list container
  const list = element.closest("ul, ol");
  if (!list) return [];

  // Get all list items
  const items = Array.from(list.querySelectorAll("li")).map((li) => li.textContent || "");
  return items;
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): boolean {
  if (!url) return false;

  // Allow relative URLs
  if (url.startsWith("/") || url.startsWith("#")) {
    return true;
  }

  // Validate absolute URLs
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Normalize URL (add https:// if missing)
 */
export function normalizeUrl(url: string): string {
  if (!url) return "";

  // Already has protocol
  if (url.match(/^https?:\/\//)) {
    return url;
  }

  // Relative URL or anchor
  if (url.startsWith("/") || url.startsWith("#")) {
    return url;
  }

  // Add https:// by default
  return `https://${url}`;
}
