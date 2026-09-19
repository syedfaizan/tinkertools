"use client";

import { useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { FilePenLine } from "lucide-react";
import {
  ActionButton,
  ErrorBanner,
  ResultPanel,
  type DownloadTarget,
} from "@/tools/pdf/ui";
import { pdfBlob, timestamp } from "@/tools/pdf/lib";
import { formatBytes } from "@/lib/utils";

type PageSize = "a4" | "letter";
type Orientation = "portrait" | "landscape";
type Alignment = "left" | "center" | "right";

const SIZES: Record<PageSize, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
};

export function CreatePdf() {
  const [text, setText] = useState("");
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [fontSize, setFontSize] = useState(14);
  const [alignment, setAlignment] = useState<Alignment>("left");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<DownloadTarget[] | null>(null);

  const run = async () => {
    if (!text.trim()) {
      setError("Type some text first — there's nothing to create yet.");
      return;
    }
    setError(null);
    setWorking(true);
    try {
      const doc = await PDFDocument.create();
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const size = fontSize;
      const margin = 48;
      let [pw, ph] = SIZES[pageSize];
      if ((orientation === "landscape") !== (pw > ph)) {
        [pw, ph] = [ph, pw];
      }

      // Wrap the text into measured lines.
      const lines: string[] = [];
      const availW = pw - margin * 2;
      for (const paragraph of text.split(/\r?\n/)) {
        if (paragraph.trim() === "") {
          lines.push("");
          continue;
        }
        let current = "";
        for (const word of paragraph.split(/\s+/)) {
          const candidate = current ? `${current} ${word}` : word;
          if (font.widthOfTextAtSize(candidate, size) <= availW) {
            current = candidate;
          } else {
            if (current) lines.push(current);
            current = word;
          }
        }
        lines.push(current);
      }

      const lineHeight = size * 1.35;
      const availH = ph - margin * 2;
      const linesPerPage = Math.max(1, Math.floor(availH / lineHeight));

      for (let start = 0; start < lines.length; start += linesPerPage) {
        const page = doc.addPage([pw, ph]);
        let y = ph - margin;
        for (const line of lines.slice(start, start + linesPerPage)) {
          if (line === "") {
            y -= lineHeight;
            continue;
          }
          const width = font.widthOfTextAtSize(line, size);
          let x = margin;
          if (alignment === "center") x = (pw - width) / 2;
          else if (alignment === "right") x = pw - margin - width;
          page.drawText(line, {
            x,
            y,
            size,
            font,
            color: rgb(0.12, 0.12, 0.14),
          });
          y -= lineHeight;
        }
      }

      const out = new Uint8Array(await doc.save());
      setDownloads([
        {
          name: `document-${timestamp()}.pdf`,
          blob: pdfBlob(out),
          primary: true,
        },
      ]);
    } catch (e) {
      console.error("Create PDF failed", e);
      setError("Couldn't create the PDF. Try different settings.");
    } finally {
      setWorking(false);
    }
  };

  const reset = () => {
    setDownloads(null);
    setText("");
    setError(null);
  };

  if (downloads) {
    return (
      <ResultPanel
        heading="PDF created!"
        detail={`${text.trim().split(/\s+/).length} words · ${formatBytes(downloads[0].blob.size)}`}
        downloads={downloads}
        onReset={reset}
        resetLabel="Create another PDF"
        related="create-pdf"
      />
    );
  }

  const inputCls =
    "rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200";

  return (
    <div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Content
          </span>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={12}
            placeholder="Type or paste the content for your PDF…"
            className="mt-2 w-full resize-y rounded-xl border border-zinc-300 bg-white p-3.5 text-sm leading-relaxed text-zinc-800 placeholder:text-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
          />
        </label>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Page size
            </span>
            <select
              value={pageSize}
              onChange={(event) => setPageSize(event.target.value as PageSize)}
              className={`${inputCls} mt-2 w-full`}
            >
              <option value="a4">A4</option>
              <option value="letter">Letter</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Orientation
            </span>
            <select
              value={orientation}
              onChange={(event) => setOrientation(event.target.value as Orientation)}
              className={`${inputCls} mt-2 w-full`}
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Font size
            </span>
            <select
              value={fontSize}
              onChange={(event) => setFontSize(Number(event.target.value))}
              className={`${inputCls} mt-2 w-full`}
            >
              {[10, 11, 12, 14, 16, 18, 20].map((option) => (
                <option key={option} value={option}>
                  {option} pt
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Alignment
            </span>
            <select
              value={alignment}
              onChange={(event) => setAlignment(event.target.value as Alignment)}
              className={`${inputCls} mt-2 w-full`}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </label>
        </div>

        {error && <ErrorBanner message={error} />}

        <ActionButton
          className="mt-5"
          onClick={run}
          disabled={!text.trim()}
          busy={working}
          busyLabel="Creating PDF…"
        >
          <FilePenLine className="h-4 w-4" aria-hidden="true" />
          Create PDF
        </ActionButton>
      </div>
    </div>
  );
}