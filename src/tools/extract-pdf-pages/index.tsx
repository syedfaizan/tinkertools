"use client";

import { useMemo, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { CircleCheck, FileDown, FileOutput, X } from "lucide-react";
import {
  ActionButton,
  ErrorBanner,
  FileDrop,
  MobileActionBar,
  ResultPanel,
  withBarPadding,
  type DownloadTarget,
} from "@/tools/pdf/ui";
import { PageCard } from "@/tools/pdf/PageCard";
import { useThumbs } from "@/tools/pdf/useThumbs";
import { baseName, isPdf, pdfBlob } from "@/tools/pdf/lib";
import { formatBytes } from "@/lib/utils";

export function ExtractPdfPages() {
  const [file, setFile] = useState<File | null>(null);
  const [bytes, setBytes] = useState<ArrayBuffer | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<DownloadTarget[] | null>(null);

  const thumbs = useThumbs(bytes);

  const addFile = async (files: File[]) => {
    const chosen = files.find(isPdf);
    if (!chosen) {
      setError("That file isn't a PDF.");
      return;
    }
    setError(null);
    setDownloads(null);
    setSelected(new Set());
    setFile(chosen);
    setBytes(await chosen.arrayBuffer());
  };

  const toggle = (page: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(page)) next.delete(page);
      else next.add(page);
      return next;
    });
  };

  const run = async () => {
    if (!file || !bytes || selected.size === 0) return;
    setError(null);
    setWorking(true);
    try {
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: false });
      const out = await PDFDocument.create();
      const pages = await out.copyPages(
        doc,
        [...selected].sort((a, b) => a - b).map((p) => p - 1)
      );
      pages.forEach((page) => out.addPage(page));
      const saved = new Uint8Array(await out.save());
      const label = [...selected].sort((a, b) => a - b).join("-");
      setDownloads([
        {
          name: `${baseName(file.name)}-p${label}.pdf`,
          blob: pdfBlob(saved),
          primary: true,
        },
      ]);
    } catch (e) {
      console.error("Extract failed", e);
      setError("Couldn't extract pages. Make sure it's a valid, unencrypted PDF.");
    } finally {
      setWorking(false);
    }
  };

  const reset = () => {
    setDownloads(null);
    setFile(null);
    setBytes(null);
    setSelected(new Set());
    setError(null);
  };

  const sorted = useMemo(
    () => [...selected].sort((a, b) => a - b),
    [selected]
  );

  if (downloads) {
    return (
      <ResultPanel
        heading="Pages extracted!"
        detail={`${sorted.length} page${sorted.length > 1 ? "s" : ""} · ${formatBytes(downloads[0].blob.size)}`}
        downloads={downloads}
        onReset={reset}
        resetLabel="Extract from another PDF"
        related="extract-pdf-pages"
        autoDownload
      />
    );
  }

  const showBar = thumbs.status === "ready" && selected.size > 0 && !working;

  return (
    <div className={withBarPadding(showBar)}>
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {file ? (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 dark:border-zinc-700">
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
            hint="Tap the pages you want to keep"
          />
        )}

        {thumbs.status === "loading" && (
          <p className="mt-4 animate-pulse text-sm text-zinc-400">
            Rendering page previews…
          </p>
        )}
        {thumbs.status === "error" && (
          <ErrorBanner message="Couldn't render this PDF. Try a different file." />
        )}
        {error && thumbs.status !== "error" && <ErrorBanner message={error} />}

        {thumbs.status === "ready" && (
          <>
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
              {thumbs.thumbs.length} pages ·{" "}
              {sorted.length > 0
                ? `${sorted.length} selected (${sorted.join(", ")})`
                : "tap pages to extract them"}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {thumbs.thumbs.map((thumb) => {
                const isSelected = selected.has(thumb.page);
                return (
                  <PageCard
                    key={thumb.page}
                    thumb={thumb}
                    selected={isSelected}
                    onSelect={() => toggle(thumb.page)}
                    actions={
                      <button
                        type="button"
                        onClick={() => toggle(thumb.page)}
                        className="flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        {isSelected ? (
                          <>
                            <CircleCheck className="h-3.5 w-3.5 text-indigo-500" aria-hidden="true" />
                            Selected
                          </>
                        ) : (
                          <>
                            <FileOutput className="h-3.5 w-3.5" aria-hidden="true" />
                            Select
                          </>
                        )}
                      </button>
                    }
                  />
                );
              })}
            </div>
            <ActionButton
              className="mt-6 hidden sm:inline-flex"
              onClick={run}
              disabled={selected.size === 0}
              busy={working}
              busyLabel="Extracting…"
            >
              <FileOutput className="h-4 w-4" aria-hidden="true" />
              Extract {sorted.length > 0 ? `${sorted.length} page${sorted.length > 1 ? "s" : ""}` : "pages"}
            </ActionButton>
          </>
        )}
      </div>

      <MobileActionBar show={showBar}>
        <ActionButton onClick={run} disabled={selected.size === 0} busy={working} busyLabel="Extracting…">
          <FileOutput className="h-4 w-4" aria-hidden="true" />
          Extract {sorted.length} page{sorted.length > 1 ? "s" : ""}
        </ActionButton>
      </MobileActionBar>
    </div>
  );
}