"use client";

/**
 * Renders one page of a PDF at preview resolution (pdf.js) for the
 * canvas-based tools. Cancels cleanly when the file or page changes.
 * Loading state is derived at render time, so no setState-in-effect.
 */
import { useEffect, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { destroyPdfDocument, openPdfDocument, renderPage, type RenderedPage } from "./render";

export type PreviewState =
  | { status: "idle"; error: null; pageCount: 0; page: null }
  | { status: "loading"; error: null; pageCount: 0; page: null }
  | { status: "error"; error: string; pageCount: 0; page: null }
  | { status: "ready"; error: null; pageCount: number; page: RenderedPage };

export function usePagePreview(
  data: ArrayBuffer | null,
  pageNumber: number,
  maxDim = 880
): PreviewState {
  const [state, setState] = useState<PreviewState>(() =>
    data
      ? { status: "loading", error: null, pageCount: 0, page: null }
      : { status: "idle", error: null, pageCount: 0, page: null }
  );

  // Reset to the right starting state whenever the inputs change
  // (documented "adjusting state during render" pattern).
  const [prev, setPrev] = useState({ data, pageNumber, maxDim });
  if (prev.data !== data || prev.pageNumber !== pageNumber || prev.maxDim !== maxDim) {
    setPrev({ data, pageNumber, maxDim });
    setState(
      data
        ? { status: "loading", error: null, pageCount: 0, page: null }
        : { status: "idle", error: null, pageCount: 0, page: null }
    );
  }

  useEffect(() => {
    if (!data) return;
    let cancelled = false;
    let doc: PDFDocumentProxy | null = null;

    (async () => {
      try {
        doc = await openPdfDocument(data);
        const page = await renderPage(doc, pageNumber, maxDim);
        if (cancelled) return;
        setState({ status: "ready", error: null, pageCount: doc.numPages, page });
      } catch {
        if (!cancelled) {
          setState({ status: "error", error: "Couldn't render this PDF.", pageCount: 0, page: null });
        }
      }
    })();

    return () => {
      cancelled = true;
      if (doc) void destroyPdfDocument(doc);
    };
  }, [data, pageNumber, maxDim]);

  return state;
}