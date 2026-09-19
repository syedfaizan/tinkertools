/**
 * pdf.js (pdfjs-dist) wrapper for anything that needs to *render* pages:
 * thumbnails, "PDF to images", OCR, compression, signing, redaction, etc.
 *
 * The worker script is loaded from the jsDelivr CDN (pinned to the installed
 * version) instead of being bundled, which keeps every route's JS bundle light.
 * These helpers are only ever called from client components.
 */
import type {
  PDFDocumentProxy,
  PDFPageProxy,
} from "pdfjs-dist";

let workerReady: Promise<void> | null = null;

export async function loadPdfJs(): Promise<typeof import("pdfjs-dist")> {
  if (!workerReady) {
    workerReady = (async () => {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc =
        `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    })();
  }
  await workerReady;
  return import("pdfjs-dist");
}

export async function openPdfDocument(
  data: ArrayBuffer
): Promise<PDFDocumentProxy> {
  const pdfjs = await loadPdfJs();
  const task = pdfjs.getDocument({
    data: new Uint8Array(data).slice().buffer as ArrayBuffer,
  });
  try {
    return await task.promise;
  } catch (error) {
    task.destroy();
    throw error;
  }
}

export async function destroyPdfDocument(doc: PDFDocumentProxy) {
  try {
    await doc.loadingTask.destroy();
  } catch {
    /* noop */
  }
}

export interface RenderedPage {
  page: number; // 1-based page number
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

async function renderPageToCanvas(
  doc: PDFDocumentProxy,
  pageNumber: number,
  scale: number
): Promise<RenderedPage> {
  const page: PDFPageProxy = await doc.getPage(pageNumber);
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  await page.render({ canvas, viewport }).promise;
  return { page: pageNumber, canvas, width: base.width, height: base.height };
}

/** Render a single page (1-based) at a size bounded by `maxDim`. */
export async function renderPage(
  doc: PDFDocumentProxy,
  pageNumber: number,
  maxDim = 780
): Promise<RenderedPage> {
  const page: PDFPageProxy = await doc.getPage(pageNumber);
  const base = page.getViewport({ scale: 1 });
  const scale =
    Math.max(base.width, base.height) > maxDim
      ? maxDim / Math.max(base.width, base.height)
      : 1;
  return renderPageToCanvas(doc, pageNumber, scale);
}

/**
 * Render every page of a PDF as canvases. `maxDim` bounds the longest side,
 * keeping memory reasonable for thumbnail grids and image export.
 */
export async function renderAllPages(
  doc: PDFDocumentProxy,
  opts: { maxDim?: number; scale?: number } = {}
): Promise<RenderedPage[]> {
  const rendered: RenderedPage[] = [];
  const first = await doc.getPage(1);
  const base = first.getViewport({ scale: 1 });
  const scale =
    opts.scale ??
    (opts.maxDim && Math.max(base.width, base.height) > opts.maxDim
      ? opts.maxDim / Math.max(base.width, base.height)
      : 1);
  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
    rendered.push(await renderPageToCanvas(doc, pageNumber, scale));
  }
  return rendered;
}

/** Convenience: full document → PNG data-URLs for thumbnail grids. */
export async function renderThumbs(
  doc: PDFDocumentProxy,
  maxDim = 220
): Promise<{ page: number; url: string }[]> {
  const pages = await renderAllPages(doc, { maxDim });
  return pages.map(({ page, canvas }) => ({
    page,
    url: canvas.toDataURL("image/jpeg", 0.72),
  }));
}

/** Convert a canvas to a Blob (png or jpeg, with optional quality). */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: "image/png" | "image/jpeg",
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not export the rendered image."));
      },
      type,
      quality
    );
  });
}

/**
 * Create a canvas from raw RGBA pixels (used when reconstructing images
 * extracted from PDF XObjects that aren't stored as JPEG).
 */
export function pixelsToPngUrl(
  data: Uint8Array,
  width: number,
  height: number,
  channels: number
): string {
  const rgba = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    const src = i * channels;
    const dst = i * 4;
    if (channels === 4) {
      rgba[dst] = data[src];
      rgba[dst + 1] = data[src + 1];
      rgba[dst + 2] = data[src + 2];
      rgba[dst + 3] = data[src + 3];
    } else if (channels === 3) {
      rgba[dst] = data[src];
      rgba[dst + 1] = data[src + 1];
      rgba[dst + 2] = data[src + 2];
      rgba[dst + 3] = 255;
    } else {
      const gray = data[src];
      rgba[dst] = gray;
      rgba[dst + 1] = gray;
      rgba[dst + 2] = gray;
      rgba[dst + 3] = 255;
    }
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")?.putImageData(
    new ImageData(rgba, width, height),
    0,
    0
  );
  return canvas.toDataURL("image/png");
}