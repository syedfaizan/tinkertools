"use client";

import { useMemo, useState } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import { FileDown, RotateCcw, RotateCw, X } from "lucide-react";
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

const clampRotation = (deg: number) => ((deg % 360) + 360) % 360;

export function RotatePdfPages() {
  const [file, setFile] = useState<File | null>(null);
  const [bytes, setBytes] = useState<ArrayBuffer | null>(null);
  const [rotations, setRotations] = useState<Record<number, number>>({});
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
    setRotations({});
    setFile(chosen);
    setBytes(await chosen.arrayBuffer());
  };

  const bumpRotation = (page: number, delta: number) => {
    setRotations((prev) => ({
      ...prev,
      [page]: clampRotation((prev[page] ?? 0) + delta),
    }));
  };

  const rotateAll = (delta: number) => {
    if (!thumbs.thumbs.length) return;
    setRotations((prev) => {
      const next: Record<number, number> = {};
      for (const { page } of thumbs.thumbs) {
        next[page] = clampRotation((prev[page] ?? 0) + delta);
      }
      return next;
    });
  };

  const rotatedCount = useMemo(
    () => Object.values(rotations).filter((deg) => deg !== 0).length,
    [rotations]
  );

  const run = async () => {
    if (!file || !bytes || rotatedCount === 0) return;
    setError(null);
    setWorking(true);
    try {
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: false });
      for (const [pageKey, deg] of Object.entries(rotations)) {
        if (deg === 0) continue;
        const page = doc.getPage(Number(pageKey) - 1);
        page.setRotation(degrees(deg));
      }
      const out = new Uint8Array(await doc.save());
      setDownloads([
        {
          name: `${baseName(file.name)}-rotated.pdf`,
          blob: pdfBlob(out),
          primary: true,
        },
      ]);
    } catch (e) {
      console.error("Rotate failed", e);
      setError("Couldn't rotate this PDF. Make sure it's a valid, unencrypted PDF.");
    } finally {
      setWorking(false);
    }
  };

  const reset = () => {
    setDownloads(null);
    setFile(null);
    setBytes(null);
    setRotations({});
    setError(null);
  };

  if (downloads) {
    return (
      <ResultPanel
        heading="Pages rotated!"
        detail={`${rotatedCount} page${rotatedCount > 1 ? "s" : ""} rotated · ${formatBytes(downloads[0].blob.size)}`}
        downloads={downloads}
        onReset={reset}
        resetLabel="Rotate another PDF"
        related="rotate-pdf-pages"
        autoDownload
      />
    );
  }

  const showBar = file !== null && thumbs.status === "ready" && rotatedCount > 0 && !working;

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
            hint="One PDF · rotate pages individually"
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
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {thumbs.pageCount} pages ·{" "}
                {rotatedCount > 0
                  ? `${rotatedCount} rotated`
                  : "tap the arrows to rotate"}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => rotateAll(-90)}
                  className="flex min-h-10 items-center gap-1.5 rounded-xl border border-zinc-200 px-3 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Rotate all left
                </button>
                <button
                  type="button"
                  onClick={() => rotateAll(90)}
                  className="flex min-h-10 items-center gap-1.5 rounded-xl border border-zinc-200 px-3 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
                  Rotate all right
                </button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {thumbs.thumbs.map((thumb) => {
                const deg = rotations[thumb.page] ?? 0;
                return (
                  <PageCard
                    key={thumb.page}
                    thumb={thumb}
                    badge={deg !== 0 ? `${deg}°` : undefined}
                    actions={
                      <>
                        <button
                          type="button"
                          onClick={() => bumpRotation(thumb.page, -90)}
                          aria-label={`Rotate page ${thumb.page} left`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                        >
                          <RotateCcw className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => bumpRotation(thumb.page, 90)}
                          aria-label={`Rotate page ${thumb.page} right`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                        >
                          <RotateCw className="h-4 w-4" aria-hidden="true" />
                        </button>
                        {deg !== 0 && (
                          <button
                            type="button"
                            onClick={() => bumpRotation(thumb.page, -deg)}
                            aria-label={`Reset page ${thumb.page} rotation`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                          >
                            <X className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        )}
                      </>
                    }
                  />
                );
              })}
            </div>
            <ActionButton
              className="mt-6 hidden sm:inline-flex"
              onClick={run}
              disabled={rotatedCount === 0}
              busy={working}
              busyLabel="Rotating…"
            >
              <RotateCw className="h-4 w-4" aria-hidden="true" />
              Rotate {rotatedCount > 0 ? `${rotatedCount} page${rotatedCount > 1 ? "s" : ""}` : "pages"}
            </ActionButton>
          </>
        )}
      </div>

      <MobileActionBar show={showBar}>
        <ActionButton onClick={run} disabled={rotatedCount === 0} busy={working} busyLabel="Rotating…">
          <RotateCw className="h-4 w-4" aria-hidden="true" />
          Rotate {rotatedCount > 0 ? `${rotatedCount} page${rotatedCount > 1 ? "s" : ""}` : "pages"}
        </ActionButton>
      </MobileActionBar>
    </div>
  );
}