"use client";

/**
 * Renders a PDF's pages as thumbnails with pdf.js. Used by every tool that
 * needs page previews (rotate, remove/extract/rearrange pages, …).
 *
 * The hook cancels cleanly when the file changes or the component unmounts.
 * Loading state is derived at render time, so no setState-in-effect.
 */
import { useEffect, useState } from "react";
import { destroyPdfDocument, openPdfDocument, renderThumbs } from "./render";

export interface PdfThumb {
  page: number; // 1-based
  url: string;
}

export type ThumbState =
  | { status: "idle"; error: null; pageCount: 0; thumbs: [] }
  | { status: "loading"; error: null; pageCount: 0; thumbs: [] }
  | { status: "error"; error: string; pageCount: 0; thumbs: [] }
  | { status: "ready"; error: null; pageCount: number; thumbs: PdfThumb[] };

export function useThumbs(
  data: ArrayBuffer | null,
  maxDim = 220,
  keys?: string
): ThumbState {
  const [state, setState] = useState<ThumbState>(() =>
    data
      ? { status: "loading", error: null, pageCount: 0, thumbs: [] }
      : { status: "idle", error: null, pageCount: 0, thumbs: [] }
  );

  // Reset to the right starting state whenever the inputs change
  // (documented "adjusting state during render" pattern).
  const [prev, setPrev] = useState({ data, maxDim, keys });
  if (prev.data !== data || prev.maxDim !== maxDim || prev.keys !== keys) {
    setPrev({ data, maxDim, keys });
    setState(
      data
        ? { status: "loading", error: null, pageCount: 0, thumbs: [] }
        : { status: "idle", error: null, pageCount: 0, thumbs: [] }
    );
  }

  useEffect(() => {
    if (!data) return;
    let cancelled = false;
    let doc: import("pdfjs-dist").PDFDocumentProxy | null = null;

    (async () => {
      try {
        doc = await openPdfDocument(data);
        const thumbs = await renderThumbs(doc, maxDim);
        if (cancelled) return;
        setState({
          status: "ready",
          error: null,
          pageCount: doc.numPages,
          thumbs,
        });
      } catch {
        if (!cancelled) {
          setState({ status: "error", error: "Could not render this PDF.", pageCount: 0, thumbs: [] });
        }
      }
    })();

    return () => {
      cancelled = true;
      if (doc) void destroyPdfDocument(doc);
    };
  }, [data, maxDim, keys]);

  return state;
}