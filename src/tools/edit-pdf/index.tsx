"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FileDown, Highlighter, Pencil, PenTool, Redo2, Square, Undo2, X } from "lucide-react";
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
import { cn, formatBytes } from "@/lib/utils";

type PenColor = "black" | "red" | "blue";
type Tool = "pen" | "highlight" | "text";

const PEN_COLORS: Record<PenColor, string> = {
  black: "#18181b",
  red: "#dc2626",
  blue: "#2563eb",
};
const HIGHLIGHT = "rgba(250, 204, 21, 0.45)";

interface PathShape {
  kind: "path";
  points: { x: number; y: number }[];
  color: string;
  width: number;
  highlight: boolean;
}
interface TextShape {
  kind: "text";
  x: number;
  y: number;
  text: string;
  size: number;
  color: string;
}
type Shape = PathShape | TextShape;

export function EditPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [bytes, setBytes] = useState<ArrayBuffer | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [tool, setTool] = useState<Tool>("pen");
  const [penColor, setPenColor] = useState<PenColor>("black");
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [draftText, setDraftText] = useState<{ x: number; y: number } | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<DownloadTarget[] | null>(null);

  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const pointsRef = useRef<{ x: number; y: number }[]>([]);

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
    setShapes([]);
    setDraftText(null);
    setPageNumber(1);
    setFile(chosen);
    setBytes(await chosen.arrayBuffer());
  };

  // Size the overlay canvas to the rendered page and reset shapes on page/file change.
  useEffect(() => {
    const canvas = overlayRef.current;
    if (!canvas || preview.status !== "ready") return;
    canvas.width = preview.page.canvas.width;
    canvas.height = preview.page.canvas.height;
    setShapes([]);
    setDraftText(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bytes, pageNumber, preview.status]);

  // (Re)draw all committed shapes onto the overlay canvas.
  useEffect(() => {
    const canvas = overlayRef.current;
    if (!canvas || preview.status !== "ready") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const shape of shapes) {
      if (shape.kind === "path") {
        ctx.beginPath();
        shape.points.forEach((point, index) => {
          if (index === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        });
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
      } else {
        ctx.font = `${shape.size}px system-ui, sans-serif`;
        ctx.fillStyle = shape.color;
        ctx.fillText(shape.text, shape.x, shape.y);
      }
    }
  }, [shapes, preview.status, pageNumber]);

  const strokeStyle = (canvas: HTMLCanvasElement): { color: string; width: number; highlight: boolean } => {
    if (tool === "highlight") {
      return { color: HIGHLIGHT, width: Math.max(12, canvas.width / 36), highlight: true };
    }
    return { color: PEN_COLORS[penColor], width: Math.max(3, canvas.width / 170), highlight: false };
  };

  const handlePointerDown = (
    event: React.PointerEvent<HTMLCanvasElement>
  ) => {
    const canvas = overlayRef.current;
    if (!canvas || preview.status !== "ready") return;
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
      /* noop */
    }
    const point = canvasPoint(event, canvas);
    if (tool === "text") {
      setDraftText({ x: point.x, y: point.y });
      return;
    }
    drawingRef.current = true;
    pointsRef.current = [point];
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const style = strokeStyle(canvas);
    ctx.beginPath();
    ctx.arc(point.x, point.y, style.width / 2, 0, Math.PI * 2);
    ctx.fillStyle = style.color;
    ctx.fill();
  };

  const handlePointerMove = (
    event: React.PointerEvent<HTMLCanvasElement>
  ) => {
    const canvas = overlayRef.current;
    if (!canvas || !drawingRef.current) return;
    const point = canvasPoint(event, canvas);
    const last = pointsRef.current[pointsRef.current.length - 1];
    const ctx = canvas.getContext("2d");
    if (!ctx || !last) return;
    const style = strokeStyle(canvas);
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(point.x, point.y);
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    pointsRef.current.push(point);
  };

  const handlePointerUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const canvas = overlayRef.current;
    if (!canvas) return;
    const style = strokeStyle(canvas);
    const points = pointsRef.current;
    pointsRef.current = [];
    if (points.length === 0) return;
    setShapes((prev) => [
      ...prev,
      { kind: "path", points, color: style.color, width: style.width, highlight: style.highlight },
    ]);
  };

  const commitText = (textInput: string) => {
    const canvas = overlayRef.current;
    if (!canvas || !draftText || textInput.trim() === "") return;
    setShapes((prev) => [
      ...prev,
      {
        kind: "text",
        x: draftText.x,
        y: draftText.y,
        text: textInput,
        size: Math.max(12, canvas.width / 30),
        color: "#18181b",
      },
    ]);
    setDraftText(null);
  };

  const run = async () => {
    const canvas = overlayRef.current;
    if (!file || !canvas || preview.status !== "ready") return;
    if (shapes.length === 0) {
      setError("Add something first — draw, highlight or type before saving.");
      return;
    }
    setError(null);
    setWorking(true);
    try {
      const { blob, size } = await applyOverlayLayer(
        file,
        pageNumber - 1,
        canvas,
        `${baseName(file.name)}-edited.pdf`
      );
      setDownloads([{ name: `${baseName(file.name)}-edited.pdf`, blob, primary: true }]);
      void size;
    } catch (e) {
      console.error("Edit PDF failed", e);
      setError("Couldn't save your edits. Make sure the file is a valid, unencrypted PDF.");
    } finally {
      setWorking(false);
    }
  };

  const reset = () => {
    setDownloads(null);
    setFile(null);
    setBytes(null);
    setShapes([]);
    setDraftText(null);
    setError(null);
  };

  if (downloads) {
    return (
      <ResultPanel
        heading="Edits applied!"
        detail={`Page ${pageNumber} · ${formatBytes(downloads[0].blob.size)} (${shapes.length} stroke${shapes.length > 1 ? "s" : ""} added)`}
        downloads={downloads}
        onReset={reset}
        resetLabel="Edit another PDF"
        related="edit-pdf"
        autoDownload
      />
    );
  }

  const toolButton = (value: Tool, label: string, Icon: typeof Pencil) => (
    <button
      type="button"
      onClick={() => setTool(value)}
      aria-pressed={tool === value}
      className={cn(
        "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition-colors",
        tool === value
          ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
          : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );

  const pageNavDisabled = preview.status !== "ready";
  const hasDoodles = shapes.length > 0;

  return (
    <div className={withBarPadding(hasDoodles && !working)}>
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
            hint="Draw, highlight and add text on any page"
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
                  disabled={pageNavDisabled || pageNumber <= 1}
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
                  disabled={pageNavDisabled || pageNumber >= preview.pageCount}
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
                  onClick={() => setShapes((prev) => prev.slice(0, -1))}
                  disabled={!hasDoodles}
                  aria-label="Undo last stroke"
                  className="flex h-11 items-center gap-1.5 rounded-xl border border-zinc-200 px-3 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <Undo2 className="h-4 w-4" aria-hidden="true" />
                  Undo
                </button>
                <button
                  type="button"
                  onClick={() => setShapes([])}
                  disabled={!hasDoodles}
                  aria-label="Clear all"
                  className="flex h-11 items-center gap-1.5 rounded-xl border border-zinc-200 px-3 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <Redo2 className="h-4 w-4" aria-hidden="true" />
                  Clear
                </button>
              </div>
            </div>

            <div className="mt-3 rounded-xl bg-zinc-100 p-3 dark:bg-zinc-950">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Tool
              </p>
              <div className="grid grid-cols-3 gap-2">
                {toolButton("pen", "Pen", Pencil)}
                {toolButton("highlight", "Highlight", Highlighter)}
                {toolButton("text", "Type", PenTool)}
              </div>
              {tool !== "highlight" && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    {tool === "pen" ? "Ink" : "Text color"}
                  </span>
                  <span className="flex gap-1.5">
                    {(Object.keys(PEN_COLORS) as PenColor[]).map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setPenColor(color)}
                        aria-label={`${color} ink`}
                        style={{ backgroundColor: PEN_COLORS[color] }}
                        className={cn(
                          "h-8 w-8 rounded-full border-2 border-white shadow-sm transition-transform dark:border-zinc-900",
                          penColor === color ? "scale-110 ring-2 ring-indigo-500" : "hover:scale-105"
                        )}
                      />
                    ))}
                  </span>
                  <span className="ml-auto text-xs text-zinc-400">
                    {tool === "text" ? "Tap the page to place text" : "Draw directly on the page"}
                  </span>
                </div>
              )}
              {tool === "highlight" && (
                <p className="mt-3 text-xs text-zinc-400">Drag across text to mark it yellow.</p>
              )}
            </div>

            <div className="mt-4">
              <EditorStage
                bgUrl={bgUrl}
                overlayRef={overlayRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                {draftText && (
                  <input
                    autoFocus
                    placeholder="Type…"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") commitText((event.target as HTMLInputElement).value);
                      if (event.key === "Escape") setDraftText(null);
                    }}
                    onBlur={(event) => commitText(event.target.value)}
                    className="absolute z-20 rounded-lg border border-indigo-400 bg-white px-2 py-1 text-sm text-zinc-800 shadow-md dark:bg-zinc-900 dark:text-zinc-200"
                    style={{
                      left: `${(draftText.x / preview.page.canvas.width) * 100}%`,
                      top: `${(draftText.y / preview.page.canvas.height) * 100}%`,
                    }}
                  />
                )}
              </EditorStage>
              <p className="mt-2 text-xs text-zinc-400">
                Changes apply to page {pageNumber}. Save to download the edited PDF.
              </p>
            </div>

            <ActionButton
              className="mt-4 hidden sm:inline-flex"
              onClick={run}
              disabled={!hasDoodles}
              busy={working}
              busyLabel="Saving edits…"
            >
              <Square className="h-4 w-4" aria-hidden="true" />
              Save edited PDF
            </ActionButton>
          </>
        )}
      </div>

      <MobileActionBar show={hasDoodles && !working}>
        <ActionButton onClick={run} disabled={!hasDoodles} busy={working} busyLabel="Saving…">
          <Square className="h-4 w-4" aria-hidden="true" />
          Save edited PDF
        </ActionButton>
      </MobileActionBar>
    </div>
  );
}