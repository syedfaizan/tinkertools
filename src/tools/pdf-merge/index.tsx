"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PDFDocument } from "pdf-lib";
import {
  ArrowDown,
  ArrowUp,
  CircleAlert,
  CircleCheck,
  Download,
  FileDown,
  Files,
  LoaderCircle,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";
import { FileTrustBadge } from "@/components/FileTrustBadge";
import { RelatedTools } from "@/components/RelatedTools";
import { cn, formatBytes } from "@/lib/utils";

type MergeStatus = "idle" | "merging" | "done";

interface PdfFile {
  id: string;
  file: File;
}

interface MergeResult {
  url: string;
  name: string;
  size: number;
}

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function isPdf(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export function PdfMerge() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [status, setStatus] = useState<MergeStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<MergeResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<MergeResult | null>(null);
  const busy = status === "merging";

  const addFiles = useCallback((incoming: File[]) => {
    const valid = incoming.filter(isPdf);
    const rejected = incoming.length - valid.length;
    setFiles((prev) => [
      ...prev,
      ...valid.map((file) => ({ id: makeId(), file })),
    ]);
    setStatus("idle");
    setError(
      rejected > 0
        ? `${rejected} file${rejected > 1 ? "s were" : " was"} skipped — only PDF files can be merged.`
        : null
    );
  }, []);

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((entry) => entry.id !== id));
    setError(null);
  };

  const moveFile = (index: number, direction: -1 | 1) => {
    setFiles((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  // Clean up the object URL when the component unmounts.
  useEffect(() => {
    return () => {
      if (resultRef.current) URL.revokeObjectURL(resultRef.current.url);
    };
  }, []);

  const merge = async () => {
    if (files.length < 2) return;
    setError(null);
    setStatus("merging");
    try {
      const merged = await PDFDocument.create();
      for (const { file } of files) {
        const source = await PDFDocument.load(await file.arrayBuffer());
        const pages = await merged.copyPages(source, source.getPageIndices());
        pages.forEach((page) => merged.addPage(page));
      }
      const bytes = new Uint8Array(await merged.save());
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const name =
        files.length === 1
          ? `${files[0].file.name.replace(/\.pdf$/i, "")}-merged.pdf`
          : `merged-${new Date().toISOString().slice(0, 10)}.pdf`;
      const nextResult = { url, name, size: blob.size };
      resultRef.current = nextResult;
      setResult(nextResult);
      setStatus("done");
    } catch (mergeError) {
      console.error("PDF merge failed:", mergeError);
      setError(
        "Could not merge these files. Make sure every file is a valid, unencrypted PDF, then try again."
      );
      setStatus("idle");
    }
  };

  // Auto-start the download as soon as the merge finishes.
  useEffect(() => {
    if (status === "done" && result) {
      const anchor = document.createElement("a");
      anchor.href = result.url;
      anchor.download = result.name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const reset = () => {
    if (resultRef.current) {
      URL.revokeObjectURL(resultRef.current.url);
      resultRef.current = null;
    }
    setResult(null);
    setFiles([]);
    setStatus("idle");
    setError(null);
  };

  const totalSize = useMemo(
    () => files.reduce((sum, entry) => sum + entry.file.size, 0),
    [files]
  );

  const showBottomBar = files.length > 0 && status !== "done";

  if (status === "done" && result) {
    return (
      <div className="space-y-4">
        <FileTrustBadge />
        <AnimatePresence mode="wait">
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 text-center sm:p-8 dark:border-emerald-500/25 dark:bg-emerald-500/10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 240, damping: 14, delay: 0.05 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20"
            >
              <CircleCheck className="h-9 w-9 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            </motion.div>
            <h2 className="mt-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Merge complete!
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {result.name} · {formatBytes(result.size)} · {files.length} file
              {files.length > 1 ? "s" : ""}
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={result.url}
                download={result.name}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 sm:w-auto"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download {result.name}
              </a>
              <button
                type="button"
                onClick={reset}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-6 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 sm:w-auto dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Merge another set
              </button>
            </div>
            <div className="mt-8 border-t border-emerald-200/70 pt-6 text-left dark:border-emerald-500/20">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Keep going — more free tools
              </p>
              <div className="mt-3">
                <RelatedTools current="pdf-merge" limit={3} />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={cn(showBottomBar && "pb-24 sm:pb-0")}>
      <FileTrustBadge className="mb-4" />

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            addFiles(Array.from(event.dataTransfer.files));
          }}
          className={cn(
            "flex min-h-36 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center transition-colors disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950/50",
            dragging &&
              "border-indigo-400 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-500/10"
          )}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
            <Upload className="h-6 w-6" aria-hidden="true" />
          </span>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Drag PDFs here, or tap to browse
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            Select multiple files · only PDFs are accepted
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="hidden"
          onChange={(event) => {
            const chosen = Array.from(event.target.files ?? []);
            if (chosen.length > 0) addFiles(chosen);
            event.target.value = "";
          }}
        />

        {files.length > 0 && (
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {files.length} file{files.length > 1 ? "s" : ""} ·{" "}
                {formatBytes(totalSize)}
              </p>
              <button
                type="button"
                onClick={() => {
                  setFiles([]);
                  setError(null);
                }}
                className="inline-flex min-h-9 items-center gap-1.5 px-2 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Clear all
              </button>
            </div>
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {files.map((entry, index) => (
                <li key={entry.id} className="flex items-center gap-2 py-2.5">
                  <FileDown className="h-5 w-5 shrink-0 text-zinc-400" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {entry.file.name}
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                      {formatBytes(entry.file.size)} · position {index + 1}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveFile(index, -1)}
                      disabled={index === 0 || busy}
                      aria-label={`Move ${entry.file.name} up`}
                      className="flex h-11 w-11 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-30 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    >
                      <ArrowUp className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveFile(index, 1)}
                      disabled={index === files.length - 1 || busy}
                      aria-label={`Move ${entry.file.name} down`}
                      className="flex h-11 w-11 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-30 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    >
                      <ArrowDown className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFile(entry.id)}
                      disabled={busy}
                      aria-label={`Remove ${entry.file.name}`}
                      className="flex h-11 w-11 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-30 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
          >
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}

        <button
          type="button"
          onClick={merge}
          disabled={files.length < 2 || busy}
          className="mt-5 hidden w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 sm:inline-flex"
        >
          {busy ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              Merging {files.length} PDFs…
            </>
          ) : (
            <>
              <Files className="h-4 w-4" aria-hidden="true" />
              Merge {files.length} PDF{files.length > 1 ? "s" : ""}
            </>
          )}
        </button>
        {files.length > 0 && files.length < 2 && (
          <p className="mt-3 hidden text-center text-xs text-zinc-400 sm:block dark:text-zinc-500">
            Add at least one more PDF to merge.
          </p>
        )}
      </div>

      {/* Sticky bottom action bar — mobile only */}
      {showBottomBar && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur sm:hidden dark:border-zinc-800 dark:bg-zinc-950/90">
          <button
            type="button"
            onClick={merge}
            disabled={files.length < 2 || busy}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                Merging…
              </>
            ) : (
              <>
                <Files className="h-4 w-4" aria-hidden="true" />
                Merge {files.length} PDF{files.length > 1 ? "s" : ""}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}