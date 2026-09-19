"use client";

import { useState } from "react";
import { Copy, Download, FileDown, ScanText, X } from "lucide-react";
import {
  ActionButton,
  ErrorBanner,
  FileDrop,
  type DownloadTarget,
} from "@/tools/pdf/ui";
import { baseName, isPdf } from "@/tools/pdf/lib";
import { destroyPdfDocument, openPdfDocument, renderPage } from "@/tools/pdf/render";
import { formatBytes } from "@/lib/utils";

type TessModule = {
  recognize: (
    image: HTMLCanvasElement,
    lang: string,
    options: {
      logger?: (message: { status: string; progress: number }) => void;
    }
  ) => Promise<{ data: { text: string } }>;
};

let tessPromise: Promise<TessModule> | null = null;

function loadTesseract(): Promise<TessModule> {
  if (!tessPromise) {
    tessPromise = new Promise((resolve, reject) => {
      const win = window as unknown as { Tesseract?: TessModule };
      if (win.Tesseract) {
        resolve(win.Tesseract);
        return;
      }
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.min.js";
      script.onload = () =>
        win.Tesseract
          ? resolve(win.Tesseract)
          : reject(new Error("OCR engine did not load."));
      script.onerror = () =>
        reject(new Error("Couldn't load the OCR engine from the CDN. Check your connection."));
      document.head.appendChild(script);
    });
  }
  return tessPromise;
}

const LANGUAGES: { code: string; label: string }[] = [
  { code: "eng", label: "English" },
  { code: "spa", label: "Spanish" },
  { code: "fra", label: "French" },
  { code: "deu", label: "German" },
  { code: "ita", label: "Italian" },
  { code: "por", label: "Portuguese" },
  { code: "nld", label: "Dutch" },
  { code: "pol", label: "Polish" },
  { code: "tur", label: "Turkish" },
];

export function PdfOcr() {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("eng");
  const [working, setWorking] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<DownloadTarget[] | null>(null);
  const [copied, setCopied] = useState(false);

  const valid = file !== null && isPdf(file);

  const run = async () => {
    if (!file) return;
    setError(null);
    setResultText(null);
    setDownloads(null);
    setWorking(true);
    setProgress(0);
    let doc: import("pdfjs-dist").PDFDocumentProxy | null = null;
    try {
      const tess = await loadTesseract();
      doc = await openPdfDocument(await file.arrayBuffer());
      let text = "";
      for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
        const rendered = await renderPage(doc, pageNumber, 1600);
        const result = await tess.recognize(rendered.canvas, language, {
          logger: (message) => {
            if (message.status === "recognizing text") {
              setProgress(
                Math.min(0.99, (pageNumber - 1 + message.progress) / doc!.numPages)
              );
            }
          },
        });
        const pageText = (result.data.text ?? "").trim();
        text += `=== Page ${pageNumber} ===\n${pageText}\n\n`;
      }
      setResultText(text.trim());
      setProgress(1);
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      setDownloads([
        { name: `${baseName(file.name)}-ocr.txt`, blob, primary: true },
      ]);
    } catch (e) {
      console.error("OCR failed", e);
      setError(
        e instanceof Error
          ? e.message
          : "OCR failed. It needs a working internet connection to load the recognition engine."
      );
    } finally {
      if (doc) await destroyPdfDocument(doc);
      setWorking(false);
    }
  };

  const reset = () => {
    setDownloads(null);
    setResultText(null);
    setCopied(false);
    setFile(null);
    setError(null);
  };

  const copyText = async () => {
    if (resultText) {
      await navigator.clipboard.writeText(resultText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  if (resultText && downloads) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 text-center sm:p-8 dark:border-emerald-500/25 dark:bg-emerald-500/10">
          <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Text recognized!</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {resultText.split("===").length - 1} page
            {resultText.split("===").length - 1 > 1 ? "s" : ""} · {resultText.length.toLocaleString()}{" "}
            characters · {formatBytes(downloads[0].blob.size)}
          </p>
          <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href={URL.createObjectURL(downloads[0].blob)}
              download={downloads[0].name}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 sm:w-auto">
              <Download className="h-4 w-4" aria-hidden="true" />
              Download .txt
            </a>
            <button
              type="button"
              onClick={copyText}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-6 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 sm:w-auto dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
              {copied ? "Copied!" : "Copy text"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-6 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 sm:w-auto dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <ScanText className="h-4 w-4" aria-hidden="true" />
              Scan another PDF
            </button>
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
            {resultText}
          </pre>
        </div>
      </div>
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
            title="Drop a scanned PDF here, or tap to browse"
            hint="Text is recognized right in your browser"
            icon={ScanText}
          />
        )}

        <label className="mt-4 block sm:w-64">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Language
          </span>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className={`${inputCls} mt-2 w-full`}
          >
            {LANGUAGES.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {progress > 0 && progress < 1 && (
          <div className="mt-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-zinc-400">
              Recognizing text… {Math.round(progress * 100)}%
            </p>
          </div>
        )}

        {error && <ErrorBanner message={error} />}

        <p className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
          The recognition engine and language data stream from a public CDN into
          your browser; your document itself never leaves your device. Large
          documents can take a while.
        </p>

        <ActionButton
          className="mt-4"
          onClick={run}
          disabled={!valid}
          busy={working}
          busyLabel="Recognizing…"
        >
          <ScanText className="h-4 w-4" aria-hidden="true" />
          Start OCR
        </ActionButton>
      </div>
    </div>
  );
}