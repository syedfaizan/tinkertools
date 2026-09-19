"use client";

import { useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { FileDown, Hash, X } from "lucide-react";
import {
  ActionButton,
  ErrorBanner,
  FileDrop,
  ResultPanel,
  type DownloadTarget,
} from "@/tools/pdf/ui";
import { baseName, isPdf, pdfBlob } from "@/tools/pdf/lib";
import { formatBytes } from "@/lib/utils";

type Position = "bottom-left" | "bottom-center" | "bottom-right" | "top-left" | "top-center" | "top-right";

const POSITIONS: { value: Position; label: string }[] = [
  { value: "bottom-center", label: "Bottom center" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-right", label: "Bottom right" },
  { value: "top-center", label: "Top center" },
  { value: "top-left", label: "Top left" },
  { value: "top-right", label: "Top right" },
];

export function AddPageNumbers() {
  const [file, setFile] = useState<File | null>(null);
  const [position, setPosition] = useState<Position>("bottom-center");
  const [format, setFormat] = useState("Page {i} of {n}");
  const [start, setStart] = useState(1);
  const [size, setSize] = useState(12);
  const [skipFirst, setSkipFirst] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<DownloadTarget[] | null>(null);

  const valid = file !== null && isPdf(file);
  const startNumber = Number.isFinite(start) ? Math.max(0, Math.round(start) || 1) : 1;

  const run = async () => {
    if (!file) return;
    setError(null);
    setWorking(true);
    try {
      const doc = await PDFDocument.load(await file.arrayBuffer(), {
        ignoreEncryption: false,
      });
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const total = doc.getPageCount();
      const margin = 24;
      let pageNumber = startNumber;
      for (let index = 0; index < total; index += 1) {
        if (skipFirst && index === 0) continue;
        const page = doc.getPage(index);
        const { width, height } = page.getSize();
        const label = format
          .replace("{i}", String(pageNumber))
          .replace("{n}", String(total));
        const textWidth = font.widthOfTextAtSize(label, size);
        let x = margin;
        if (position.includes("center")) x = (width - textWidth) / 2;
        else if (position.includes("right")) x = width - margin - textWidth;
        const y = position.startsWith("top")
          ? height - margin - size
          : margin;
        page.drawText(label, {
          x,
          y,
          size,
          font,
          color: rgb(0.3, 0.3, 0.35),
        });
        pageNumber += 1;
      }
      const out = new Uint8Array(await doc.save());
      setDownloads([
        {
          name: `${baseName(file.name)}-numbered.pdf`,
          blob: pdfBlob(out),
          primary: true,
        },
      ]);
    } catch (e) {
      console.error("Add page numbers failed", e);
      setError("Couldn't number this PDF. Make sure it's a valid, unencrypted PDF.");
    } finally {
      setWorking(false);
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
        heading="Numbers added!"
        detail={`${format} at ${position.replace("-", " ")} · ${formatBytes(downloads[0].blob.size)}`}
        downloads={downloads}
        onReset={reset}
        resetLabel="Number another PDF"
        related="add-page-numbers"
        autoDownload
      />
    );
  }

  const inputCls =
    "rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200";

  return (
    <div>
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
            hint="Numbers are stamped on every page in your browser"
          />
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Position
            </span>
            <select
              value={position}
              onChange={(event) => setPosition(event.target.value as Position)}
              className={`${inputCls} mt-2 w-full`}
            >
              {POSITIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Format
            </span>
            <select
              value={format}
              onChange={(event) => setFormat(event.target.value)}
              className={`${inputCls} mt-2 w-full`}
            >
              <option value="Page {i} of {n}">Page {`{i}`} of {`{n}`}</option>
              <option value="{i} / {n}">{`{i}`} / {`{n}`}</option>
              <option value="{i}">{`{i}`}</option>
              <option value="Page {i}">Page {`{i}`}</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Start at
            </span>
            <input
              type="number"
              min={0}
              value={start}
              onChange={(event) => setStart(Number(event.target.value))}
              className={`${inputCls} mt-2 w-full`}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Font size
            </span>
            <select
              value={size}
              onChange={(event) => setSize(Number(event.target.value))}
              className={`${inputCls} mt-2 w-full`}
            >
              {[8, 10, 12, 14, 16, 18, 24].map((option) => (
                <option key={option} value={option}>
                  {option} pt
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-4 flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 px-4 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
          <span>Skip the first page (typically a cover)</span>
          <input
            type="checkbox"
            checked={skipFirst}
            onChange={(event) => setSkipFirst(event.target.checked)}
            className="ml-auto h-4 w-4 accent-indigo-600"
          />
        </label>

        {error && <ErrorBanner message={error} />}

        <ActionButton
          className="mt-5"
          onClick={run}
          disabled={!valid}
          busy={working}
          busyLabel="Numbering…"
        >
          <Hash className="h-4 w-4" aria-hidden="true" />
          Add page numbers
        </ActionButton>
      </div>
    </div>
  );
}