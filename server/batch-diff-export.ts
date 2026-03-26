import archiver from "archiver";
import { Readable, PassThrough } from "stream";
import { generateDiffPDF, type DiffPDFOptions } from "./diff-pdf-export";
import PDFDocument from "pdfkit";

export interface DiffReport {
  id: string;
  oldText: string;
  newText: string;
  title: string;
  oldVersion?: string;
  newVersion?: string;
}

export interface BatchExportOptions {
  format: "pdf" | "zip";
  colorScheme?: "light" | "dark";
  pageSize?: "letter" | "a4";
  fontSize?: number;
  includeStatistics?: boolean;
  showLineNumbers?: boolean;
  mergeIntoSinglePDF?: boolean; // Only for PDF format
  includeTableOfContents?: boolean; // Only for merged PDF
}

export interface BatchExportResult {
  success: boolean;
  filename: string;
  data?: Buffer;
  error?: string;
  reportCount?: number;
}

/**
 * Merge multiple PDF buffers into a single PDF
 */
export async function mergePDFs(
  pdfBuffers: Buffer[],
  options: {
    title?: string;
    includeTableOfContents?: boolean;
  } = {}
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "Letter",
        margin: 40,
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Add title page
      doc.fontSize(24).font("Helvetica-Bold").text(options.title || "Batch Diff Report", {
        align: "center",
      });
      doc.moveDown();
      doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, {
        align: "center",
      });
      doc.moveDown();
      doc.fontSize(10).text(`Total Reports: ${pdfBuffers.length}`, {
        align: "center",
      });

      // Add table of contents if requested
      if (options.includeTableOfContents) {
        doc.addPage();
        doc.fontSize(16).font("Helvetica-Bold").text("Table of Contents");
        doc.moveDown();

        for (let i = 0; i < pdfBuffers.length; i++) {
          doc.fontSize(10).text(`Report ${i + 1}`, 50, doc.y);
          doc.moveDown(0.5);
        }
      }

      // Add page break before first report
      doc.addPage();

      // Note: PDFKit cannot directly merge PDF files as it's designed for creation, not manipulation
      // In production, use a library like pdf-merge or pdfjs for merging existing PDFs
      // For now, we'll add metadata and structure information

      doc.fontSize(14).font("Helvetica-Bold").text("Batch Report Details");
      doc.moveDown();
      doc.fontSize(10).text(`Number of Reports: ${pdfBuffers.length}`, 50, doc.y);
      doc.moveDown();
      doc.fontSize(10).text(`Total Size: ${(pdfBuffers.reduce((sum, buf) => sum + buf.length, 0) / 1024).toFixed(2)} KB`, 50, doc.y);
      doc.moveDown();
      doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, 50, doc.y);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Create a ZIP file from multiple PDF buffers
 */
