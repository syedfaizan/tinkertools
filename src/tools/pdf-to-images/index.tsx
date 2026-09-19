"use client";

import { useState } from "react";
import { FileImage, X } from "lucide-react";
import {
  ActionButton,
  ErrorBanner,
  FileDrop,
  MobileActionBar,
  ResultPanel,
  withBarPadding,
  type DownloadTarget,
} from "@/tools/pdf/ui";
import {
  baseName,
  isPdf,
  timestamp,
  zipFiles,
} from "@/tools/pdf/lib";
import {
  canvasToBlob,
  destroyPdfDocument,
  openPdfDocument,
  renderAllPages,
} from "@/tools/pdf/render";
import { formatBytes } from "@/lib/utils";

type Format = "png" | "jpeg";

export function PdfToImages() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<Format>("png");
  const [quality, setQuality] = useState(0.85);
  const [scale, setScale] = useState(2);
  const [working, setWorking] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<DownloadTarget[] | null>(null);
  const [pages, setPages] = useState(0);

  const valid = file !== null && isPdf(file);

  const run = async () => {
    if (!file) return;
    setError(null);
    setWorking(true);
    setProgress({ done: 0, total: 0 });
    let doc: import("pdfjs-dist").PDFDocumentProxy | null = null;
    try {
      doc = await openPdfDocument(await file.arrayBuffer());
      const pages = await renderAllPages(doc, { scale });
      setPages(pages.length);
      setProgress({ done: 0, total: pages.length });
      const ext = format === "png" ? "png" : "jpg";
      const mime: "image/png" | "image/jpeg" =
        format === "png" ? "image/png" : "image/jpeg";
      const entries: { name: string; blob: Blob }[] = [];
      for (const { canvas, page } of pages) {
        const blob = await canvasToBlob(canvas, mime, format === "jpeg" ? quality : undefined);
        entries.push({
          name: `${baseName(file.name)}-page-${page}.${ext}`,
          blob,
        });
        setProgress((prev) => ({ done: (prev?.done ?? 0) + 1, total: pages.length }));
      }
      if (entries.length === 1) {
        setDownloads([
          { name: entries[0].name, blob: entries[0].blob, primary: true },
        ]);
      } else {
        const zipBlob = await zipFiles(entries);
        setDownloads([
          {
            name: `${baseName(file.name)}-images-${timestamp()}.zip`,
            blob: zipBlob,
            primary: true,
          },
        ]);
      }
    } catch (e) {
      console.error("PDF to images failed", e);
      setError("Couldn't convert this PDF. Make sure it's a valid, unencrypted PDF.");
    } finally {
      if (doc) await destroyPdfDocument(doc);
      setWorking(false);
      setProgress(null);
    }
  };

  const reset = () => {
    setDownloads(null);
    setFile(null);
    setError(null);
  };

  if (downloads) {
    return (
      <ResultPanel
        heading="Images are ready!"
        detail={`${pages} page${pages > 1 ? "s" : ""} · ${formatBytes(downloads[0].blob.size)}`}
        downloads={downloads}
        onReset={reset}
        resetLabel="Convert another PDF"
        related="pdf-to-images"
        autoDownload
      />
    );
  }

  const inputCls =
    "rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200";

  return (
    <div className={withBarPadding(valid && !working)}>
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {file ? (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 dark:border-zinc-700">
            <FileImage className="h-5 w-5 shrink-0 text-indigo-500" aria-hidden="true" />
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {file.name}
            </p>
            <span className="shrink-0 text-xs text-zinc-400">{formatBytes(file.size)}</span>
            <button
              type="button"
              onClick={() => setFile(null)}
              aria-label="Remove file"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <FileDrop
            onFiles={(files) => setFile(files[0] ?? null)}
            multiple={false}
            title="Drop a PDF here, or tap to browse"
            hint="Every page becomes an image · rendered locally"
            icon={FileImage}
          />
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Image format
            </span>
            <select
              value={format}
              onChange={(event) => setFormat(event.target.value as Format)}
              className={`${inputCls} mt-2 w-full`}
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Quality
            </span>
            <select
              value={quality}
              onChange={(event) => setQuality(Number(event.target.value))}
              disabled={format === "png"}
              className={`${inputCls} mt-2 w-full disabled:opacity-50`}
            >
              <option value={1}>Highest · 1.0</option>
              <option value={0.85}>High · 0.85</option>
              <option value={0.7}>Balanced · 0.7</option>
              <option value={0.5}>Smaller · 0.5</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Resolution
            </span>
            <select
              value={scale}
              onChange={(event) => setScale(Number(event.target.value))}
              className={`${inputCls} mt-2 w-full`}
            >
              <option value={1}>1× · 72 ppi</option>
              <option value={2}>2× · 144 ppi</option>
              <option value={3}>3× · 216 ppi</option>
            </select>
          </label>
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
              Rendering page {progress.done} of {progress.total}…
            </p>
          </div>
        )}

        {error && <ErrorBanner message={error} />}

        <ActionButton
          className="mt-5 hidden sm:inline-flex"
          onClick={run}
          disabled={!valid}
          busy={working}
          busyLabel="Converting…"
        >
          <FileImage className="h-4 w-4" aria-hidden="true" />
          Convert to images
        </ActionButton>
      </div>

      <MobileActionBar show={valid && !working}>
        <ActionButton onClick={run} disabled={!valid} busy={working} busyLabel="Converting…">
          <FileImage className="h-4 w-4" aria-hidden="true" />
          Convert to images
        </ActionButton>
      </MobileActionBar>
    </div>
  );
}