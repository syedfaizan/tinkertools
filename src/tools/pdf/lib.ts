/**
 * Shared, dependency-light PDF helpers used across the PDF tool kit.
 * Everything here runs client-side — files never leave the device.
 */
import { PDFDocument } from "pdf-lib";

export function isPdf(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Strip the file extension from a name for building output names. */
export function baseName(name: string): string {
  return name.replace(/\.pdf$/i, "").replace(/\.[^.]+$/, "");
}

export function timestamp(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Trigger a browser download for a blob. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Give the browser a moment to start the download before revoking.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Package several blobs into a single .zip (jszip loaded on demand). */
export async function zipFiles(
  entries: { name: string; blob: Blob }[]
): Promise<Blob> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  for (const entry of entries) zip.file(entry.name, entry.blob);
  return zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}

export const PDF_MIME = "application/pdf";

/** Wrap raw bytes in a Blob (copies into a fresh ArrayBuffer so the
 * `Uint8Array<ArrayBufferLike>` generics never leak into `BlobPart`). */
export function bytesToBlob(bytes: Uint8Array, type: string): Blob {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy.buffer], { type });
}

export function pdfBlob(bytes: Uint8Array): Blob {
  return bytesToBlob(bytes, PDF_MIME);
}

/**
 * Load a PDF with pdf-lib, surfacing the common defeaters as friendly
 * typed errors. pdf-lib cannot decrypt protected files, so encrypted
 * documents surface as "encrypted" (use the unlock tool for those).
 */
export async function loadPdfBytes(bytes: ArrayBuffer): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(bytes, { ignoreEncryption: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/encrypted/i.test(message)) throw new Error("encrypted");
    throw new Error("invalid");
  }
}

/** Convert a file (that is already an ArrayBuffer) and load it. */
export async function openPdfFromFile(file: {
  arrayBuffer(): Promise<ArrayBuffer>;
}): Promise<{ doc: PDFDocument; bytes: ArrayBuffer }> {
  const bytes = await file.arrayBuffer();
  const doc = await loadPdfBytes(bytes);
  return { doc, bytes };
}

/** Friendly, human-readable reason for a load failure from loadPdfBytes. */
export function pdfLoadErrorMessage(kind: string): string {
  switch (kind) {
    case "encrypted":
      return "This PDF is password-protected. Unlock it before using this tool.";
    case "invalid":
    default:
      return "That doesn't look like a valid, unencrypted PDF. Try another file.";
  }
}