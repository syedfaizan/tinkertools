"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CircleOff, FileDown, Redo2, Undo2, X } from "lucide-react";
import {
  ActionButton,
  ErrorBanner,
  FileDrop,
  MobileActionBar,
  ResultPanel,
  withBarPadding,
  type DownloadTarget,
} from "@/tools/pdf/ui";
import { EditorStage, canvasPoint } from "@/tools/pdf/Editor";
import { usePagePreview } from "@/tools/pdf/preview";
import { applyOverlayLayer } from "@/tools/pdf/composite";
import { baseName, isPdf } from "@/tools/pdf/lib";
import { formatBytes } from "@/lib/utils";

interface RedactRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function RedactPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [bytes, setBytes] = useState<ArrayBuffer | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [rects, setRects] = useState<RedactRect[]>([]);
  const [live, setLive] = useState<RedactRect | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<DownloadTarget[] | null>(null);

  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const preview = usePagePreview(bytes, pageNumber);

  const bgUrl = useMemo(
    () =>
      preview.status === "ready"
        ? preview.page.canvas.toDataURL("image/jpeg", 0.9)
        : null,
    [preview]
  );

  const addFile = async (files: File[]) => {
    const chosen = files.find(isPdf);
    if (!chosen) {
      setError("That file isn't a PDF.");
      return;
    }
    setError(null);
    setDownloads(null);
    setRects([]);
    setLive(null);
    setPageNumber(1);
    setFile(chosen);
    setBytes(await chosen.arrayBuffer());
  };

  useEffect(() => {
    const canvas = overlayRef.current;
    if (!canvas || preview.status !== "ready") return;
    canvas.width = preview.page.canvas.width;
    canvas.height = preview.page.canvas.height;
    setRects([]);
    setLive(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bytes, pageNumber, preview.status]);

  useEffect(() => {
    const canvas = overlayRef.current;
    if (!canvas || preview.status !== "ready") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    for (const rect of rects) ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    if (live) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.fillRect(live.x, live.y, live.w, live.h);
      ctx.strokeStyle = "#000000";
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 1.5;
      ctx.strokeRect(live.x, live.y, live.w, live.h);
      ctx.setLineDash([]);
    }
  }, [rects, live, preview.status, pageNumber]);

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = overlayRef.current;
    if (!canvas || preview.status !== "ready") return;
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
      /* noop */
    }
    const point = canvasPoint(event, canvas);
    drawingRef.current = true;
    startRef.current = point;
    setLive({ x: point.x, y: point.y, w: 0, h: 0 });
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = overlayRef.current;
    if (!canvas || !drawingRef.current || !startRef.current) return;
    const point = canvasPoint(event, canvas);
    const start = startRef.current;
    setLive({
      x: Math.min(start.x, point.x),
      y: Math.min(start.y, point.y),
      w: Math.abs(point.x - start.x),
      h: Math.abs(point.y - start.y),
    });
  };

  const handlePointerUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    startRef.current = null;
    if (!live) return;
    if (live.w > 4 && live.h > 4) setRects((prev) => [...prev, live]);
    setLive(null);
  };

  const run = async () => {
    const canvas = overlayRef.current;
    if (!file || !canvas || preview.status !== "ready") return;
    if (rects.length === 0) {
      setError("Drag over the content you want to black out first.");
      return;
    }
    setError(null);
    setWorking(true);
    try {
      // Rectangles are drawn opaque black on the overlay, then composited.
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#000000";
      for (const rect of rects) ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      const { blob } = await applyOverlayLayer(
        file,
        pageNumber - 1,
        canvas,
        `${baseName(file.name)}-redacted.pdf`
      );
      setDownloads([
        { name: `${baseName(file.name)}-redacted.pdf`, blob, primary: true },
      ]);
    } catch (e) {
      console.error("Redact failed", e);
      setError("Couldn't redact this PDF. Make sure it's a valid, unencrypted PDF.");
    } finally {
      setWorking(false);
    }
  };

  const reset = () => {
    setDownloads(null);
    setFile(null);
    setBytes(null);
    setRects([]);
    setLive(null);
    setError(null);
  };

  if (downloads) {
    return (
      <ResultPanel
        heading="Sensitive content blacked out!"
        detail={`${rects.length} region${rects.length > 1 ? "s" : ""} redacted on page ${pageNumber} · ${formatBytes(downloads[0].blob.size)}`}
        downloads={downloads}
        onReset={reset}
        resetLabel="Redact another PDF"
        related="redact-pdf"
        autoDownload
      />
    );
  }

  const hasRects = rects.length > 0;

  return (
    <div className={withBarPadding(hasRects && !working)}>
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {file ? (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 dark:border-zinc-700">
            <FileDown className="h-5 w-5 shrink-0 text-indigo-500" aria-hidden="true" />
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {file.name}
            </p>
            <span className="shrink-0 text-xs text-zinc-400">{formatBytes(file.size)}</span>
            <button
              type="button"
              onClick={reset}
              aria-label="Remove file"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <FileDrop
            onFiles={(incoming) => void addFile(incoming)}
            multiple={false}
            title="Drop a PDF here, or tap to browse"
            hint="Drag over names, numbers or text to black them out"
          />
        )}

        {preview.status === "loading" && (
          <p className="mt-4 animate-pulse text-sm text-zinc-400">Rendering page preview…</p>
        )}
        {preview.status === "error" && (
          <ErrorBanner message="Couldn't render this PDF. Try a different file." />
        )}
        {error && preview.status !== "error" && <ErrorBanner message={error} />}

        {preview.status === "ready" && preview.page && (
          <>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
                  aria-label="Previous page"
                  className="flex h-11 items-center rounded-xl border border-zinc-200 px-3 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  ←
                </button>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  Page{" "}
                  <select
                    value={pageNumber}
                    onChange={(event) => setPageNumber(Number(event.target.value))}
                    className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                  >
                    {Array.from({ length: preview.pageCount }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>{" "}
                  of {preview.pageCount}
                </span>
                <button
                  type="button"
                  disabled={pageNumber >= preview.pageCount}
                  onClick={() => setPageNumber((prev) => Math.min(preview.pageCount, prev + 1))}
                  aria-label="Next page"
                  className="flex h-11 items-center rounded-xl border border-zinc-200 px-3 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  →
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRects((prev) => prev.slice(0, -1))}
                  disabled={!hasRects}
                  aria-label="Undo last redaction"
                  className="flex h-11 items-center gap-1.5 rounded-xl border border-zinc-200 px-3 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <Undo2 className="h-4 w-4" aria-hidden="true" />
                  Undo
                </button>
                <button
                  type="button"
                  onClick={() => setRects([])}
                  disabled={!hasRects}
                  aria-label="Clear all redactions"
                  className="flex h-11 items-center gap-1.5 rounded-xl border border-zinc-200 px-3 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <Redo2 className="h-4 w-4" aria-hidden="true" />
                  Clear
                </button>
              </div>
            </div>

            <div className="mt-3">
              <EditorStage
                bgUrl={bgUrl}
                overlayRef={overlayRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              />
              <p className="mt-2 text-xs text-zinc-400">
                Drag to draw black boxes. Redactions apply to page {pageNumber}.
              </p>
            </div>

            <ActionButton
              className="mt-4 hidden sm:inline-flex"
              onClick={run}
              disabled={!hasRects}
              busy={working}
              busyLabel="Redacting…"
            >
              <CircleOff className="h-4 w-4" aria-hidden="true" />
              Apply redactions
            </ActionButton>
          </>
        )}
      </div>

      <MobileActionBar show={hasRects && !working}>
        <ActionButton onClick={run} disabled={!hasRects} busy={working} busyLabel="Redacting…">
          <CircleOff className="h-4 w-4" aria-hidden="true" />
          Apply redactions
        </ActionButton>
      </MobileActionBar>
    </div>
  );
}