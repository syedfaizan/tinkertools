"use client";

import { useMemo, useRef, useState } from "react";
import { Eraser, FileDown, Move, Pencil, Signature as SignatureIcon, Type, X } from "lucide-react";
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

type Skill = "draw" | "type";
const INK: Record<string, string> = { black: "#1e293b", blue: "#1d4ed8" };

export function SignPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [bytes, setBytes] = useState<ArrayBuffer | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [mode, setMode] = useState<Skill>("draw");
  const [inkColor, setInkColor] = useState(INK.black);
  const [typedName, setTypedName] = useState("");
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<DownloadTarget[] | null>(null);

  const padRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const dragRef = useRef<{ ox: number; oy: number } | null>(null);
  const lastRef = useRef<{ x: number; y: number } | null>(null);

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
    setSignatureUrl(null);
    setPosition(null);
    setPageNumber(1);
    setFile(chosen);
    setBytes(await chosen.arrayBuffer());
  };

  const signatureSize = (base: number): { w: number; h: number } => ({
    w: base * 0.45,
    h: base * 0.45 * 0.32,
  });

  // Default position (bottom-center) once the preview is ready — derived at
  // render time the first time the page preview becomes available.
  const [readyOnce, setReadyOnce] = useState(false);
  if (preview.status === "ready" && !readyOnce) {
    setReadyOnce(true);
    const canvasW = preview.page.canvas.width;
    const canvasH = preview.page.canvas.height;
    const { w, h } = signatureSize(canvasW);
    setPosition({
      x: (canvasW - w) / 2,
      y: canvasH - h - canvasH * 0.07,
    });
  } else if (preview.status !== "ready" && readyOnce) {
    setReadyOnce(false);
  }

  const padPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const pad = padRef.current;
    if (!pad) return { x: 0, y: 0 };
    const rect = pad.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * pad.width,
      y: ((event.clientY - rect.top) / rect.height) * pad.height,
    };
  };

  const handlePadDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const pad = padRef.current;
    if (!pad) return;
    pad.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    const point = padPoint(event);
    lastRef.current = point;
    const ctx = pad.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = inkColor;
    ctx.fill();
  };

  const handlePadMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const pad = padRef.current;
    if (!pad || !drawingRef.current) return;
    const point = padPoint(event);
    const last = lastRef.current;
    const ctx = pad.getContext("2d");
    if (!ctx || !last) return;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(point.x, point.y);
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastRef.current = point;
  };

  const handlePadUp = () => {
    drawingRef.current = false;
    commitPad();
  };

  const commitPad = () => {
    const pad = padRef.current;
    if (!pad) return;
    setSignatureUrl(pad.toDataURL("image/png"));
  };

  const clearPad = () => {
    const pad = padRef.current;
    if (!pad) return;
    pad.getContext("2d")?.clearRect(0, 0, pad.width, pad.height);
    setSignatureUrl(null);
  };

  const applyTypedName = () => {
    const pad = padRef.current;
    if (!pad || typedName.trim() === "") return;
    const ctx = pad.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, pad.width, pad.height);
    ctx.fillStyle = inkColor;
    ctx.font = `italic 600 58px Georgia, 'Times New Roman', serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(typedName.trim(), pad.width / 2, pad.height / 2);
    setSignatureUrl(pad.toDataURL("image/png"));
  };

  const resetMode = (next: Skill) => {
    setMode(next);
    if (next === "draw") {
      clearPad();
      setTypedName("");
    }
  };

  const handleSigDown = (event: React.PointerEvent) => {
    const canvas = overlayRef.current;
    if (!canvas || !position) return;
    try {
      (canvas as HTMLCanvasElement & { setPointerCapture(id: number): void }).setPointerCapture(
        event.pointerId
      );
    } catch {
      /* noop */
    }
    const point = canvasPoint(event, canvas);
    dragRef.current = { ox: point.x - position.x, oy: point.y - position.y };
  };

  const handleSigMove = (event: React.PointerEvent) => {
    const canvas = overlayRef.current;
    if (!canvas || !dragRef.current) return;
    const point = canvasPoint(event, canvas);
    setPosition({
      x: point.x - dragRef.current.ox,
      y: point.y - dragRef.current.oy,
    });
  };

  const handleSigUp = () => {
    dragRef.current = null;
  };

  const run = async () => {
    const canvas = overlayRef.current;
    if (!file || !canvas || preview.status !== "ready") return;
    if (!signatureUrl) {
      setError("Draw or type your signature first.");
      return;
    }
    if (!position) return;
    setError(null);
    setWorking(true);
    try {
      const img = new Image();
      img.src = signatureUrl;
      await img.decode();
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { w, h } = signatureSize(canvas.width);
      ctx.drawImage(img, position.x, position.y, w, h);
      const { blob } = await applyOverlayLayer(
        file,
        pageNumber - 1,
        canvas,
        `${baseName(file.name)}-signed.pdf`
      );
      setDownloads([
        { name: `${baseName(file.name)}-signed.pdf`, blob, primary: true },
      ]);
    } catch (e) {
      console.error("Sign failed", e);
      setError("Couldn't sign this PDF. Make sure it's a valid, unencrypted PDF.");
    } finally {
      setWorking(false);
    }
  };

  const reset = () => {
    setDownloads(null);
    setFile(null);
    setBytes(null);
    setSignatureUrl(null);
    setPosition(null);
    setTypedName("");
    setError(null);
  };

  if (downloads) {
    return (
      <ResultPanel
        heading="Signed!"
        detail={`Page ${pageNumber} · ${formatBytes(downloads[0].blob.size)}`}
        downloads={downloads}
        onReset={reset}
        resetLabel="Sign another PDF"
        related="sign-pdf"
        autoDownload
      />
    );
  }

  const inputCls =
    "rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200";

  const signatureReady = signatureUrl !== null;

  return (
    <div className={withBarPadding(signatureReady && !working)}>
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
            hint="Draw or type your signature, then drag it onto the page"
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
            <div className="mt-4 grid gap-4 lg:grid-cols-[320px_1fr]">
              <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Your signature
                  </p>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setInkColor(INK.black)}
                      aria-label="Black ink"
                      className={cn(
                        "h-6 w-6 rounded-full border-2 border-white shadow-sm dark:border-zinc-900",
                        inkColor === INK.black && "ring-2 ring-indigo-500"
                      )}
                      style={{ backgroundColor: INK.black }}
                    />
                    <button
                      type="button"
                      onClick={() => setInkColor(INK.blue)}
                      aria-label="Blue ink"
                      className={cn(
                        "h-6 w-6 rounded-full border-2 border-white shadow-sm dark:border-zinc-900",
                        inkColor === INK.blue && "ring-2 ring-indigo-500"
                      )}
                      style={{ backgroundColor: INK.blue }}
                    />
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => resetMode("draw")}
                    className={cn(
                      "flex min-h-10 items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-semibold transition-colors",
                      mode === "draw"
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                        : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    )}
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Draw
                  </button>
                  <button
                    type="button"
                    onClick={() => resetMode("type")}
                    className={cn(
                      "flex min-h-10 items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-semibold transition-colors",
                      mode === "type"
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                        : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    )}
                  >
                    <Type className="h-3.5 w-3.5" aria-hidden="true" />
                    Type
                  </button>
                </div>

                <canvas
                  ref={padRef}
                  width={640}
                  height={200}
                  onPointerDown={mode === "draw" ? handlePadDown : undefined}
                  onPointerMove={mode === "draw" ? handlePadMove : undefined}
                  onPointerUp={mode === "draw" ? handlePadUp : undefined}
                  onPointerLeave={mode === "draw" ? handlePadUp : undefined}
                  className="mt-2 h-28 w-full cursor-crosshair rounded-lg border border-dashed border-zinc-300 bg-white touch-none dark:border-zinc-600 dark:bg-zinc-950"
                />

                {mode === "type" && (
                  <div className="mt-2 flex gap-1.5">
                    <input
                      type="text"
                      value={typedName}
                      onChange={(event) => setTypedName(event.target.value)}
                      placeholder="Type your name…"
                      className={`${inputCls} w-full`}
                    />
                    <button
                      type="button"
                      onClick={applyTypedName}
                      disabled={typedName.trim() === ""}
                      className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-40"
                    >
                      Apply
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={clearPad}
                  className="mt-2 inline-flex min-h-9 items-center gap-1.5 px-1 text-xs font-medium text-zinc-400 transition-colors hover:text-red-600"
                >
                  <Eraser className="h-3.5 w-3.5" aria-hidden="true" />
                  Clear signature
                </button>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
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
                  {signatureReady && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
                      <Move className="h-3.5 w-3.5" aria-hidden="true" />
                      Drag the signature to position it
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  <EditorStage
                    bgUrl={bgUrl}
                    overlayRef={overlayRef}
                  >
                    {signatureReady && position && preview.page && (() => {
                      const { w } = signatureSize(preview.page.canvas.width);
                      return (
                        <div
                          onPointerDown={handleSigDown}
                          onPointerMove={handleSigMove}
                          onPointerUp={handleSigUp}
                          onPointerCancel={handleSigUp}
                          className="absolute z-20 cursor-move touch-none"
                          style={{
                            left: `${(position.x / preview.page.canvas.width) * 100}%`,
                            top: `${(position.y / preview.page.canvas.height) * 100}%`,
                            width: `${(w / preview.page.canvas.width) * 100}%`,
                          }}
                        >
                          <img
                            src={signatureUrl}
                            alt="Signature"
                            draggable={false}
                            className="w-full drop-shadow-sm"
                          />
                        </div>
                      );
                    })()}
                  </EditorStage>
                </div>
              </div>
            </div>

            <ActionButton
              className="mt-4 hidden sm:inline-flex"
              onClick={run}
              disabled={!signatureReady}
              busy={working}
              busyLabel="Signing…"
            >
              <SignatureIcon className="h-4 w-4" aria-hidden="true" />
              Apply signature
            </ActionButton>
          </>
        )}
      </div>

      <MobileActionBar show={signatureReady && !working}>
        <ActionButton onClick={run} disabled={!signatureReady} busy={working} busyLabel="Signing…">
          <SignatureIcon className="h-4 w-4" aria-hidden="true" />
          Apply signature
        </ActionButton>
      </MobileActionBar>
    </div>
  );
}