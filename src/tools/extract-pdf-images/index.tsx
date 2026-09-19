"use client";

import { useState } from "react";
import {
  CircleCheck,
  Download,
  FileImage,
  GalleryThumbnails,
  RefreshCw,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { FileTrustBadge } from "@/components/FileTrustBadge";
import { RelatedTools } from "@/components/RelatedTools";
import {
  ActionButton,
  ErrorBanner,
  FileDrop,
  MobileActionBar,
  withBarPadding,
} from "@/tools/pdf/ui";
import {
  baseName,
  bytesToBlob,
  isPdf,
  timestamp,
  zipFiles,
} from "@/tools/pdf/lib";
import {
  destroyPdfDocument,
  openPdfDocument,
  pixelsToPngUrl,
} from "@/tools/pdf/render";
import { formatBytes } from "@/lib/utils";

interface ExtractedImage {
  page: number;
  name: string;
  url: string;
  size: number;
  blob: Blob;
}

function fingerprint(data: Uint8Array, width: number, height: number): string {
  let seed = `${width}x${height}:${data.length}`;
  for (let i = 0; i < Math.min(32, data.length); i += 1) seed += `${data[i]},`;
  return seed;
}

export function ExtractPdfImages() {
  const [file, setFile] = useState<File | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<ExtractedImage[] | null>(null);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [zipSize, setZipSize] = useState(0);

  const valid = file !== null && isPdf(file);

  const run = async () => {
    if (!file) return;
    setError(null);
    setWorking(true);
    let doc: import("pdfjs-dist").PDFDocumentProxy | null = null;
    try {
      const pdfjs = await import("pdfjs-dist");
      const { OPS } = pdfjs;
      doc = await openPdfDocument(await file.arrayBuffer());
      const found: Map<string, { page: number; data: Uint8Array; width: number; height: number }> =
        new Map();

      for (let pageNo = 1; pageNo <= doc.numPages; pageNo += 1) {
        const page = await doc.getPage(pageNo);
        const opList = await page.getOperatorList();
        const { fnArray, argsArray } = opList;
        for (let op = 0; op < fnArray.length; op += 1) {
          const fn = fnArray[op];
          let imgData:
            | { data: Uint8Array; width: number; height: number; kind?: number }
            | undefined;
          if (fn === OPS.paintImageXObject) {
            const name = argsArray[op]?.[0] as string | undefined;
            if (!name) continue;
            imgData = (await page.objs.get(name)) as typeof imgData;
          } else if (fn === OPS.paintInlineImageXObject) {
            imgData = argsArray[op]?.[0] as typeof imgData;
          } else {
            continue;
          }
          if (!imgData?.data || !imgData.width || !imgData.height) continue;
          const key = fingerprint(imgData.data, imgData.width, imgData.height);
          if (found.has(key)) continue;
          found.set(key, {
            page: pageNo,
            data: imgData.data,
            width: imgData.width,
            height: imgData.height,
          });
        }
      }

      const entries: { name: string; blob: Blob }[] = [];
      const previews = await Promise.all(
        [...found.values()].map(async (img, index) => {
          const data = img.data;
          const isJpeg =
            data[0] === 0xff && data[1] === 0xd8;
          let blob: Blob;
          let url: string;
          let name: string;
          if (isJpeg) {
            blob = bytesToBlob(data, "image/jpeg");
            url = URL.createObjectURL(blob);
            name = `image-${index + 1}.jpg`;
          } else {
            const channels = data.length / (img.width * img.height);
            if (channels !== 1 && channels !== 3 && channels !== 4) {
              return null;
            }
            url = pixelsToPngUrl(data, img.width, img.height, channels);
            blob = await (await fetch(url)).blob();
            name = `image-${index + 1}.png`;
          }
          entries.push({ name, blob });
          return { page: img.page, name, url, size: blob.size, blob } as ExtractedImage;
        })
      );

      const extracted = previews.filter(
        (item): item is ExtractedImage => item !== null
      );
      setImages(extracted);

      if (extracted.length > 0) {
        const zipBlob = await zipFiles(entries);
        const url = URL.createObjectURL(zipBlob);
        setZipUrl(url);
        setZipSize(zipBlob.size);
      }
    } catch (e) {
      console.error("Extract images failed", e);
      setError("Couldn't extract images from this PDF.");
    } finally {
      if (doc) await destroyPdfDocument(doc);
      setWorking(false);
    }
  };

  const reset = () => {
    setImages(null);
    if (zipUrl) URL.revokeObjectURL(zipUrl);
    setZipUrl(null);
    setZipSize(0);
    setFile(null);
    setError(null);
  };

  const downloadItem = (image: ExtractedImage) => {
    const anchor = document.createElement("a");
    anchor.href = image.url;
    anchor.download = image.name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  if (images) {
    const totalSize = images.reduce((sum, image) => sum + image.size, 0);
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
            className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 sm:p-8 dark:border-emerald-500/25 dark:bg-emerald-500/10"
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
            <h2 className="mt-4 text-center text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {images.length > 0
                ? `${images.length} image${images.length > 1 ? "s" : ""} extracted!`
                : "No images found"}
            </h2>
            <p className="mt-1 text-center text-sm text-zinc-500 dark:text-zinc-400">
              {images.length > 0
                ? `Found across ${new Set(images.map((i) => i.page)).size} page${new Set(images.map((i) => i.page)).size > 1 ? "s" : ""} · ${formatBytes(totalSize)} total`
                : "This PDF doesn't appear to contain extractable images."}
            </p>

            {images.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {images.map((image, index) => (
                  <div
                    key={image.name + index}
                    className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700"
                  >
                    <img
                      src={image.url}
                      alt={image.name}
                      className="h-28 w-full object-contain p-2"
                    />
                    <div className="flex items-center justify-between gap-1 border-t border-zinc-100 px-2 py-1.5 dark:border-zinc-800">
                      <span className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                        {image.name} · {formatBytes(image.size)}
                      </span>
                      <button
                        type="button"
                        onClick={() => downloadItem(image)}
                        aria-label={`Download ${image.name}`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10"
                      >
                        <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {images.length > 0 && zipUrl && (
                <a
                  href={zipUrl}
                  download={`${baseName(file?.name ?? "pdf")}-images-${timestamp()}.zip`}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 sm:w-auto"
                >
                  <GalleryThumbnails className="h-4 w-4" aria-hidden="true" />
                  Download all (.zip) · {formatBytes(zipSize)}
                </a>
              )}
              <button
                type="button"
                onClick={reset}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-6 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 sm:w-auto dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                {images.length > 0 ? "Extract from another PDF" : "Try another PDF"}
              </button>
            </div>

            <div className="mt-8 border-t border-emerald-200/70 pt-6 dark:border-emerald-500/20">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Keep going — more free tools
              </p>
              <div className="mt-3">
                <RelatedTools current="extract-pdf-images" limit={3} />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={withBarPadding(valid && !working)}>
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {file ? (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 dark:border-zinc-700">
            <FileImage className="h-5 w-5 shrink-0 text-indigo-500" aria-hidden="true" />
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
            onFiles={(files) => {
              const chosen = files.find(isPdf);
              if (chosen) {
                setImages(null);
                setFile(chosen);
              } else {
                setError("That file isn't a PDF.");
              }
            }}
            multiple={false}
            title="Drop a PDF here, or tap to browse"
            hint="Photos and graphics are scanned, extracted and deduplicated"
            icon={GalleryThumbnails}
          />
        )}

        {error && <ErrorBanner message={error} />}

        <ActionButton
          className="mt-5 hidden sm:inline-flex"
          onClick={run}
          disabled={!valid}
          busy={working}
          busyLabel="Scanning pages…"
        >
          <GalleryThumbnails className="h-4 w-4" aria-hidden="true" />
          Extract images
        </ActionButton>
      </div>

      <MobileActionBar show={valid && !working}>
        <ActionButton onClick={run} disabled={!valid} busy={working} busyLabel="Scanning…">
          <GalleryThumbnails className="h-4 w-4" aria-hidden="true" />
          Extract images
        </ActionButton>
      </MobileActionBar>
    </div>
  );
}