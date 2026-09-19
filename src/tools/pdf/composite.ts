"use client";

/**
 * Composes an overlay canvas back onto a page of the original PDF. Used by
 * the Edit / Sign / Redact tools: the overlay canvas is the same aspect
 * ratio as the rendered page, so it scales 1:1 onto the PDF page in points.
 */
import { PDFDocument } from "pdf-lib";

export async function applyOverlayLayer(
  file: File,
  pageIndex: number, // 0-based
  overlayCanvas: HTMLCanvasElement,
  outputName: string
): Promise<{ name: string; blob: Blob; size: number }> {
  const doc = await PDFDocument.load(await file.arrayBuffer(), {
    ignoreEncryption: false,
  });
  const page = doc.getPage(pageIndex);
  const { width, height } = page.getSize();
  const dataUrl = overlayCanvas.toDataURL("image/png");
  const pngBytes = await (await fetch(dataUrl)).arrayBuffer();
  const image = await doc.embedPng(pngBytes);
  page.drawImage(image, { x: 0, y: 0, width, height });
  const bytes = new Uint8Array(await doc.save());
  const blob = new Blob([bytes], { type: "application/pdf" });
  return { name: outputName, blob, size: blob.size };
}