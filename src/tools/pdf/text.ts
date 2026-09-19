/**
 * Shared text-extraction and comparison helpers (pdf.js). Used by the
 * PDF Converter, PDF OCR, and Compare PDFs tools.
 */
import { destroyPdfDocument, openPdfDocument } from "./render";

/** Extract the text of every page (best-effort reading order). */
export async function extractPageTexts(file: File): Promise<string[]> {
  const doc = await openPdfDocument(await file.arrayBuffer());
  try {
    const pages: string[] = [];
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
      const page = await doc.getPage(pageNumber);
      const content = await page.getTextContent();
      const rows: { y: number; parts: { x: number; str: string }[] }[] = [];
      for (const raw of content.items) {
        const item = raw as unknown as { str?: string; transform?: number[] };
        const str = (item.str ?? "").trim();
        if (str === "") continue;
        const transform = item.transform ?? [];
        const y = Math.round(transform[5] ?? 0);
        let row = rows.find((candidate) => Math.abs(candidate.y - y) <= 3);
        if (!row) {
          row = { y, parts: [] };
          rows.push(row);
        }
        row.parts.push({ x: transform[4] ?? 0, str });
      }
      rows.sort((a, b) => b.y - a.y);
      pages.push(
        rows
          .map((row) =>
            row.parts
              .sort((a, b) => a.x - b.x)
              .map((part) => part.str)
              .join(" ")
          )
          .join("\n")
      );
    }
    return pages;
  } finally {
    await destroyPdfDocument(doc);
  }
}

export function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
}

/** Jaccard similarity (0–1) between the word sets of two texts. */
export function similarity(a: string, b: string): number {
  const setA = new Set(tokenize(a));
  const setB = new Set(tokenize(b));
  if (setA.size === 0 && setB.size === 0) return 1;
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const token of setA) if (setB.has(token)) intersection += 1;
  const union = setA.size + setB.size - intersection;
  return intersection / union;
}

export function htmlEscape(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}