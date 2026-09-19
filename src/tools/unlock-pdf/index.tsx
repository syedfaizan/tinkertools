"use client";

import { useState } from "react";
import { Eye, EyeOff, LockOpen } from "lucide-react";
import { decryptPDF, isEncrypted } from "@pdfsmaller/pdf-decrypt";
import {
  ActionButton,
  ErrorBanner,
  FileDrop,
  ResultPanel,
  type DownloadTarget,
} from "@/tools/pdf/ui";
import { baseName, isPdf, pdfBlob } from "@/tools/pdf/lib";
import { formatBytes } from "@/lib/utils";

export function UnlockPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<DownloadTarget[] | null>(null);

  const valid = file !== null && isPdf(file);

  const run = async () => {
    if (!file) return;
    setError(null);
    setWorking(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const status = await isEncrypted(bytes);
      if (!status.encrypted) {
        setError("This PDF isn't password-protected — no password is needed to open it.");
        return;
      }
      if (!password) {
        setError("Enter the PDF's password to unlock it.");
        return;
      }
      const decrypted = await decryptPDF(bytes, password);
      setDownloads([
        {
          name: `${baseName(file.name)}-unlocked.pdf`,
          blob: pdfBlob(decrypted),
          primary: true,
        },
      ]);
    } catch (e) {
      console.error("Unlock failed", e);
      const message = e instanceof Error ? e.message : String(e);
      if (/incorrect password/i.test(message)) {
        setError("That password didn't work. Check it and try again.");
      } else if (/unsupported/i.test(message)) {
        setError(
          "This PDF uses an encryption type this tool can't read yet (AES-128 or newer)."
        );
      } else if (/not encrypted/i.test(message)) {
        setError("This PDF isn't password-protected.");
      } else {
        setError("Couldn't unlock this PDF. Make sure it's a valid PDF.");
      }
    } finally {
      setWorking(false);
    }
  };

  const reset = () => {
    setDownloads(null);
    setFile(null);
    setPassword("");
    setError(null);
  };

  if (downloads) {
    return (
      <ResultPanel
        heading="PDF unlocked!"
        detail={`Password removed · ${formatBytes(downloads[0].blob.size)}`}
        downloads={downloads}
        onReset={reset}
        resetLabel="Unlock another PDF"
        related="unlock-pdf"
        autoDownload
      />
    );
  }

  return (
    <div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {file ? (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 dark:border-zinc-700">
            <LockOpen className="h-5 w-5 shrink-0 text-indigo-500" aria-hidden="true" />
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {file.name}
            </p>
            <span className="shrink-0 text-xs text-zinc-400">{formatBytes(file.size)}</span>
          </div>
        ) : (
          <FileDrop
            onFiles={(files) => setFile(files[0] ?? null)}
            multiple={false}
            title="Drop a PDF here, or tap to browse"
            hint="Password-protected PDFs only · handled in your browser"
          />
        )}

        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Password (if the PDF is protected)
          </span>
          <div className="relative mt-2">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Type the PDF's password…"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 pr-11 text-sm text-zinc-800 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </label>

        {error && <ErrorBanner message={error} />}

        <ActionButton
          className="mt-5"
          onClick={run}
          disabled={!valid}
          busy={working}
          busyLabel="Unlocking…"
        >
          <LockOpen className="h-4 w-4" aria-hidden="true" />
          Unlock PDF
        </ActionButton>
      </div>
    </div>
  );
}