"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { FileImage, Images, X } from "lucide-react";
import {
  ActionButton,
  ErrorBanner,
  FileDrop,
  MobileActionBar,
  ResultPanel,
  withBarPadding,
  type DownloadTarget,
} from "@/tools/pdf/ui";
import { pdfBlob } from "@/tools/pdf/lib";
import { formatBytes } from "@/lib/utils";

type PageSize = "fit" | "a4" | "letter";
type Orientation = "auto" | "portrait" | "landscape";

const PAGE_SIZES: Record<Exclude<PageSize, "fit">, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
};

interface ImageEntry {
  id: string;
  file: File;
}

interface Normalized {
  data: ArrayBuffer;
  kind: "png" | "jpg";
  width: number;
  height: number;
}

/** Normalize any browser-supported image (webp, bmp, gif, avif…) to PNG/JPEG. */
async function normalizeImage(file: File): Promise<Normalized> {
  const type = file.type.toLowerCase();
  if (type === "image/jpeg" || type === "image/png") {
    const bitmap = await createImageBitmap(file);
    const dims = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return { data: await file.arrayBuffer(), kind: type === "image/jpeg" ? "jpg" : "png", ...dims };
  }
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0);
  const { width, height } = bitmap;
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png")
  );
  if (!blob) throw new Error("Could not decode image");
  return { data: await blob.arrayBuffer(), kind: "png", width, height };
}

export function ImagesToPdf() {
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("fit");
  const [orientation, setOrientation] = useState<Orientation>("auto");
  const [margin, setMargin] = useState(0);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<DownloadTarget[] | null>(null);

  const addFiles = (files: File[]) => {
    const valid = files.filter((file) => file.type.startsWith("image/"));
    const rejected = files.length - valid.length;
    setImages((prev) => [
      ...prev,
      ...valid.map((file) => ({
        id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
        file,
      })),
    ]);
    setError(
      rejected > 0
        ? `${rejected} file${rejected > 1 ? "s were" : " was"} skipped — only images can be converted.`
        : null
    );
  };

  const removeImage = (id: string) =>
    setImages((prev) => prev.filter((entry) => entry.id !== id));

  const run = async () => {
    if (images.length === 0) return;
    setError(null);
    setWorking(true);
    try {
      const doc = await PDFDocument.create();
      for (const entry of images) {
        const { data, kind, width, height } = await normalizeImage(entry.file);
        const image =
          kind === "jpg" ? await doc.embedJpg(data) : await doc.embedPng(data);

        let pageW: number;
        let pageH: number;
        if (pageSize === "fit") {
          const maxSide = 2000;
          const scale = Math.min(1, maxSide / Math.max(width, height)) * 0.75;
          pageW = Math.max(10, width * scale);
          pageH = Math.max(10, height * scale);
        } else {
          [pageW, pageH] = PAGE_SIZES[pageSize];
          const landscape = width > height;
          const wantLandscape =
            orientation === "auto" ? landscape : orientation === "landscape";
          if (wantLandscape && pageW < pageH) {
            [pageW, pageH] = [pageH, pageW];
          } else if (!wantLandscape && pageW > pageH) {
            [pageW, pageH] = [pageH, pageW];
          }
        }

        const marginPoints = (margin / 96) * 72; // px → pt
        const availW = Math.max(20, pageW - marginPoints * 2);
        const availH = Math.max(20, pageH - marginPoints * 2);
        const fit = Math.min(availW / image.width, availH / image.height, 1);
        const drawW = image.width * fit;
        const drawH = image.height * fit;
        const page = doc.addPage([pageW, pageH]);
        page.drawImage(image, {
          x: (pageW - drawW) / 2,
          y: (pageH - drawH) / 2,
          width: drawW,
          height: drawH,
        });
      }
      const out = new Uint8Array(await doc.save());
      const name = `images-${new Date().toISOString().slice(0, 10)}.pdf`;
      setDownloads([{ name, blob: pdfBlob(out), primary: true }]);
    } catch (e) {
      console.error("Images to PDF failed", e);
      setError("Couldn't build the PDF from those images.");
    } finally {
      setWorking(false);
    }
  };

  const reset = () => {
    setDownloads(null);
    setImages([]);
    setError(null);
  };

  if (downloads) {
    return (
      <ResultPanel
        heading="PDF created!"
        detail={`${downloads[0].blob.size} bytes`}
        downloads={downloads}
        onReset={reset}
        related="images-to-pdf"
        autoDownload
      />
    );
  }

  const showBar = images.length > 0 && !working;
  const totalSize = images.reduce((sum, entry) => sum + entry.file.size, 0);

  return (
    <div className={withBarPadding(showBar)}>
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {images.length === 0 ? (
          <FileDrop
            onFiles={addFiles}
            accept="image/png,image/jpeg,image/webp,image/bmp,image/gif,image/*"
            icon={Images}
            title="Drop images here, or tap to browse"
            hint="PNG, JPG, WebP, BMP, GIF · each becomes a PDF page"
          />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {images.length} image{images.length > 1 ? "s" : ""} ·{" "}
                {formatBytes(totalSize)}
              </p>
              <button
                type="button"
                onClick={() => setImages([])}
                className="inline-flex min-h-9 items-center gap-1.5 px-2 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Clear
              </button>
            </div>
            <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
              {images.map((entry) => (
                <li
                  key={entry.id}
                  className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800"
                >
                  <img
                    src={URL.createObjectURL(entry.file)}
                    alt={entry.file.name}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(entry.id)}
                    aria-label={`Remove ${entry.file.name}`}
                    className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900/60 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-zinc-900/70 to-transparent px-2 pb-1.5 pt-4 text-[10px] font-medium text-white">
                    {entry.file.name}
                  </span>
                </li>
              ))}
            </ul>
            <FileDrop
              className="mt-3"
              onFiles={addFiles}
              accept="image/*"
              title="Add more images"
              hint="PNG, JPG, WebP, BMP, GIF"
            />
          </>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Page size
            </span>
            <select
              value={pageSize}
              onChange={(event) => setPageSize(event.target.value as PageSize)}
              className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
            >
              <option value="fit">Fit image size</option>
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
              disabled={pageSize === "fit"}
              className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-800 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
            >
              <option value="auto">Match image</option>
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Margin · {margin}px
            </span>
            <input
              type="range"
              min={0}
              max={48}
              value={margin}
              onChange={(event) => setMargin(Number(event.target.value))}
              className="mt-4 w-full accent-indigo-600"
            />
          </label>
        </div>

        {error && <ErrorBanner message={error} />}

        <ActionButton
          className="mt-5 hidden sm:inline-flex"
          onClick={run}
          disabled={images.length === 0}
          busy={working}
          busyLabel="Creating…"
        >
          <FileImage className="h-4 w-4" aria-hidden="true" />
          Convert {images.length > 0 ? `${images.length} image${images.length > 1 ? "s" : ""} to PDF` : "images"}
        </ActionButton>
      </div>

      <MobileActionBar show={showBar}>
        <ActionButton onClick={run} disabled={images.length === 0} busy={working} busyLabel="Creating…">
          <FileImage className="h-4 w-4" aria-hidden="true" />
          Convert {images.length} image{images.length > 1 ? "s" : ""}
        </ActionButton>
      </MobileActionBar>
    </div>
  );
}