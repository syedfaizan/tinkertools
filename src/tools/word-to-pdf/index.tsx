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
  const viewportRef = useRef<HTMLDivElement>(null);

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

      // Let images decode and fonts settle so the laid-out height is the
      // final one. The resume we test with embeds 18 images via data: URIs;
      // capturing before they decode makes the measurement (and hence the
      // band count) wrong and can truncate content.
      const contentNode = docRef.current;
      if (contentNode) {
        const embedded = Array.from(contentNode.querySelectorAll("img"));
        if (embedded.length > 0) {
          await Promise.race([
            Promise.all(
              embedded.map(
                (img) =>
                  img.complete && img.naturalWidth > 0
                    ? Promise.resolve()
                    : new Promise<void>((resolve) => {
                        img.addEventListener("load", () => resolve(), { once: true });
                        img.addEventListener("error", () => resolve(), { once: true });
                      })
              )
            ),
            new Promise<void>((resolve) => setTimeout(resolve, 5000)),
          ]);
        }
      }
      await document.fonts.ready;
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (!docRef.current) {
        throw new Error("Document preview wasn't ready.");
      }

      // 2. Rasterize the preview one page at a time. A single full-document
      //    capture would need a canvas as tall as the whole document (~2245
      //    px of canvas per PDF page), and browsers clip canvas height at
      //    their GPU's max texture size (often 4096/8192 px on integrated
      //    graphics). Long documents therefore silently lost everything past
      //    the first ~4 pages. Instead we slide the content inside a
      //    fixed-height, overflow:hidden viewport and capture each page band
      //    separately, so every canvas we create fits on any device.
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const scale = 2;
      const pageW = pageSize === "a4" ? 595.28 : 612; // pt
      const pageH = pageSize === "a4" ? 841.89 : 792; // pt
      const viewport = viewportRef.current;
      const content = docRef.current;
      if (!viewport || !content) {
        throw new Error("Document preview wasn't ready.");
      }

      const cssWidth = pageSize === "a4" ? 794 : 816;
      const pxPageHeight = Math.floor(cssWidth * scale * (pageH / pageW));
      const bandCss = pxPageHeight / scale;
      const docH = content.scrollHeight;
      let nPages = Math.max(1, Math.ceil(docH / bandCss));
      // Drop a trailing sliver smaller than a line of text — it can't hold
      // any visible glyphs and would render as a spurious near-blank page.
      const lastBand = docH - (nPages - 1) * bandCss;
      if (nPages > 1 && lastBand < 20) nPages -= 1;

      const pdf = new jsPDF({
        unit: "pt",
        format: pageSize === "a4" ? "a4" : "letter",
        orientation: "portrait",
      });

      const capturePage = async (heightCss: number, scaleFactor: number) => {
        viewport.style.height = `${heightCss}px`;
        return html2canvas(viewport, {
          scale: scaleFactor,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
        } as Parameters<typeof html2canvas>[1]);
      };

      for (let pageIndex = 0; pageIndex < nPages; pageIndex++) {
        content.style.transform = `translateY(${-Math.round(pageIndex * bandCss * 1000) / 1000}px)`;

        const isLastPage = pageIndex === nPages - 1;
        const bandHeight = isLastPage
          ? Math.max(1, docH - (nPages - 1) * bandCss)
          : bandCss;
        const fullBand = bandHeight >= bandCss - 0.05;

        let pageCanvas = await capturePage(fullBand ? bandCss : bandHeight, scale);

        // The GPU clamped this canvas (returned height smaller than the band
        // we asked for): re-capture that page at scale 1 so it fits.
        const expected = Math.round((fullBand ? bandCss : bandHeight) * scale);
        if (pageCanvas.height < expected - 1) {
          pageCanvas = await capturePage(fullBand ? bandCss : bandHeight, 1);
        }

        // Derive the final size from the actual canvas so aspect ratio holds
        // even when a page was re-captured at a lower scale.
        const heightPt = (pageCanvas.height * pageW) / pageCanvas.width;
        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(pageCanvas, "JPEG", 0, 0, pageW, heightPt);
      }

      const blob: Blob = pdf.output("blob");

      setDownloads([
        { name: `${baseName(file.name)}.pdf`, blob, primary: true },
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
              width: ${pageSize === "a4" ? 794 : 816}px;
            }
            .w2p-viewport {
              overflow: hidden;
              width: 100%;
            }
            .w2p-content {
              box-sizing: border-box;
              background: #fff;
              color: #1a1a1a;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                "Helvetica Neue", Arial, sans-serif;
              font-size: 14px;
              line-height: 1.55;
              padding: 64px 72px;
              word-wrap: break-word;
            }
            .w2p-content * { box-sizing: border-box; }
            .w2p-content h1 { font-size: 28px; margin: 0 0 16px; }
            .w2p-content h2 { font-size: 22px; margin: 22px 0 10px; }
            .w2p-content h3 { font-size: 18px; margin: 18px 0 8px; }
            .w2p-content h4, .w2p-content h5, .w2p-content h6 { font-size: 15px; margin: 14px 0 6px; }
            .w2p-content p { margin: 0 0 10px; }
            .w2p-content ul, .w2p-content ol { margin: 0 0 10px; padding-left: 26px; }
            .w2p-content table { border-collapse: collapse; width: 100%; margin: 0 0 12px; }
            .w2p-content td, .w2p-content th { border: 1px solid #bbb; padding: 6px 8px; }
            .w2p-content img { max-width: 100%; height: auto; }
            .w2p-content pre { white-space: pre-wrap; font-family: Consolas, Menlo, monospace; }
          `}</style>
          <div className="w2p-capture" aria-hidden="true">
            <div ref={viewportRef} className="w2p-viewport">
              <div
                ref={docRef}
                className="w2p-content"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </div>
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