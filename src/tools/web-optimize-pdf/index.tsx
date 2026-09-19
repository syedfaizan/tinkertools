"use client";

import { useState } from "react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";
import { CircleAlert, Gauge, X } from "lucide-react";
import {
  ActionButton,
  ErrorBanner,
  FileDrop,
  ResultPanel,
  type DownloadTarget,
} from "@/tools/pdf/ui";
import { baseName, isPdf, pdfBlob } from "@/tools/pdf/lib";
import { formatBytes } from "@/lib/utils";

export function WebOptimizePdf() {
  const [file, setFile] = useState<File | null>(null);
  const [stripMetadata, setStripMetadata] = useState(true);
  const [compact, setCompact] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<DownloadTarget[] | null>(null);
  const [meta, setMeta] = useState<{ original: number; optimized: number } | null>(null);

  const valid = file !== null && isPdf(file);

  const run = async () => {
    if (!file) return;
    setError(null);
    setWorking(true);
    try {
      const doc = await PDFDocument.load(await file.arrayBuffer(), {
        ignoreEncryption: false,
        updateMetadata: false,
      });
      if (stripMetadata) {
        doc.setTitle("");
        doc.setSubject("");
        doc.setAuthor("");
        doc.setKeywords([]);
        doc.setCreator("");
        doc.setProducer("");
      }
      const bytes = new Uint8Array(
        await doc.save({
          useObjectStreams: compact,
          addDefaultPage: false,
        })
      );
      setMeta({ original: file.size, optimized: bytes.length });
      setDownloads([
        {
          name: `${baseName(file.name)}-optimized.pdf`,
          blob: pdfBlob(bytes),
          primary: true,
        },
      ]);
    } catch (e) {
      console.error("Optimize failed", e);
      setError("Couldn't optimize this PDF. Make sure it's a valid, unencrypted PDF.");
    } finally {
      setWorking(false);
    }
  };

  const reset = () => {
    setDownloads(null);
    setMeta(null);
    setFile(null);
    setError(null);
  };

  if (downloads && meta) {
    const saved = Math.max(0, meta.original - meta.optimized);
    const ratio =
      meta.original > 0 ? Math.round((1 - meta.optimized / meta.original) * 100) : 0;
    return (
      <ResultPanel
        heading="PDF optimized!"
        detail={`${formatBytes(meta.original)} → ${formatBytes(meta.optimized)} · ${saved > 0 ? `${formatBytes(saved)} smaller (${ratio}%)` : "no size change — the file was already clean"}`}
        downloads={downloads}
        onReset={reset}
        resetLabel="Optimize another PDF"
        related="web-optimize-pdf"
        autoDownload
      />
    );
  }

  return (
    <div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {file ? (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 dark:border-zinc-700">
            <Gauge className="h-5 w-5 shrink-0 text-indigo-500" aria-hidden="true" />
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
            hint="Clean structure and metadata for faster delivery"
            icon={Gauge}
          />
        )}

        <div className="mt-4 grid gap-2">
          <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl border border-zinc-200 px-4 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
            <span>
              Strip document metadata{" "}
              <span className="text-xs text-zinc-400">(author, title, producer…)</span>
            </span>
            <input
              type="checkbox"
              checked={stripMetadata}
              onChange={(event) => setStripMetadata(event.target.checked)}
              className="h-4 w-4 accent-indigo-600"
            />
          </label>
          <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl border border-zinc-200 px-4 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
            <span>
              Compact file structure{" "}
              <span className="text-xs text-zinc-400">(object streams)</span>
            </span>
            <input
              type="checkbox"
              checked={compact}
              onChange={(event) => setCompact(event.target.checked)}
              className="h-4 w-4 accent-indigo-600"
            />
          </label>
        </div>

        {error && <ErrorBanner message={error} />}

        <p className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            True “fast web view” (linearization) can&apos;t be created in a browser —
            this tool instead removes hidden metadata and re-saves with compact
            object streams, which trims real weight from bloated files. For
            image-heavy PDFs, try{" "}
            <Link className="underline" href="/tools/compress-pdf">
              Compress PDF
            </Link>
            .
          </span>
        </p>

        <ActionButton
          className="mt-5"
          onClick={run}
          disabled={!valid}
          busy={working}
          busyLabel="Optimizing…"
        >
          <Gauge className="h-4 w-4" aria-hidden="true" />
          Optimize PDF
        </ActionButton>
      </div>
    </div>
  );
}