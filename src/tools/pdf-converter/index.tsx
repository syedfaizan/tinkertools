"use client";

import { useState } from "react";
import { ArrowLeftRight, FileDown, X } from "lucide-react";
import {
  ActionButton,
  ErrorBanner,
  FileDrop,
  ResultPanel,
  type DownloadTarget,
} from "@/tools/pdf/ui";
import { baseName, isPdf } from "@/tools/pdf/lib";
import { extractPageTexts, htmlEscape } from "@/tools/pdf/text";
import { formatBytes } from "@/lib/utils";

type Format = "txt" | "html";

export function PdfConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<Format>("txt");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<DownloadTarget[] | null>(null);
  const [pages, setPages] = useState(0);
  const [chars, setChars] = useState(0);

  const valid = file !== null && isPdf(file);

  const run = async () => {
    if (!file) return;
    setError(null);
    setWorking(true);
    try {
      const extracted = await extractPageTexts(file);
      const pageTexts = extracted.map((text, index) => {
        const header =
          format === "txt"
            ? `\n=== Page ${index + 1} ===\n\n`
            : `<h2>Page ${index + 1}</h2>\n`;
        return header + (format === "html" ? `<p>${htmlEscape(text).replace(/\n/g, "<br />")}</p>` : text);
      });
      setPages(extracted.length);
      setChars(extracted.join("\n").length);

      let content: string;
      let mime: string;
      if (format === "html") {
        content = `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>${htmlEscape(
          baseName(file.name)
        )}</title></head><body>${pageTexts.join("\n\n")}</body></html>`;
        mime = "text/html";
      } else {
        content = pageTexts.join("\n");
        mime = "text/plain";
      }
      const blob = new Blob([content], { type: mime });
      setDownloads([
        {
          name: `${baseName(file.name)}.${format}`,
          blob,
          primary: true,
        },
      ]);
    } catch (e) {
      console.error("Convert failed", e);
      setError(
        "Couldn't read the text from this PDF. Scanned documents work better with the OCR tool."
      );
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
        heading="Text extracted!"
        detail={`${pages} page${pages > 1 ? "s" : ""} · ${chars.toLocaleString()} characters · ${formatBytes(
          downloads[0].blob.size
        )}`}
        downloads={downloads}
        onReset={reset}
        resetLabel="Convert another PDF"
        related="pdf-converter"
        autoDownload={false}
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
            hint="Extract its text as a .txt or .html file — in your browser"
            icon={FileDown}
          />
        )}

        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Output format
          </span>
          <select
            value={format}
            onChange={(event) => setFormat(event.target.value as Format)}
            className={`${inputCls} mt-2 w-full sm:w-64`}
          >
            <option value="txt">Plain text (.txt)</option>
            <option value="html">HTML page (.html)</option>
          </select>
        </label>

        {error && <ErrorBanner message={error} />}

        <ActionButton
          className="mt-5"
          onClick={run}
          disabled={!valid}
          busy={working}
          busyLabel="Extracting text…"
        >
          <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
          Convert to {format.toUpperCase()}
        </ActionButton>
      </div>
    </div>
  );
}