"use client";

import { useState } from "react";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import { Droplets, FileDown, Type, X } from "lucide-react";
import {
  ActionButton,
  ErrorBanner,
  FileDrop,
  ResultPanel,
  type DownloadTarget,
} from "@/tools/pdf/ui";
import { baseName, isPdf, pdfBlob } from "@/tools/pdf/lib";
import { formatBytes } from "@/lib/utils";

type Mode = "text" | "image";

export function AddWatermark() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>("text");
  const [text, setText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(30);
  const [logoTarget, setLogoTarget] = useState<File | null>(null);
  const [logoScale, setLogoScale] = useState(25);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<DownloadTarget[] | null>(null);

  const valid = file !== null && isPdf(file);

  const run = async () => {
    if (!file || !valid) return;
    const applyText = mode === "text" && text.trim().length > 0;
    const applyImage = mode === "image" && logoTarget !== null;
    if (!applyText && !applyImage) {
      setError(mode === "text" ? "Type the watermark text first." : "Add a watermark image first.");
      return;
    }
    setError(null);
    setWorking(true);
    try {
      const doc = await PDFDocument.load(await file.arrayBuffer(), {
        ignoreEncryption: false,
      });
      const pages = doc.getPages();
      if (mode === "text") {
        const font = await doc.embedFont(StandardFonts.HelveticaBold);
        const color = rgb(0.35, 0.35, 0.4);
        for (const page of pages) {
          const { width, height } = page.getSize();
          page.drawText(text.trim(), {
            x: (width - font.widthOfTextAtSize(text.trim(), fontSize)) / 2,
            y: (height - fontSize) / 2,
            size: fontSize,
            font,
            color,
            opacity: Math.max(0.05, opacity / 100),
            rotate: degrees(-25),
          });
        }
      } else {
        const imgFile = logoTarget!;
        const fileType = imgFile.type.toLowerCase();
        const bytes = await imgFile.arrayBuffer();
        const image =
          fileType === "image/jpeg" ? await doc.embedJpg(bytes) : await doc.embedPng(bytes);
        for (const page of pages) {
          const { width } = page.getSize();
          const drawW = (width * Math.max(5, logoScale)) / 100;
          const drawH = (drawW / image.width) * image.height;
          page.drawImage(image, {
            x: (width - drawW) / 2,
            y: (page.getHeight() - drawH) / 2,
            width: drawW,
            height: drawH,
            opacity: Math.max(0.05, opacity / 100),
          });
        }
      }
      const out = new Uint8Array(await doc.save());
      setDownloads([
        {
          name: `${baseName(file.name)}-watermarked.pdf`,
          blob: pdfBlob(out),
          primary: true,
        },
      ]);
    } catch (e) {
      console.error("Watermark failed", e);
      setError("Couldn't watermark this PDF. Make sure it's a valid, unencrypted PDF.");
    } finally {
      setWorking(false);
    }
  };

  const reset = () => {
    setDownloads(null);
    setFile(null);
    setLogoTarget(null);
    setError(null);
  };

  if (downloads) {
    return (
      <ResultPanel
        heading="Watermark added!"
        detail={`${mode === "text" ? text.trim() : "Image"} applied to every page · ${formatBytes(downloads[0].blob.size)}`}
        downloads={downloads}
        onReset={reset}
        resetLabel="Watermark another PDF"
        related="add-watermark"
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
            hint="The watermark is applied to every page"
          />
        )}

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setMode("text")}
            className={`flex min-h-12 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors ${
              mode === "text"
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            <Type className="h-4 w-4" aria-hidden="true" />
            Text watermark
          </button>
          <button
            type="button"
            onClick={() => setMode("image")}
            className={`flex min-h-12 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors ${
              mode === "image"
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            <Droplets className="h-4 w-4" aria-hidden="true" />
            Image watermark
          </button>
        </div>

        {mode === "text" ? (
          <label className="mt-4 block">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Watermark text
            </span>
            <input
              type="text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              className={`${inputCls} mt-2 w-full`}
              placeholder="e.g. CONFIDENTIAL"
            />
          </label>
        ) : logoTarget ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 dark:border-zinc-700">
            <Droplets className="h-5 w-5 shrink-0 text-indigo-500" aria-hidden="true" />
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {logoTarget.name}
            </p>
            <button
              type="button"
              onClick={() => setLogoTarget(null)}
              aria-label="Remove image"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <FileDrop
            className="mt-4"
            onFiles={(files) => {
              const imageFile = files.find((f) => f.type.startsWith("image/"));
              if (imageFile) setLogoTarget(imageFile);
              else setError("Choose an image (PNG or JPG) for the watermark.");
            }}
            multiple={false}
            accept="image/png,image/jpeg"
            icon={Droplets}
            title="Add a watermark image"
            hint="PNG or JPG · placed centered on every page"
          />
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {mode === "text" && (
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Size
              </span>
              <select
                value={fontSize}
                onChange={(event) => setFontSize(Number(event.target.value))}
                className={`${inputCls} mt-2 w-full`}
              >
                {[24, 36, 48, 64, 80, 100].map((option) => (
                  <option key={option} value={option}>
                    {option} pt
                  </option>
                ))}
              </select>
            </label>
          )}
          {mode === "image" && (
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Logo width · {logoScale}%
              </span>
              <input
                type="range"
                min={10}
                max={80}
                value={logoScale}
                onChange={(event) => setLogoScale(Number(event.target.value))}
                className="mt-4 w-full accent-indigo-600"
              />
            </label>
          )}
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Opacity · {opacity}%
            </span>
            <input
              type="range"
              min={5}
              max={100}
              value={opacity}
              onChange={(event) => setOpacity(Number(event.target.value))}
              className="mt-4 w-full accent-indigo-600"
            />
          </label>
        </div>

        {error && <ErrorBanner message={error} />}

        <ActionButton
          className="mt-5"
          onClick={run}
          disabled={!valid}
          busy={working}
          busyLabel="Watermarking…"
        >
          <Droplets className="h-4 w-4" aria-hidden="true" />
          Add watermark
        </ActionButton>
      </div>
    </div>
  );
}