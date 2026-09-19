"use client";

import { useMemo, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { CircleCheck, FileDown, FileX, Square, X } from "lucide-react";
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

export function RemovePdfPages() {
  const [file, setFile] = useState<File | null>(null);
  const [bytes, setBytes] = useState<ArrayBuffer | null>(null);
  const [removed, setRemoved] = useState<Set<number>>(new Set());
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
    setRemoved(new Set());
    setFile(chosen);
    setBytes(await chosen.arrayBuffer());
  };

  const toggle = (page: number) => {
    setRemoved((prev) => {
      const next = new Set(prev);
      if (next.has(page)) next.delete(page);
      else next.add(page);
      return next;
    });
  };

  const run = async () => {
    if (!file || !bytes || removed.size === 0) return;
    setError(null);
    setWorking(true);
    try {
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: false });
      const indices = [...removed]
        .map((page) => page - 1)
        .sort((a, b) => b - a);
      for (const index of indices) doc.removePage(index);
      const out = new Uint8Array(await doc.save());
      setDownloads([
        {
          name: `${baseName(file.name)}-trimmed.pdf`,
          blob: pdfBlob(out),
          primary: true,
        },
      ]);
    } catch (e) {
      console.error("Remove pages failed", e);
      setError("Couldn't edit this PDF. Make sure it's a valid, unencrypted PDF.");
    } finally {
      setWorking(false);
    }
  };

  const reset = () => {
    setDownloads(null);
    setFile(null);
    setBytes(null);
    setRemoved(new Set());
    setError(null);
  };

  const keptCount = useMemo(
    () => (thumbs.status === "ready" ? thumbs.thumbs.length - removed.size : 0),
    [thumbs, removed]
  );

  if (downloads) {
    return (
      <ResultPanel
        heading="PDF trimmed!"
        detail={`${removed.size} page${removed.size > 1 ? "s" : ""} removed · ${formatBytes(downloads[0].blob.size)}`}
        downloads={downloads}
        onReset={reset}
        resetLabel="Edit another PDF"
        related="remove-pdf-pages"
        autoDownload
      />
    );
  }

  const showBar = thumbs.status === "ready" && removed.size > 0 && !working;

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
            hint="Tap pages to mark them for deletion"
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
              {removed.size > 0
                ? `${removed.size} to remove, ${keptCount} kept`
                : "tap pages you want to remove"}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {thumbs.thumbs.map((thumb) => {
                const isRemoved = removed.has(thumb.page);
                return (
                  <PageCard
                    key={thumb.page}
                    thumb={thumb}
                    selected={isRemoved}
                    onSelect={() => toggle(thumb.page)}
                    badge={isRemoved ? "REMOVE" : undefined}
                    actions={
                      <button
                        type="button"
                        onClick={() => toggle(thumb.page)}
                        className="flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        {isRemoved ? (
                          <>
                            <CircleCheck className="h-3.5 w-3.5 text-indigo-500" aria-hidden="true" />
                            Keep
                          </>
                        ) : (
                          <>
                            <Square className="h-3.5 w-3.5" aria-hidden="true" />
                            Remove
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
              disabled={removed.size === 0}
              busy={working}
              busyLabel="Removing…"
            >
              <FileX className="h-4 w-4" aria-hidden="true" />
              Remove {removed.size > 0 ? `${removed.size} page${removed.size > 1 ? "s" : ""}` : "pages"}
            </ActionButton>
          </>
        )}
      </div>

      <MobileActionBar show={showBar}>
        <ActionButton onClick={run} disabled={removed.size === 0} busy={working} busyLabel="Removing…">
          <FileX className="h-4 w-4" aria-hidden="true" />
          Remove {removed.size} page{removed.size > 1 ? "s" : ""}
        </ActionButton>
      </MobileActionBar>
    </div>
  );
}