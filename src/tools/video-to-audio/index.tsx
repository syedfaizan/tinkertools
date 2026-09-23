"use client";

import { useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { Film, X } from "lucide-react";
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

type Format = "mp3" | "m4a" | "wav";

const FORMATS: { id: Format; label: string; detail: string; mime: string }[] = [
  { id: "mp3", label: "MP3", detail: "Best compatibility (MP3, ~256 kbps)", mime: "audio/mpeg" },
  { id: "m4a", label: "M4A", detail: "Smaller files, high quality (AAC)", mime: "audio/mp4" },
  { id: "wav", label: "WAV", detail: "Lossless, large files (PCM)", mime: "audio/wav" },
];

const VIDEO_EXTS = ["mp4", "mov", "webm", "mkv", "avi", "m4v", "3gp", "ogv", "flv", "wmv"];

/**
 * The ffmpeg engine itself (~30 MB, single-thread build) is fetched from a CDN
 * once and cached by the browser, mirroring how the OCR tool loads tesseract.
 * Loading it on demand keeps the rest of the site light.
 */
const CORE_URL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd";

let ffmpegPromise: Promise<FFmpeg> | null = null;
let reportProgress: ((progress: number) => void) | null = null;

function loadFFmpeg(): Promise<FFmpeg> {
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      const ffmpeg = new FFmpeg();
      ffmpeg.on("progress", ({ progress }) => {
        if (
          typeof progress === "number" &&
          Number.isFinite(progress) &&
          progress >= 0 &&
          progress <= 1
        ) {
          reportProgress?.(progress);
        }
      });
      await ffmpeg.load({
        coreURL: await toBlobURL(`${CORE_URL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${CORE_URL}/ffmpeg-core.wasm`, "application/wasm"),
      });
      return ffmpeg;
    })();
    // Allow a retried conversion if the engine failed to load.
    ffmpegPromise.catch(() => {
      ffmpegPromise = null;
    });
  }
  return ffmpegPromise;
}

function isVideo(file: File): boolean {
  if (file.type.startsWith("video/")) return true;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return VIDEO_EXTS.includes(ext);
}

/** Copy into a fresh ArrayBuffer so the bytes satisfy BlobPart across TS targets. */
function bytesToBlob(bytes: Uint8Array, type: string): Blob {
  return new Blob([new Uint8Array(bytes)], { type });
}

export function VideoToAudio() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<Format>("mp3");
  const [working, setWorking] = useState(false);
  const [loadingEngine, setLoadingEngine] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<DownloadTarget[] | null>(null);

  const valid = file !== null && isVideo(file);
  const selectedFormat = FORMATS.find((fmt) => fmt.id === format) ?? FORMATS[0];

  const run = async () => {
    if (!file) return;
    setError(null);
    setWorking(true);
    setProgress(null);
    setLoadingEngine(true);
    try {
      const ffmpeg = await loadFFmpeg();
      setLoadingEngine(false);
      reportProgress = (value) => setProgress(value);

      const ext = (file.name.split(".").pop() ?? "video").toLowerCase();
      const inputName = `input.${ext}`;
      const outputName = `output.${format}`;

      await ffmpeg.writeFile(inputName, await fetchFile(file));
      const args = ["-i", inputName, "-vn", "-y"];
      if (format === "mp3") args.push("-acodec", "libmp3lame", "-q:a", "3");
      else if (format === "m4a") args.push("-acodec", "aac", "-b:a", "192k");
      else args.push("-acodec", "pcm_s16le");
      args.push(outputName);

      await ffmpeg.exec(args);
      const data = await ffmpeg.readFile(outputName);
      const bytes =
        typeof data === "string" ? new TextEncoder().encode(data) : data;
      setDownloads([
        {
          name: `${baseName(file.name)}.${format}`,
          blob: bytesToBlob(bytes, selectedFormat.mime),
          primary: true,
        },
      ]);
      await Promise.allSettled([
        ffmpeg.deleteFile(inputName),
        ffmpeg.deleteFile(outputName),
      ]);
    } catch (cause) {
      console.error("Video to audio failed", cause);
      setError(
        "Couldn't extract the audio. Make sure the file is a supported video (MP4, MOV, WebM, MKV…) and not corrupted — and try again."
      );
    } finally {
      reportProgress = null;
      setWorking(false);
      setProgress(null);
      setLoadingEngine(false);
    }
  };

  const reset = () => {
    setDownloads(null);
    setFile(null);
    setError(null);
    setProgress(null);
  };

  if (downloads) {
    return (
      <ResultPanel
        heading="Audio extracted!"
        detail={`${baseName(file?.name ?? "video")} → ${selectedFormat.label} · ${formatBytes(downloads[0].blob.size)}`}
        downloads={downloads}
        onReset={reset}
        resetLabel="Extract another video"
        related="video-to-audio"
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
            accept="video/*,.mp4,.mov,.webm,.mkv,.avi,.m4v,.3gp,.ogv,.flv,.wmv"
            title="Drop a video file, or click to browse"
            hint="MP4, MOV, WebM, MKV, AVI and more — processed entirely on your device"
            disabled={working}
            icon={Film}
          />
        ) : (
          <>
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 dark:border-zinc-700">
              <Film className="h-5 w-5 shrink-0 text-indigo-500" aria-hidden="true" />
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
                aria-label="Remove video"
                className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 disabled:opacity-40 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Output format
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              {FORMATS.map((fmt) => {
                const active = fmt.id === format;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setFormat(fmt.id)}
                    disabled={working}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-left transition-colors disabled:opacity-60",
                      active
                        ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/30 dark:bg-indigo-500/10"
                        : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-800"
                    )}
                  >
                    <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {fmt.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-400 dark:text-zinc-500">
                      {fmt.detail}
                    </span>
                  </button>
                );
              })}
            </div>

            {error && <ErrorBanner message={error} />}

            {working ? (
              <div className="mt-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
                <p className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" aria-hidden="true" />
                  {loadingEngine
                    ? "Loading the audio engine… (one-time ~30 MB download, cached afterwards)"
                    : "Extracting audio…"}
                </p>
                {!loadingEngine && progress !== null && (
                  <div className="mt-3">
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-[width] duration-200"
                        style={{ width: `${Math.round(progress * 100)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                      {Math.round(progress * 100)}%
                    </p>
                  </div>
                )}
                <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                  Large videos can take a little while — everything stays on this device.
                </p>
              </div>
            ) : (
              <ActionButton onClick={run} className="mt-4">
                Extract audio
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
          use this with video files you own or have rights to (your own
          recordings, purchased or Creative Commons media). There are no
          YouTube or Instagram download tools here — and there never will be,
          by design.
        </p>
      </div>

      <MobileActionBar show={valid && !working}>
        <ActionButton onClick={run}>
          Extract audio
        </ActionButton>
      </MobileActionBar>
    </div>
  );
}