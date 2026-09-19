"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { FileDown, Layers, X } from "lucide-react";
import {
  ActionButton,
  ErrorBanner,
  FileDrop,
  ResultPanel,
  type DownloadTarget,
} from "@/tools/pdf/ui";
import { baseName, isPdf, pdfBlob } from "@/tools/pdf/lib";
import { formatBytes } from "@/lib/utils";

type ApplyTo = "all" | "first" | "last";

export function PdfOverlay() {
  const [baseFile, setBaseFile] = useState<File | null>(null);
  const [overlayFile, setOverlayFile] = useState<File | null>(null);
  const [applyTo, setApplyTo] = useState<ApplyTo>("all");
  const [opacity, setOpacity] = useState(100);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<DownloadTarget[] | null>(null);

  const valid =
    baseFile !== null && isPdf(baseFile) && overlayFile !== null && isPdf(overlayFile);

  const run = async () => {
    if (!baseFile || !overlayFile) return;
    setError(null);
    setWorking(true);
    try {
      const [baseDoc, overlayDoc] = await Promise.all([
        PDFDocument.load(await baseFile.arrayBuffer(), { ignoreEncryption: false }),
        PDFDocument.load(await overlayFile.arrayBuffer(), { ignoreEncryption: false }),
      ]);
      const overlayPage = overlayDoc.getPage(0);
      const overlayW = overlayPage.getWidth();
      const overlayH = overlayPage.getHeight();
      const embedded = await baseDoc.embedPage(overlayPage);

      const pages = baseDoc.getPages();
      const targets = pages.map((_, index) => index);
      if (applyTo === "first") targets.splice(1);
      if (applyTo === "last") targets.splice(0, targets.length - 1 || 0);

      for (const index of targets) {
        const page = pages[index];
        const { width, height } = page.getSize();
        const scale = Math.min(width / overlayW, height / overlayH);
        const drawW = overlayW * scale;
        const drawH = overlayH * scale;
        page.drawPage(embedded, {
          x: (width - drawW) / 2,
          y: (height - drawH) / 2,
          width: drawW,
          height: drawH,
          opacity: Math.max(0.05, opacity / 100),
        });
      }

      const out = new Uint8Array(await baseDoc.save());
      setDownloads([
        {
          name: `${baseName(baseFile.name)}-overlaid.pdf`,
          blob: pdfBlob(out),
          primary: true,
        },
      ]);
    } catch (e) {
      console.error("Overlay failed", e);
      setError(
        "Couldn't overlay those PDFs. Make sure both are valid, unencrypted PDFs."
      );
    } finally {
      setWorking(false);
    }
  };

  const reset = () => {
    setDownloads(null);
    setBaseFile(null);
    setOverlayFile(null);
    setError(null);
  };

  if (downloads) {
    return (
      <ResultPanel
        heading="Overlay applied!"
        detail={`${overlayFile?.name} stamped on the ${applyTo === "all" ? "whole document" : applyTo + " page"} · ${formatBytes(downloads[0].blob.size)}`}
        downloads={downloads}
        onReset={reset}
        resetLabel="Overlay another PDF"
        related="pdf-overlay"
        autoDownload
      />
    );
  }

  const inputCls =
    "rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200";

  return (
    <div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {baseFile ? (
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 dark:border-zinc-700">
            <FileDown className="h-5 w-5 shrink-0 text-indigo-500" aria-hidden="true" />
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {baseFile.name}
            </p>
            <span className="shrink-0 text-xs text-zinc-400">{formatBytes(baseFile.size)}</span>
            <button
              type="button"
              onClick={() => setBaseFile(null)}
              aria-label="Remove base file"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <FileDrop
            onFiles={(files) => setBaseFile(files[0] ?? null)}
            multiple={false}
            title="Drop the base PDF here, or tap to browse"
            hint="This is the document that receives the overlay"
          />
        )}

        {overlayFile ? (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 dark:border-zinc-700">
            <Layers className="h-5 w-5 shrink-0 text-indigo-500" aria-hidden="true" />
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {overlayFile.name}
            </p>
            <span className="shrink-0 text-xs text-zinc-400">{formatBytes(overlayFile.size)}</span>
            <button
              type="button"
              onClick={() => setOverlayFile(null)}
              aria-label="Remove overlay file"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <FileDrop
            className="mt-3"
            onFiles={(files) => setOverlayFile(files[0] ?? null)}
            multiple={false}
            icon={Layers}
            title="Drop the overlay PDF here, or tap to browse"
            hint="Its first page is stamped on top of the base PDF"
          />
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Apply to
            </span>
            <select
              value={applyTo}
              onChange={(event) => setApplyTo(event.target.value as ApplyTo)}
              className={`${inputCls} mt-2 w-full`}
            >
              <option value="all">Every page</option>
              <option value="first">First page only</option>
              <option value="last">Last page only</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Opacity · {opacity}%
            </span>
            <input
              type="range"
              min={5}
              max={100}
              value={opacity}
              onChange={(event) => setOpacity(Number(event.target.value))}
              className="mt-4 w-full accent-indigo-600"
            />
          </label>
        </div>

        {error && <ErrorBanner message={error} />}

        <ActionButton
          className="mt-5"
          onClick={run}
          disabled={!valid}
          busy={working}
          busyLabel="Overlaying…"
        >
          <Layers className="h-4 w-4" aria-hidden="true" />
          Apply overlay
        </ActionButton>
      </div>
    </div>
  );
}