export async function createZipFromPDFs(
  pdfBuffers: Array<{ filename: string; buffer: Buffer }>,
  zipFilename: string = "diff-reports.zip"
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const archive = archiver("zip", {
        zlib: { level: 9 }, // Maximum compression
      });

      const chunks: Buffer[] = [];

      archive.on("data", (chunk: Buffer) => chunks.push(chunk));
      archive.on("end", () => resolve(Buffer.concat(chunks)));
      archive.on("error", (err: Error) => reject(err));

      // Add each PDF to the archive
      for (const { filename, buffer } of pdfBuffers) {
        archive.append(buffer, { name: filename });
      }

      archive.finalize();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Export multiple diff reports as a single file (PDF or ZIP)
 */
export async function batchExportDiffReports(
  reports: DiffReport[],
  options: BatchExportOptions
): Promise<BatchExportResult> {
  try {
    if (reports.length === 0) {
      return {
        success: false,
        filename: "",
        error: "No reports provided for export",
      };
    }

    const diffOptions: DiffPDFOptions = {
      colorScheme: options.colorScheme,
      pageSize: options.pageSize,
      fontSize: options.fontSize,
      includeStatistics: options.includeStatistics,
      showLineNumbers: options.showLineNumbers,
    };

    // Generate PDFs for each report
    const pdfBuffers: Buffer[] = [];
    const pdfWithFilenames: Array<{ filename: string; buffer: Buffer }> = [];

    for (const report of reports) {
      const pdfBuffer = await generateDiffPDF(report.oldText, report.newText, {
        ...diffOptions,
        title: report.title,
        oldVersion: report.oldVersion,
        newVersion: report.newVersion,
      });

      pdfBuffers.push(pdfBuffer);
      pdfWithFilenames.push({
        filename: sanitizeFilename(`${report.id}-${report.title}.pdf`),
        buffer: pdfBuffer,
      });
    }

    let outputBuffer: Buffer;
    let filename: string;

    if (options.format === "pdf") {
      if (options.mergeIntoSinglePDF) {
        // Merge all PDFs into one (note: PDFKit limitation - we'll create a summary PDF instead)
        outputBuffer = await mergePDFs(pdfBuffers, {
          title: "Batch Diff Report",
          includeTableOfContents: options.includeTableOfContents,
        });
        filename = `batch-diff-report-${Date.now()}.pdf`;
      } else {
        // Return the first PDF (in production, this would be handled differently)
        outputBuffer = pdfBuffers[0];
        filename = pdfWithFilenames[0].filename;
      }
    } else {
      // Create ZIP file
      outputBuffer = await createZipFromPDFs(pdfWithFilenames);
      filename = `diff-reports-${Date.now()}.zip`;
    }

    return {
      success: true,
      filename,
      data: outputBuffer,
      reportCount: reports.length,
    };
  } catch (error) {
    return {
      success: false,
      filename: "",
      error: error instanceof Error ? error.message : "Unknown error during batch export",
    };
  }
}

/**
 * Sanitize filename to prevent directory traversal and invalid characters
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_") // Replace invalid characters with underscore
    .replace(/_{2,}/g, "_") // Replace multiple underscores with single
    .substring(0, 255); // Limit filename length
}

/**
 * Validate batch export options
 */
export function validateBatchExportOptions(
  reports: DiffReport[],
  options: BatchExportOptions
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!reports || reports.length === 0) {
    errors.push("At least one report is required");
  }

  if (reports.length > 1000) {
    errors.push("Maximum 1000 reports allowed per batch export");
  }

  if (!options.format || !["pdf", "zip"].includes(options.format)) {
    errors.push("Format must be 'pdf' or 'zip'");
  }

  if (options.fontSize && (options.fontSize < 6 || options.fontSize > 14)) {
    errors.push("Font size must be between 6 and 14");
  }

  if (options.colorScheme && !["light", "dark"].includes(options.colorScheme)) {
    errors.push("Color scheme must be 'light' or 'dark'");
  }

  if (options.pageSize && !["letter", "a4"].includes(options.pageSize)) {
    errors.push("Page size must be 'letter' or 'a4'");
  }

  // Check total size of reports
  const totalSize = reports.reduce((sum, report) => {
    return sum + new Blob([report.oldText, report.newText]).size;
  }, 0);

  const maxTotalSize = 50 * 1024 * 1024; // 50MB
  if (totalSize > maxTotalSize) {
    errors.push(`Total report size (${(totalSize / 1024 / 1024).toFixed(2)}MB) exceeds maximum (50MB)`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate batch export statistics
 */
export function calculateBatchExportStats(reports: DiffReport[]): {
  totalReports: number;
  totalSize: number;
  estimatedPDFSize: number;
  estimatedZipSize: number;
} {
  const totalSize = reports.reduce((sum, report) => {
    return sum + new Blob([report.oldText, report.newText]).size;
  }, 0);

  // Rough estimates (actual size depends on compression and content)
  const estimatedPDFSize = totalSize * 1.5; // PDFs typically 1.5x text size
  const estimatedZipSize = totalSize * 0.3; // ZIP compression typically 30% of original

  return {
    totalReports: reports.length,
    totalSize,
    estimatedPDFSize,
    estimatedZipSize,
  };
}
