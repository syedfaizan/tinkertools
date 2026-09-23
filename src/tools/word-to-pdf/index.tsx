"use client";

import { useRef, useState, type RefObject } from "react";
import { FileText, X } from "lucide-react";
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
import { baseName } from "@/tools/pdf/lib";
import { cn, formatBytes } from "@/lib/utils";

type PageSize = "a4" | "letter";

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function isDocx(file: File): boolean {
  return (
    file.type === DOCX_MIME ||
    (file.name.toLowerCase().endsWith(".docx") && file.type !== "application/msword")
  );
}

function waitForNode(
  ref: RefObject<HTMLDivElement | null>,
  expectedHtml: string
): Promise<void> {
  return new Promise((resolve) => {
    let tries = 0;
    const check = () => {
      tries += 1;
      if (
        (ref.current && ref.current.innerHTML.length >= expectedHtml.length / 2) ||
        tries > 200
      ) {
        resolve();
      } else {
        requestAnimationFrame(check);
      }
    };
    requestAnimationFrame(check);
  });
}

export function WordToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [html, setHtml] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<DownloadTarget[] | null>(null);
  const docRef = useRef<HTMLDivElement>(null);

  const valid = file !== null && isDocx(file);

  const run = async () => {
    if (!file || !valid) return;
    setError(null);
    setWorking(true);
    try {
      // 1. .docx → styled HTML (mammoth, runs entirely in the browser).
      const mammoth = await import("mammoth");
      const result = await mammoth.convertToHtml({
        arrayBuffer: await file.arrayBuffer(),
      });
      setHtml(result.value);

      // 2. Wait until the hidden preview node has been painted, then capture it.
      await waitForNode(docRef, result.value);
      await new Promise((resolve) => setTimeout(resolve, 80));

      const html2pdf = (await import("html2pdf.js")).default;
      if (!docRef.current) {
        throw new Error("Document preview wasn't ready.");
      }
      const blob = await html2pdf()
        .set({
          margin: 0,
          filename: `${baseName(file.name)}.pdf`,
          image: { type: "jpeg", quality: 0.96 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: {
            unit: "pt",
            format: pageSize === "a4" ? "a4" : "letter",
            orientation: "portrait",
          },
          pagebreak: { mode: ["css", "legacy"] },
        } as NonNullable<Parameters<typeof html2pdf>[1]>)
        .from(docRef.current)
        .outputPdf("blob");

      setDownloads([
        { name: `${baseName(file.name)}.pdf`, blob: blob as Blob, primary: true },
      ]);
    } catch (cause) {
      console.error("Word to PDF failed", cause);
      setError(
        "Couldn't convert this file. Make sure it's a real .docx file (Word 2007 or newer — older .doc files aren't supported)."
      );
    } finally {
      setWorking(false);
    }
  };

  const reset = () => {
    setDownloads(null);
    setFile(null);
    setHtml(null);
    setError(null);
  };

  if (downloads) {
    return (
      <ResultPanel
        heading="PDF ready!"
        detail={`${baseName(file?.name ?? "document")}.docx → PDF · ${formatBytes(downloads[0].blob.size)}`}
        downloads={downloads}
        onReset={reset}
        resetLabel="Convert another document"
        related="word-to-pdf"
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
              setHtml(null);
              setError(null);
            }}
            multiple={false}
            accept={`.docx,${DOCX_MIME}`}
            title="Drop a Word document, or click to browse"
            hint=".docx files (Word 2007 and newer) — converted entirely on your device"
            disabled={working}
            icon={FileText}
          />
        ) : (
          <>
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 dark:border-zinc-700">
              <FileText className="h-5 w-5 shrink-0 text-indigo-500" aria-hidden="true" />
              <p className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {file.name}
                <span className="ml-2 text-xs font-normal text-zinc-400 dark:text-zinc-500">
                  {formatBytes(file.size)}
                </span>
              </p>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setHtml(null);
                }}
                disabled={working}
                aria-label="Remove document"
                className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 disabled:opacity-40 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Page size
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  { id: "a4", label: "A4", detail: "210 × 297 mm" },
                  { id: "letter", label: "US Letter", detail: "8.5 × 11 in" },
                ] as { id: PageSize; label: string; detail: string }[]
              ).map((option) => {
                const active = option.id === pageSize;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setPageSize(option.id)}
                    disabled={working}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-left transition-colors disabled:opacity-60",
                      active
                        ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/30 dark:bg-indigo-500/10"
                        : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-800"
                    )}
                  >
                    <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {option.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-400 dark:text-zinc-500">
                      {option.detail}
                    </span>
                  </button>
                );
              })}
            </div>

            {error && <ErrorBanner message={error} />}

            {working ? (
              <div className="mt-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
                <p className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"
                    aria-hidden="true"
                  />
                  Setting up pages…
                </p>
                <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                  Long documents with images can take a minute — nothing is uploaded.
                </p>
              </div>
            ) : (
              <ActionButton onClick={run} className="mt-4">
                Convert to PDF
              </ActionButton>
            )}
          </>
        )}
      </div>

      {/* Off-screen rendering target for the PDF capture. */}
      {html && (
        <>
          <style>{`
            .w2p-capture {
              position: absolute;
              left: -100000px;
              top: 0;
              box-sizing: border-box;
              width: ${pageSize === "a4" ? 794 : 816}px;
              background: #fff;
              color: #1a1a1a;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                "Helvetica Neue", Arial, sans-serif;
              font-size: 14px;
              line-height: 1.55;
              padding: 64px 72px;
              word-wrap: break-word;
            }
            .w2p-capture * { box-sizing: border-box; }
            .w2p-capture h1 { font-size: 28px; margin: 0 0 16px; }
            .w2p-capture h2 { font-size: 22px; margin: 22px 0 10px; }
            .w2p-capture h3 { font-size: 18px; margin: 18px 0 8px; }
            .w2p-capture h4, .w2p-capture h5, .w2p-capture h6 { font-size: 15px; margin: 14px 0 6px; }
            .w2p-capture p { margin: 0 0 10px; }
            .w2p-capture ul, .w2p-capture ol { margin: 0 0 10px; padding-left: 26px; }
            .w2p-capture table { border-collapse: collapse; width: 100%; margin: 0 0 12px; }
            .w2p-capture td, .w2p-capture th { border: 1px solid #bbb; padding: 6px 8px; }
            .w2p-capture img { max-width: 100%; height: auto; }
            .w2p-capture pre { white-space: pre-wrap; font-family: Consolas, Menlo, monospace; }
          `}</style>
          <div
            ref={docRef}
            className="w2p-capture"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </>
      )}

      <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
        <p>
          <strong className="font-semibold text-zinc-700 dark:text-zinc-300">
            Good to know:
          </strong>{" "}
          this converts <strong>.docx</strong> files (Word 2007 and newer); older
          binary <strong>.doc</strong> files aren&apos;t supported. Everything
          runs in your browser — your document never leaves your device.
        </p>
      </div>

      <MobileActionBar show={valid && !working}>
        <ActionButton onClick={run}>Convert to PDF</ActionButton>
      </MobileActionBar>
    </div>
  );
}