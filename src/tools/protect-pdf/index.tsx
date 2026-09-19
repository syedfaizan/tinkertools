"use client";

import { useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { encryptPDF } from "@pdfsmaller/pdf-encrypt";
import {
  ActionButton,
  ErrorBanner,
  FileDrop,
  ResultPanel,
  type DownloadTarget,
} from "@/tools/pdf/ui";
import { baseName, isPdf, openPdfFromFile, pdfBlob } from "@/tools/pdf/lib";
import { formatBytes } from "@/lib/utils";

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl border border-zinc-200 px-4 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-indigo-600"
      />
    </label>
  );
}

export function ProtectPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [allowPrint, setAllowPrint] = useState(true);
  const [allowCopy, setAllowCopy] = useState(true);
  const [allowEdit, setAllowEdit] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<DownloadTarget[] | null>(null);

  const valid = file !== null && isPdf(file) && password.length > 0;

  const run = async () => {
    if (!file || password.length === 0) return;
    setError(null);
    setWorking(true);
    try {
      // Validate it's a readable, unencrypted PDF before locking it.
      const { bytes } = await openPdfFromFile(file);
      const protectedBytes = await encryptPDF(new Uint8Array(bytes), password, {
        ownerPassword: password,
        allowPrinting: allowPrint,
        allowCopying: allowCopy,
        allowModifying: allowEdit,
        allowAnnotating: allowEdit,
        allowFillingForms: allowEdit,
      });
      setDownloads([
        {
          name: `${baseName(file.name)}-protected.pdf`,
          blob: pdfBlob(protectedBytes),
          primary: true,
        },
      ]);
    } catch (e) {
      console.error("Protect failed", e);
      setError(
        "Couldn't protect this PDF. Make sure it's a valid, unencrypted PDF."
      );
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
        heading="PDF protected!"
        detail={`Locked with your password · ${formatBytes(downloads[0].blob.size)}`}
        downloads={downloads}
        onReset={reset}
        resetLabel="Protect another PDF"
        related="protect-pdf"
        autoDownload
      />
    );
  }

  return (
    <div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {file ? (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 dark:border-zinc-700">
            <LockKeyhole className="h-5 w-5 shrink-0 text-indigo-500" aria-hidden="true" />
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {file.name}
            </p>
            <span className="shrink-0 text-xs text-zinc-400">
              {formatBytes(file.size)}
            </span>
          </div>
        ) : (
          <FileDrop
            onFiles={(files) => setFile(files[0] ?? null)}
            multiple={false}
            title="Drop a PDF here, or tap to browse"
            hint="One PDF · encryption happens in your browser"
          />
        )}

        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Password
          </span>
          <div className="relative mt-2">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Choose a password to open this PDF"
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

        <div className="mt-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Allowed after unlock
          </span>
          <div className="mt-2 grid gap-2">
            <Toggle label="Printing" checked={allowPrint} onChange={setAllowPrint} />
            <Toggle label="Copying content" checked={allowCopy} onChange={setAllowCopy} />
            <Toggle label="Editing (modify, annotate, fill forms)" checked={allowEdit} onChange={setAllowEdit} />
          </div>
        </div>

        {error && <ErrorBanner message={error} />}

        <ActionButton
          className="mt-5"
          onClick={run}
          disabled={!valid}
          busy={working}
          busyLabel="Protecting…"
        >
          <LockKeyhole className="h-4 w-4" aria-hidden="true" />
          {password.length === 0 ? "Enter a password first" : "Protect PDF"}
        </ActionButton>
      </div>
    </div>
  );
}