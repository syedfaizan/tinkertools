"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { ArrowDown, ArrowUp, FileDown, GripVertical, Shuffle, X } from "lucide-react";
import {
  ActionButton,
  ErrorBanner,
  FileDrop,
  MobileActionBar,
  ResultPanel,
  withBarPadding,
  type DownloadTarget,
} from "@/tools/pdf/ui";
import { useThumbs } from "@/tools/pdf/useThumbs";
import { baseName, isPdf, pdfBlob } from "@/tools/pdf/lib";
import { formatBytes } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function RearrangePdfPages() {
  const [file, setFile] = useState<File | null>(null);
  const [bytes, setBytes] = useState<ArrayBuffer | null>(null);
  const [order, setOrder] = useState<number[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
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
    setOrder([]);
    setFile(chosen);
    setBytes(await chosen.arrayBuffer());
  };

  // Seed the drag-order from the thumbnails once they're ready — derived at
  // render time (no setState-in-effect).
  const [orderReady, setOrderReady] = useState(false);
  if (thumbs.status === "ready" && !orderReady) {
    setOrderReady(true);
    setOrder(thumbs.thumbs.map((thumb) => thumb.page));
  } else if (thumbs.status !== "ready" && orderReady) {
    setOrderReady(false);
  }

  const move = (index: number, direction: -1 | 1) => {
    setOrder((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const swap = (from: number, to: number) => {
    setOrder((prev) => {
      const next = [...prev];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  };

  const run = async () => {
    if (!file || !bytes || order.length === 0) return;
    setError(null);
    setWorking(true);
    try {
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: false });
      const out = await PDFDocument.create();
      const pages = await out.copyPages(doc, order.map((page) => page - 1));
      pages.forEach((page) => out.addPage(page));
      const saved = new Uint8Array(await out.save());
      setDownloads([
        {
          name: `${baseName(file.name)}-reordered.pdf`,
          blob: pdfBlob(saved),
          primary: true,
        },
      ]);
    } catch (e) {
      console.error("Rearrange failed", e);
      setError("Couldn't reorder pages. Make sure it's a valid, unencrypted PDF.");
    } finally {
      setWorking(false);
    }
  };

  const reset = () => {
    setDownloads(null);
    setFile(null);
    setBytes(null);
    setOrder([]);
    setDragIndex(null);
    setError(null);
  };

  const changed = order.length > 0 && order.some((page, index) => page !== index + 1);

  if (downloads) {
    return (
      <ResultPanel
        heading="Pages reordered!"
        detail={`${order.length} pages in the new order · ${formatBytes(downloads[0].blob.size)}`}
        downloads={downloads}
        onReset={reset}
        resetLabel="Reorder another PDF"
        related="rearrange-pdf-pages"
        autoDownload
      />
    );
  }

  const showBar = thumbs.status === "ready" && changed && !working;

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
            hint="Drag pages or use the arrows to reorder"
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

        {thumbs.status === "ready" && order.length > 0 && (
          <>
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
              New order: {order.join(" → ")}
            </p>
            <ol className="mt-4 space-y-2">
              {order.map((page, index) => {
                const thumb = thumbs.thumbs.find((t) => t.page === page);
                if (!thumb) return null;
                return (
                  <li
                    key={page}
                    draggable
                    onDragStart={() => setDragIndex(index)}
                    onDragOver={(event) => {
                      event.preventDefault();
                      if (dragIndex !== null && dragIndex !== index) {
                        swap(dragIndex, index);
                        setDragIndex(index);
                      }
                    }}
                    onDragEnd={() => setDragIndex(null)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border bg-white p-2 pr-3 transition-shadow dark:bg-zinc-900",
                      dragIndex === index
                        ? "border-indigo-400 shadow-md dark:border-indigo-500"
                        : "border-zinc-200 dark:border-zinc-800"
                    )}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                      {index + 1}
                    </span>
                    <img
                      src={thumb.url}
                      alt={`Page ${page}`}
                      className="h-14 w-10 shrink-0 rounded border border-zinc-200 object-cover dark:border-zinc-700"
                    />
                    <span className="flex-1 truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Page {page}
                    </span>
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label="Move up"
                      className="flex h-11 w-11 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-30 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    >
                      <ArrowUp className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === order.length - 1}
                      aria-label="Move down"
                      className="flex h-11 w-11 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-30 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    >
                      <ArrowDown className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <GripVertical
                      className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600"
                      aria-hidden="true"
                    />
                  </li>
                );
              })}
            </ol>
            <ActionButton
              className="mt-6 hidden sm:inline-flex"
              onClick={run}
              disabled={!changed}
              busy={working}
              busyLabel="Reordering…"
            >
              <Shuffle className="h-4 w-4" aria-hidden="true" />
              Save new order
            </ActionButton>
          </>
        )}
      </div>

      <MobileActionBar show={showBar}>
        <ActionButton onClick={run} disabled={!changed} busy={working} busyLabel="Reordering…">
          <Shuffle className="h-4 w-4" aria-hidden="true" />
          Save new order
        </ActionButton>
      </MobileActionBar>
    </div>
  );
}