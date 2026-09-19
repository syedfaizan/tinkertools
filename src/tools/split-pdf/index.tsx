"use client";

import { useMemo, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { FileDown, Layers, Scissors, X } from "lucide-react";
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
  openPdfFromFile,
  pdfBlob,
  timestamp,
  zipFiles,
} from "@/tools/pdf/lib";
import { formatBytes } from "@/lib/utils";

type Mode = "all" | "chunks";

interface Result {
  downloads: DownloadTarget[];
  heading: string;
  detail?: string;
  autoDownload: boolean;
}

export function SplitPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>("all");
  const [chunkSize, setChunkSize] = useState(2);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const valid = file !== null && isPdf(file);
  const chunk = Math.max(1, Math.min(50, Math.round(chunkSize) || 2));

  const showBar = valid && !working && !result;

  const run = async () => {
    if (!file || !valid) return;
    setError(null);
    setWorking(true);
    try {
      const { doc } = await openPdfFromFile(file);
      const pageCount = doc.getPageCount();
      const groups: number[][] = [];
      if (mode === "all") {
        for (let p = 1; p <= pageCount; p += 1) groups.push([p]);
      } else {
        for (let start = 1; start <= pageCount; start += chunk) {
          const size = Math.min(chunk, pageCount - start + 1);
          groups.push(
            Array.from({ length: size }, (_, i) => start + i)
          );
        }
      }

      const outputName = `${baseName(file.name)}-pages`;
      const parts: { name: string; blob: Blob }[] = [];
      for (const group of groups) {
        const partDoc = await PDFDocument.create();
        const pages = await partDoc.copyPages(
          doc,
          group.map((page) => page - 1)
        );
        pages.forEach((page) => partDoc.addPage(page));
        const bytes = new Uint8Array(await partDoc.save());
        const first = group[0];
        const last = group[group.length - 1];
        parts.push({
          name: `${outputName}-p${first}-${first === last ? first : last}.pdf`,
          blob: pdfBlob(bytes),
        });
      }

      const totalSize = parts.reduce((sum, part) => sum + part.blob.size, 0);
      let downloads: DownloadTarget[];
      if (parts.length === 1) {
        downloads = [
          { name: parts[0].name, blob: parts[0].blob, primary: true },
        ];
      } else {
        const zipBlob = await zipFiles(parts);
        downloads = [
          {
            name: `${baseName(file.name)}-split-${timestamp()}.zip`,
            blob: zipBlob,
            primary: true,
          },
        ];
      }
      setResult({
        downloads,
        heading: `${parts.length} PDF${parts.length > 1 ? "s" : ""} ready`,
        detail: `${pageCount} page${pageCount > 1 ? "s" : ""} → ${parts.length} part${
          parts.length > 1 ? "s" : ""
        } · total ${formatBytes(totalSize)}`,
        autoDownload: true,
      });
    } catch (e) {
      console.error("Split failed", e);
      setError(
        "Couldn't split this PDF. Make sure it's a valid, unencrypted PDF."
      );
    } finally {
      setWorking(false);
    }
  };

  const reset = () => {
    setResult(null);
    setFile(null);
    setError(null);
  };

  const sizeText = useMemo(() => (file ? formatBytes(file.size) : ""), [file]);

  if (result) {
    return (
      <ResultPanel
        heading={result.heading}
        detail={result.detail}
        downloads={result.downloads}
        onReset={reset}
        related="split-pdf"
        autoDownload={result.autoDownload}
      />
    );
  }

  return (
    <div className={withBarPadding(showBar)}>
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {file ? (
          <div className="mb-4">
            <div className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 dark:border-zinc-700">
              <FileDown
                className="h-5 w-5 shrink-0 text-indigo-500"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {file.name}
                </p>
              </div>
              <span className="shrink-0 text-xs text-zinc-400">{sizeText}</span>
              <button
                type="button"
                onClick={() => setFile(null)}
                aria-label="Remove file"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : (
          <FileDrop
            onFiles={(files) => setFile(files[0] ?? null)}
            multiple={false}
            title="Drop a PDF here, or tap to browse"
            hint="One PDF · pages are split in your browser"
          />
        )}

        <div className="mt-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Split mode
          </label>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setMode("all")}
              className={`flex min-h-12 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors ${
                mode === "all"
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                  : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              <Scissors className="h-4 w-4" aria-hidden="true" />
              One file per page
            </button>
            <button
              type="button"
              onClick={() => setMode("chunks")}
              className={`flex min-h-12 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors ${
                mode === "chunks"
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                  : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              <Layers className="h-4 w-4" aria-hidden="true" />
              Pages per file
            </button>
          </div>

          {mode === "chunks" && (
            <label className="mt-4 flex items-center gap-3 text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">
                Pages per file
              </span>
              <input
                type="number"
                min={1}
                max={50}
                value={chunkSize || ""}
                onChange={(event) => setChunkSize(Number(event.target.value))}
                className="w-24 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
              />
              <span className="text-xs text-zinc-400">
                {chunk} page{chunk > 1 ? "s" : ""} per file
              </span>
            </label>
          )}
        </div>

        {error && <ErrorBanner message={error} />}

        <ActionButton
          className="mt-5 hidden sm:inline-flex"
          onClick={run}
          disabled={!valid}
          busy={working}
          busyLabel="Splitting…"
        >
          <Scissors className="h-4 w-4" aria-hidden="true" />
          Split PDF
        </ActionButton>
      </div>

      <MobileActionBar show={showBar}>
        <ActionButton onClick={run} disabled={!valid} busy={working} busyLabel="Splitting…">
          <Scissors className="h-4 w-4" aria-hidden="true" />
          Split PDF
        </ActionButton>
      </MobileActionBar>
    </div>
  );
}