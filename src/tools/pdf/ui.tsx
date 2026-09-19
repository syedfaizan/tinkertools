"use client";

/**
 * Shared UI building blocks for the PDF tool kit: the file dropzone, the
 * success/result panel, and the mobile-only sticky action bar. Each tool keeps
 * its own state but reuses these so behaviour and styling stay consistent.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CircleAlert,
  CircleCheck,
  Download,
  LoaderCircle,
  RefreshCw,
  Upload,
} from "lucide-react";
import { FileTrustBadge } from "@/components/FileTrustBadge";
import { RelatedTools } from "@/components/RelatedTools";
import { cn, formatBytes } from "@/lib/utils";
import { pdfLoadErrorMessage } from "./lib";

/* ------------------------------------------------------------------ */
/* File dropzone                                                       */
/* ------------------------------------------------------------------ */

export function FileDrop({
  onFiles,
  multiple = true,
  accept = "application/pdf,.pdf",
  title,
  hint,
  disabled,
  icon: Icon = Upload,
  className,
}: {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  title: string;
  hint?: string;
  disabled?: boolean;
  icon?: typeof Upload;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div className={className}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const chosen = Array.from(event.dataTransfer.files ?? []);
          if (chosen.length > 0) onFiles(chosen);
        }}
        className={cn(
          "flex min-h-36 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center transition-colors disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950/50",
          dragging &&
            "border-indigo-400 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-500/10"
        )}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {title}
        </span>
        {hint && (
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {hint}
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(event) => {
          const chosen = Array.from(event.target.files ?? []);
          if (chosen.length > 0) onFiles(chosen);
          event.target.value = "";
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Error banner                                                        */
/* ------------------------------------------------------------------ */

export function ErrorBanner({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
    >
      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}

export function friendlyError(error: unknown): string {
  if (error instanceof Error) {
    return pdfLoadErrorMessage(error.message);
  }
  return "Something went wrong. Please try again.";
}

/* ------------------------------------------------------------------ */
/* Result panel (success card + downloads + related tools)             */
/* ------------------------------------------------------------------ */

export interface DownloadTarget {
  name: string;
  blob: Blob;
  primary?: boolean;
}

export function ResultPanel({
  heading,
  detail,
  downloads,
  onReset,
  resetLabel = "Start over",
  related,
  autoDownload = false,
}: {
  heading: string;
  detail?: ReactNode;
  downloads: DownloadTarget[];
  /** Trigger a download automatically as soon as the panel appears. */
  autoDownload?: boolean;
  onReset: () => void;
  resetLabel?: string;
  /** Current tool slug, used for the "keep going" related-tools section. */
  related: string;
}) {
  const urlsRef = useRef<{ url: string; name: string }[]>([]);

  // Auto-download the first file when the result appears.
  useEffect(() => {
    if (autoDownload && downloads.length > 0) {
      const first = downloads.find((d) => d.primary) ?? downloads[0];
      const url = URL.createObjectURL(first.blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = first.name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
    }
    // Downloads are stable blobs; only the flag needs to re-trigger.
  }, [autoDownload, downloads]);

  useEffect(() => {
    const keep = urlsRef.current.filter((u) =>
      downloads.some((d) => d.name === u.name)
    );
    urlsRef.current = keep;
  }, [downloads]);

  useEffect(() => {
    return () => {
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u.url));
      urlsRef.current = [];
    };
  }, []);

  const downloadUrl = (target: DownloadTarget) => {
    const existing = urlsRef.current.find((u) => u.name === target.name);
    const url =
      existing?.url ??
      (() => {
        const created = URL.createObjectURL(target.blob);
        urlsRef.current.push({ url: created, name: target.name });
        return created;
      })();
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = target.name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const totalSize = downloads.reduce((sum, d) => sum + d.blob.size, 0);
  const both = downloads.length > 1;

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
            <CircleCheck
              className="h-9 w-9 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
          </motion.div>
          <h2 className="mt-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {heading}
          </h2>
          {detail && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {detail}
            </p>
          )}
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {downloads.map((download) => (
              <a
                key={download.name}
                role="button"
                onClick={(event) => {
                  event.preventDefault();
                  downloadUrl(download);
                }}
                className={cn(
                  "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold shadow-sm transition-colors sm:w-auto",
                  download.primary || !both
                    ? "bg-indigo-600 text-white hover:bg-indigo-500"
                    : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                )}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                {download.name} · {formatBytes(download.blob.size)}
              </a>
            ))}
          </div>
          <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
            {downloads.length} file{downloads.length > 1 ? "s" : ""} ·{" "}
            {formatBytes(totalSize)} total
            {autoDownload ? " — download started automatically" : ""}
          </p>
          <button
            type="button"
            onClick={onReset}
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {resetLabel}
          </button>
          <div className="mt-8 border-t border-emerald-200/70 pt-6 text-left dark:border-emerald-500/20">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Keep going — more free tools
            </p>
            <div className="mt-3">
              <RelatedTools current={related} limit={3} />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Primary action button                                               */
/* ------------------------------------------------------------------ */

export function ActionButton({
  children,
  onClick,
  disabled,
  busy = false,
  busyLabel = "Working…",
  className,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
  busyLabel?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      className={cn(
        "flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
    >
      {busy ? (
        <>
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          {busyLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile-only sticky action bar                                       */
/* ------------------------------------------------------------------ */

export function MobileActionBar({
  show,
  children,
}: {
  show: boolean;
  children: ReactNode;
}) {
  if (!show) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur sm:hidden dark:border-zinc-800 dark:bg-zinc-950/90">
      {children}
    </div>
  );
}

/** Padding helper so content isn't hidden behind the mobile bar. */
export function withBarPadding(show: boolean): string {
  return show ? "pb-24 sm:pb-0" : "";
}