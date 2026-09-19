"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { CircleAlert, FileArchive, X } from "lucide-react";
import {
  ActionButton,
  ErrorBanner,
  FileDrop,
  MobileActionBar,
  ResultPanel,
  withBarPadding,
  type DownloadTarget,
} from "@/tools/pdf/ui";
import { baseName, isPdf, pdfBlob, timestamp } from "@/tools/pdf/lib";
import {
  canvasToBlob,
  destroyPdfDocument,
  openPdfDocument,
  renderAllPages,
} from "@/tools/pdf/render";
import { formatBytes } from "@/lib/utils";

type Quality = "high" | "balanced" | "low";

const QUALITY: Record<Quality, { label: string; scale: number; jpeg: number }> = {
  high: { label: "High quality", scale: 1.5, jpeg: 0.9 },
  balanced: { label: "Balanced", scale: 1, jpeg: 0.7 },
  low: { label: "Small file", scale: 0.7, jpeg: 0.45 },
};

export function CompressPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<Quality>("balanced");
  const [working, setWorking] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<DownloadTarget[] | null>(null);
  const [meta, setMeta] = useState<{ original: number; compressed: number } | null>(null);

  const valid = file !== null && isPdf(file);

  const run = async () => {
    if (!file) return;
    setError(null);
    setWorking(true);
    let doc: import("pdfjs-dist").PDFDocumentProxy | null = null;
    try {
      const before = file.size;
      const setting = QUALITY[quality];
      doc = await openPdfDocument(await file.arrayBuffer());
      const rendered = await renderAllPages(doc, { scale: setting.scale });
      setProgress({ done: 0, total: rendered.length });

      const out = await PDFDocument.create();
      for (const { canvas, width, height } of rendered) {
        const blob = await canvasToBlob(canvas, "image/jpeg", setting.jpeg);
        const image = await out.embedJpg(await blob.arrayBuffer());
        const page = out.addPage([width, height]);
        page.drawImage(image, { x: 0, y: 0, width, height });
        setProgress((prev) => ({ done: (prev?.done ?? 0) + 1, total: rendered.length }));
      }
      const bytes = new Uint8Array(await out.save());
      setMeta({ original: before, compressed: bytes.length });
      setDownloads([
        {
          name: `${baseName(file.name)}-compressed-${timestamp()}.pdf`,
          blob: pdfBlob(bytes),
          primary: true,
        },
      ]);
    } catch (e) {
      console.error("Compress failed", e);
      setError("Couldn't compress this PDF. Make sure it's a valid, unencrypted PDF.");
    } finally {
      if (doc) await destroyPdfDocument(doc);
      setWorking(false);
      setProgress(null);
    }
  };

  const reset = () => {
    setDownloads(null);
    setMeta(null);
    setFile(null);
    setError(null);
  };

  if (downloads && meta) {
    const saved = Math.max(0, meta.original - meta.compressed);
    const ratio =
      meta.original > 0 ? Math.round((1 - meta.compressed / meta.original) * 100) : 0;
    return (
      <ResultPanel
        heading="PDF compressed!"
        detail={`${formatBytes(meta.original)} → ${formatBytes(meta.compressed)} · ${saved > 0 ? `saved ${formatBytes(saved)} (${ratio}% smaller)` : "already well optimized"}`}
        downloads={downloads}
        onReset={reset}
        resetLabel="Compress another PDF"
        related="compress-pdf"
        autoDownload
      />
    );
  }

  return (
    <div className={withBarPadding(valid && !working)}>
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {file ? (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 dark:border-zinc-700">
            <FileArchive className="h-5 w-5 shrink-0 text-indigo-500" aria-hidden="true" />
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
            onFiles={(files) => {
              const chosen = files.find(isPdf);
              if (chosen) {
                setDownloads(null);
                setFile(chosen);
              } else setError("That file isn't a PDF.");
            }}
            multiple={false}
            title="Drop a PDF here, or tap to browse"
            hint="Pages are re-rendered at a lower quality — text becomes an image"
            icon={FileArchive}
          />
        )}

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {(Object.keys(QUALITY) as Quality[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setQuality(option)}
              className={`flex min-h-12 flex-col items-start justify-center gap-0.5 rounded-xl border px-4 text-sm font-medium transition-colors ${
                quality === option
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                  : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              <span>{QUALITY[option].label}</span>
              <span className="text-xs font-normal opacity-70">
                {QUALITY[option].jpeg >= 0.85 ? "Best quality, less saving" : QUALITY[option].jpeg >= 0.6 ? "Good balance" : "Smallest size"}
              </span>
            </button>
          ))}
        </div>

        {progress && (
          <div className="mt-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all"
                style={{
                  width: progress.total > 0 ? `${(progress.done / progress.total) * 100}%` : "0%",
                }}
              />
            </div>
            <p className="mt-1.5 text-xs text-zinc-400">
              Reworking page {progress.done} of {progress.total}…
            </p>
          </div>
        )}

        {error && <ErrorBanner message={error} />}

        <p className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Compression re-renders each page as an image, so the text in the
            result won&apos;t be selectable or searchable. For documents that are
            mostly text this may enlarge the file — “small file” mode helps
            photos.
          </span>
        </p>

        <ActionButton
          className="mt-5 hidden sm:inline-flex"
          onClick={run}
          disabled={!valid}
          busy={working}
          busyLabel="Compressing…"
        >
          <FileArchive className="h-4 w-4" aria-hidden="true" />
          Compress PDF
        </ActionButton>
      </div>

      <MobileActionBar show={valid && !working}>
        <ActionButton onClick={run} disabled={!valid} busy={working} busyLabel="Compressing…">
          <FileArchive className="h-4 w-4" aria-hidden="true" />
          Compress PDF
        </ActionButton>
      </MobileActionBar>
    </div>
  );
}