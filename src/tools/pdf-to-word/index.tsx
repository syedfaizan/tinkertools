"use client";

import { useState } from "react";
import Link from "next/link";
import { FileType, X } from "lucide-react";
import {
  ActionButton,
  ErrorBanner,
  FileDrop,
  MobileActionBar,
  ResultPanel,
  withBarPadding,
  type DownloadTarget,
} from "@/tools/pdf/ui";
import { FileTrustBadge } from "@/components/FileTrustBadge";
import { baseName, isPdf } from "@/tools/pdf/lib";
import { destroyPdfDocument, openPdfDocument } from "@/tools/pdf/render";
import { formatBytes } from "@/lib/utils";

/** Minimal slice of pdf.js's TextItem that this tool relies on. */
interface PdfTextLine {
  str?: string;
  hasEOL?: boolean;
}

export function PdfToWord() {
  const [file, setFile] = useState<File | null>(null);
  const [preservePages, setPreservePages] = useState(true);
  const [working, setWorking] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<DownloadTarget[] | null>(null);

  const valid = file !== null && isPdf(file);

  const run = async () => {
    if (!file) return;
    setError(null);
    setWorking(true);
    setProgress(null);
    let doc: Awaited<ReturnType<typeof openPdfDocument>> | null = null;
    try {
      const { Document, Packer, PageBreak, Paragraph, TextRun } = await import(
        "docx"
      );
      doc = await openPdfDocument(await file.arrayBuffer());
      setProgress({ done: 0, total: doc.numPages });

      const paragraphs: InstanceType<typeof Paragraph>[] = [];

      for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
        const page = await doc.getPage(pageNumber);
        const content = await page.getTextContent();

        // Rebuild the page's lines from the text items. pdf.js marks end-of-line
        // on each item via `hasEOL`; collapse runs of spaces and drop blanks.
        const lines = content.items
          .map((item) => item as PdfTextLine)
          .filter((item) => typeof item.str === "string")
          .map((item) => `${item.str}${item.hasEOL ? "\n" : " "}`)
          .join("")
          .replace(/[ \t]+/g, " ")
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0);

        for (const line of lines) {
          paragraphs.push(
            new Paragraph({ children: [new TextRun(line)] })
          );
        }

        if (pageNumber < doc.numPages && preservePages) {
          paragraphs.push(new Paragraph({ children: [new PageBreak()] }));
        }
        setProgress({ done: pageNumber, total: doc.numPages });
      }

      const document = new Document({
        styles: {
          default: {
            document: { run: { font: "Calibri", size: 24 /* 12 pt */ } },
          },
        },
        sections: [{ properties: {}, children: paragraphs }],
      });

      const blob = await Packer.toBlob(document);
      setDownloads([
        {
          name: `${baseName(file.name)}.docx`,
          blob,
          primary: true,
        },
      ]);
    } catch (cause) {
      console.error("PDF to Word failed", cause);
      setError(
        "Couldn't convert this PDF. Scanned (image-only) PDFs have no text to extract — run PDF OCR on it first, then convert again."
      );
    } finally {
      setWorking(false);
      setProgress(null);
      if (doc) {
        await destroyPdfDocument(doc);
      }
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
        heading="Word document ready!"
        detail={`${baseName(file?.name ?? "document")}.pdf → .docx · ${formatBytes(downloads[0].blob.size)}`}
        downloads={downloads}
        onReset={reset}
        resetLabel="Convert another PDF"
        related="pdf-to-word"
        autoDownload
      />
    );
  }

  return (
    <div className={withBarPadding(valid && !working)}>
      <FileTrustBadge />

      <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {!file ? (
          <FileDrop
            onFiles={(files) => {
              setFile(files[0]);
              setError(null);
            }}
            multiple={false}
            accept="application/pdf,.pdf"
            title="Drop a PDF, or click to browse"
            hint="Extracts the text content into an editable Word document — files never leave your device"
            disabled={working}
            icon={FileType}
          />
        ) : (
          <>
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 dark:border-zinc-700">
              <FileType className="h-5 w-5 shrink-0 text-indigo-500" aria-hidden="true" />
              <p className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {file.name}
                <span className="ml-2 text-xs font-normal text-zinc-400 dark:text-zinc-500">
                  {formatBytes(file.size)}
                </span>
              </p>
              <button
                type="button"
                onClick={() => setFile(null)}
                disabled={working}
                aria-label="Remove PDF"
                className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 disabled:opacity-40 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-zinc-200 px-3 py-2.5 dark:border-zinc-700">
              <input
                type="checkbox"
                checked={preservePages}
                onChange={(event) => setPreservePages(event.target.checked)}
                disabled={working}
                className="mt-0.5 h-4 w-4 accent-indigo-600"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                <span className="font-medium">Keep page breaks</span> — start each
                PDF page on a new page in Word.
              </span>
            </label>

            {error && <ErrorBanner message={error} />}

            {working ? (
              <div className="mt-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
                <p className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"
                    aria-hidden="true"
                  />
                  {progress
                    ? `Extracting page ${progress.done} of ${progress.total}…`
                    : "Reading PDF…"}
                </p>
                {progress && progress.total > 0 && (
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-[width] duration-200"
                      style={{ width: `${(progress.done / progress.total) * 100}%` }}
                    />
                  </div>
                )}
                <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                  Building the Word document… — nothing is uploaded.
                </p>
              </div>
            ) : (
              <ActionButton onClick={run} className="mt-4">
                Convert to Word
              </ActionButton>
            )}
          </>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
        <p>
          <strong className="font-semibold text-zinc-700 dark:text-zinc-300">
            Good to know:
          </strong>{" "}
          PDF to Word extracts the <strong>text content</strong> — paragraphs,
          headings and line breaks — into an editable .docx. Images, tables and
          exact layout don&apos;t carry over, and scanned (image-only) PDFs
          have no text to extract: run them through{" "}
          <Link
            href="/tools/pdf-ocr"
            className="font-medium text-indigo-600 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-500 dark:text-indigo-400"
          >
            PDF OCR
          </Link>{" "}
          first.
        </p>
      </div>

      <MobileActionBar show={valid && !working}>
        <ActionButton onClick={run}>Convert to Word</ActionButton>
      </MobileActionBar>
    </div>
  );
}