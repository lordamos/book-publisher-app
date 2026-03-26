import PDFDocument from "pdfkit";
import { Readable } from "stream";

export interface DiffLine {
  type: "add" | "remove" | "context";
  content: string;
  lineNumber: number;
  originalLineNumber?: number;
}

export interface DiffPDFOptions {
  title?: string;
  oldVersion?: string;
  newVersion?: string;
  includeStatistics?: boolean;
  colorScheme?: "light" | "dark";
  pageSize?: "letter" | "a4";
  fontSize?: number;
  showLineNumbers?: boolean;
}

export interface DiffStatistics {
  addedLines: number;
  removedLines: number;
  modifiedLines: number;
  contextLines: number;
  totalChanges: number;
  similarity: number;
}

/**
 * Generate PDF for side-by-side diff
 */
export async function generateDiffPDF(
  oldText: string,
  newText: string,
  options: DiffPDFOptions = {}
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const {
        title = "Version Comparison",
        oldVersion = "Original",
        newVersion = "Modified",
        includeStatistics = true,
        colorScheme = "light",
        pageSize = "letter",
        fontSize = 9,
        showLineNumbers = true,
      } = options;

      // Create PDF document
      const doc = new PDFDocument({
        size: pageSize === "a4" ? "A4" : "Letter",
        margin: 40,
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Set colors based on scheme
      const colors = {
        light: {
          background: "#ffffff",
          text: "#000000",
          add: "#d4edda",
          addText: "#155724",
          remove: "#f8d7da",
          removeText: "#721c24",
          context: "#f5f5f5",
          contextText: "#333333",
          border: "#dddddd",
          header: "#f8f9fa",
          headerText: "#212529",
        },
        dark: {
          background: "#1e1e1e",
          text: "#e0e0e0",
          add: "#1b5e20",
          addText: "#81c784",
          remove: "#b71c1c",
          removeText: "#ef5350",
          context: "#2d2d2d",
          contextText: "#b0b0b0",
          border: "#404040",
          header: "#252525",
          headerText: "#e0e0e0",
        },
      };

      const palette = colors[colorScheme];

      // Title page
      doc.fontSize(24).font("Helvetica-Bold").text(title, { align: "center" });
      doc.moveDown();
      doc.fontSize(12).font("Helvetica").text(`${oldVersion} vs ${newVersion}`, {
        align: "center",
      });
      doc.moveDown();
      doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, {
        align: "center",
      });

      // Calculate statistics
      const stats = computeDiffStatistics(oldText, newText);

      // Add statistics if requested
      if (includeStatistics) {
        doc.addPage();
        doc.fontSize(16).font("Helvetica-Bold").text("Comparison Statistics");
        doc.moveDown();

        const statsData = [
          ["Metric", "Value"],
          ["Additions", stats.addedLines.toString()],
          ["Deletions", stats.removedLines.toString()],
          ["Modifications", stats.modifiedLines.toString()],
          ["Context Lines", stats.contextLines.toString()],
          ["Total Changes", stats.totalChanges.toString()],
          ["Similarity", `${stats.similarity}%`],
        ];

        drawTable(doc, statsData, {
          x: 50,
          y: doc.y,
          width: doc.page.width - 100,
          fontSize,
          palette,
        });

        doc.moveDown(2);
      }

      // Generate diff lines
      const { leftLines, rightLines } = generateDiffLines(oldText, newText);

      // Add diff pages
      doc.addPage();
      doc.fontSize(14).font("Helvetica-Bold").text("Side-by-Side Comparison");
      doc.moveDown();

      const maxLen = Math.max(leftLines.length, rightLines.length);
      const linesPerPage = 30;
      let currentPage = 1;
      let lineCount = 0;

      for (let i = 0; i < maxLen; i++) {
        const leftLine = leftLines[i];
        const rightLine = rightLines[i];

        // Add page break if needed
        if (lineCount >= linesPerPage) {
          doc.addPage();
          doc.fontSize(10).text(`Page ${++currentPage} - Continued`, {
            align: "right",
          });
          doc.moveDown();
          lineCount = 0;
        }

        // Draw diff line
        drawDiffLine(doc, leftLine, rightLine, {
          fontSize,
          showLineNumbers,
          palette,
        });

        lineCount++;
      }

      // Finalize document
      // Note: Page numbering is added during content generation (see line 156)
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate HTML preview for diff
 */
export function generateDiffHTML(
  oldText: string,
  newText: string,
  options: DiffPDFOptions = {}
): string {
  const { title = "Version Comparison", oldVersion = "Original", newVersion = "Modified" } =
    options;

  const { leftLines, rightLines } = generateDiffLines(oldText, newText);

  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: monospace; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
    h1 { text-align: center; color: #333; }
    .versions { text-align: center; color: #666; margin-bottom: 20px; }
    .diff-container { display: flex; gap: 10px; }
    .diff-pane { flex: 1; }
    .diff-pane h3 { background: #f0f0f0; padding: 10px; margin: 0; }
    .diff-lines { border: 1px solid #ddd; }
    .diff-line { display: flex; padding: 5px; border-bottom: 1px solid #eee; font-size: 12px; }
    .line-num { width: 40px; color: #999; padding-right: 10px; text-align: right; user-select: none; }
    .line-content { flex: 1; white-space: pre-wrap; word-break: break-all; }
    .add { background: #d4edda; color: #155724; }
    .remove { background: #f8d7da; color: #721c24; }
    .context { background: #f5f5f5; color: #333; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    <div class="versions">${oldVersion} vs ${newVersion}</div>
    <div class="diff-container">
      <div class="diff-pane">
        <h3>${oldVersion}</h3>
        <div class="diff-lines">`;

  // Add left pane
  for (const line of leftLines) {
    html += `<div class="diff-line ${line.type}">
      <span class="line-num">${line.lineNumber}</span>
      <span class="line-content">${escapeHtml(line.content)}</span>
    </div>`;
  }

  html += `</div>
      </div>
      <div class="diff-pane">
        <h3>${newVersion}</h3>
        <div class="diff-lines">`;

  // Add right pane
  for (const line of rightLines) {
    html += `<div class="diff-line ${line.type}">
      <span class="line-num">${line.lineNumber}</span>
      <span class="line-content">${escapeHtml(line.content)}</span>
    </div>`;
  }

  html += `</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  return html;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Generate diff lines from two texts
 */
function generateDiffLines(oldText: string, newText: string) {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");

  const leftLines: DiffLine[] = [];
  const rightLines: DiffLine[] = [];

  let oldIdx = 0;
  let newIdx = 0;
  let leftLineNum = 1;
  let rightLineNum = 1;

  // Simple diff algorithm
  while (oldIdx < oldLines.length || newIdx < newLines.length) {
    if (oldIdx < oldLines.length && newIdx < newLines.length) {
      if (oldLines[oldIdx] === newLines[newIdx]) {
        // Context line
        leftLines.push({
          type: "context",
          content: oldLines[oldIdx],
          lineNumber: leftLineNum++,
        });
        rightLines.push({
          type: "context",
          content: newLines[newIdx],
          lineNumber: rightLineNum++,
        });
        oldIdx++;
        newIdx++;
      } else {
        // Different lines
        if (oldIdx < oldLines.length) {
          leftLines.push({
            type: "remove",
            content: oldLines[oldIdx],
            lineNumber: leftLineNum++,
          });
          oldIdx++;
        }
        if (newIdx < newLines.length) {
          rightLines.push({
            type: "add",
            content: newLines[newIdx],
            lineNumber: rightLineNum++,
          });
          newIdx++;
        }
      }
    } else if (oldIdx < oldLines.length) {
      leftLines.push({
        type: "remove",
        content: oldLines[oldIdx],
        lineNumber: leftLineNum++,
      });
      oldIdx++;
    } else {
      rightLines.push({
        type: "add",
        content: newLines[newIdx],
        lineNumber: rightLineNum++,
      });
      newIdx++;
    }
  }

  return { leftLines, rightLines };
}

/**
 * Calculate diff statistics - EXPORTED for testing
 */
export function computeDiffStatistics(oldText: string, newText: string): DiffStatistics {
  // Handle empty strings - split returns [''] for empty string, so we need to check
  const oldLines = oldText === "" ? [] : oldText.split("\n");
  const newLines = newText === "" ? [] : newText.split("\n");

  let addedLines = 0;
  let removedLines = 0;
  let modifiedLines = 0;
  let contextLines = 0;

  const maxLen = Math.max(oldLines.length, newLines.length);

  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];

    if (oldLine === undefined) {
      addedLines++;
    } else if (newLine === undefined) {
      removedLines++;
    } else if (oldLine === newLine) {
      contextLines++;
    } else {
      modifiedLines++;
    }
  }

  const totalChanges = addedLines + removedLines + modifiedLines;
  const totalLines = Math.max(oldLines.length, newLines.length);
  const similarity = totalLines === 0 ? 100 : Math.round(
    ((totalLines - totalChanges) / totalLines) * 100
  );

  return {
    addedLines,
    removedLines,
    modifiedLines,
    contextLines,
    totalChanges,
    similarity,
  };
}

/**
 * Draw a diff line in the PDF
 */
function drawDiffLine(
  doc: InstanceType<typeof PDFDocument>,
  leftLine: DiffLine | undefined,
  rightLine: DiffLine | undefined,
  options: {
    fontSize: number;
    showLineNumbers: boolean;
    palette: Record<string, string>;
  }
) {
  const { fontSize, showLineNumbers, palette } = options;
  const lineHeight = fontSize + 2;
  const columnWidth = (doc.page.width - 100) / 2;

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case "add":
        return palette.add;
      case "remove":
        return palette.remove;
      default:
        return palette.context;
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case "add":
        return palette.addText;
      case "remove":
        return palette.removeText;
      default:
        return palette.contextText;
    }
  };

  const startY = doc.y;

  // Left pane
  if (leftLine) {
    doc.rect(50, startY, columnWidth, lineHeight).fill(getBackgroundColor(leftLine.type));
    doc.fillColor(getTextColor(leftLine.type));
    doc.fontSize(fontSize).text(
      `${showLineNumbers ? `${leftLine.lineNumber}: ` : ""}${leftLine.content.substring(0, 50)}`,
      55,
      startY + 2
    );
  }

  // Right pane
  if (rightLine) {
    const rightX = 50 + columnWidth + 5;
    doc
      .rect(rightX, startY, columnWidth, lineHeight)
      .fill(getBackgroundColor(rightLine.type));
    doc.fillColor(getTextColor(rightLine.type));
    doc.fontSize(fontSize).text(
      `${showLineNumbers ? `${rightLine.lineNumber}: ` : ""}${rightLine.content.substring(0, 50)}`,
      rightX + 5,
      startY + 2
    );
  }

  doc.moveDown(1);
}

/**
 * Draw a table in the PDF
 */
function drawTable(
  doc: InstanceType<typeof PDFDocument>,
  data: string[][],
  options: {
    x: number;
    y: number;
    width: number;
    fontSize: number;
    palette: Record<string, string>;
  }
) {
  const { x, y, width, fontSize, palette } = options;
  const cellHeight = fontSize + 4;
  const colWidth = width / data[0].length;

  let currentY = y;

  // Draw header
  const headerRow = data[0];
  for (let i = 0; i < headerRow.length; i++) {
    const cellX = x + i * colWidth;
    doc.rect(cellX, currentY, colWidth, cellHeight).fill(palette.header);
    doc.fillColor(palette.headerText);
    doc.fontSize(fontSize).text(headerRow[i], cellX + 5, currentY + 2, {
      width: colWidth - 10,
    });
  }

  currentY += cellHeight;

  // Draw data rows
  for (let rowIdx = 1; rowIdx < data.length; rowIdx++) {
    const row = data[rowIdx];
    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      const cellX = x + colIdx * colWidth;
      doc.rect(cellX, currentY, colWidth, cellHeight).stroke(palette.border);
      doc.fillColor(palette.text);
      doc.fontSize(fontSize).text(row[colIdx], cellX + 5, currentY + 2, {
        width: colWidth - 10,
      });
    }
    currentY += cellHeight;
  }

  doc.y = currentY;
}
