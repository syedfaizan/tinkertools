"use client";

import { useState } from "react";
import { FileDown, Globe } from "lucide-react";
import {
  ActionButton,
  ErrorBanner,
  ResultPanel,
  type DownloadTarget,
} from "@/tools/pdf/ui";
import { formatBytes } from "@/lib/utils";

/**
 * Builds the PDF in a sandboxed iframe using html2pdf.js streamed from a CDN.
 * The page's HTML is fetched server-side (CORS), scripts stripped, then handed
 * to the iframe via srcdoc. The finished PDF comes back over postMessage.
 */

interface PreparedPage {
  body: string;
  styles: string;
}

function prepareHtml(raw: string, baseUrl: string): PreparedPage {
  // 1. Drop scripts and inline event handlers.
  let clean = raw.replace(/<script[\s\S]*?<\/script>/gi, "");
  clean = clean.replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  // 2. Collect the page's own <style> blocks.
  const styles = (raw.match(/<style[\s\S]*?<\/style>/gi) ?? []).join("\n");
  // 3. Keep only the <body> contents.
  const bodyMatch = clean.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch ? bodyMatch[1] : clean;
  // 4. Resolve relative src/href against the page URL so local assets still load.
  try {
    body = body.replace(
      /(src|href)\s*=\s*("|')(?!https?:|\/\/|data:|#|mailto:|tel:)([^"']*)("|')/gi,
      (_match, attr: string, open: string, path: string, close: string) =>
        `${attr}=${open}${new URL(path, baseUrl).href}${close}`
    );
  } catch {
    /* baseUrl is validated up front, so this can't realistically throw */
  }
  return { body, styles };
}

function buildFrameSrc(prepared: PreparedPage, title: string): string {
  const safeTitle = title.replace(/</g, "&lt;").slice(0, 120) || "Webpage";
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${safeTitle}</title>
<style>
  html, body { margin: 0; padding: 0; background: #ffffff; color: #111111; font-family: Georgia, 'Times New Roman', serif; }
  body { padding: 24px; }
  img { max-width: 100%; }
  a { color: #1d4ed8; }
</style>
${prepared.styles}
</head>
<body>
${prepared.body}
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.2/html2pdf.bundle.min.js"><\/script>
<script>
(function () {
  var done = false;
  function convert() {
    if (done) return;
    if (!window.html2pdf || !window.html2canvas) { setTimeout(convert, 120); return; }
    done = true;
    var opts = {
      margin: [12, 12, 12, 12],
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true, logging: false, windowWidth: 1120 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    try {
      html2pdf().set(opts).from(document.body).outputPdf('datauristring')
        .then(function (data) {
          window.parent.postMessage({ __tinkertools: true, ok: true, data: data }, '*');
        })
        .catch(function (err) {
          window.parent.postMessage({ __tinkertools: true, ok: false, error: String(err && err.message ? err.message : err) }, '*');
        });
    } catch (e) {
      window.parent.postMessage({ __tinkertools: true, ok: false, error: String(e) }, '*');
    }
  }
  setTimeout(convert, 250);
})();
<\/script>
</body>
</html>`;
}

function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || "webpage";
}

function convertInFrame(
  prepared: PreparedPage,
  title: string
): Promise<{ blob: Blob; filename: string }> {
  return new Promise((resolve, reject) => {
    const frame = document.createElement("iframe");
    frame.title = "Webpage to PDF converter";
    frame.style.cssText =
      "position:fixed;left:-10000px;top:0;width:1120px;height:840px;border:0;visibility:hidden;";
    frame.sandbox = "allow-scripts";
    const timeoutId = window.setTimeout(() => {
      frame.remove();
      reject(new Error("The conversion timed out — the page may be too complex."));
    }, 90_000);

    const onMessage = (event: MessageEvent) => {
      const data = event.data as
        | { __tinkertools?: boolean; ok?: boolean; data?: string; error?: string }
        | undefined;
      if (!data || data.__tinkertools !== true) return;
      window.clearTimeout(timeoutId);
      window.removeEventListener("message", onMessage);
      frame.remove();
      if (!data.ok || !data.data) {
        reject(new Error(data.error || "Couldn't convert the page."));
        return;
      }
      const marker = "base64,";
      const index = data.data.indexOf(marker);
      if (index === -1) {
        reject(new Error("Unexpected output from the converter."));
        return;
      }
      try {
        const binary = atob(data.data.slice(index + marker.length));
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
        resolve({
          blob: new Blob([bytes], { type: "application/pdf" }),
          filename: `${slugify(title)}.pdf`,
        });
      } catch {
        reject(new Error("Couldn't decode the generated PDF."));
      }
    };

    window.addEventListener("message", onMessage);
    frame.srcdoc = buildFrameSrc(prepared, title);
    document.body.appendChild(frame);
  });
}

export function WebpageToPdf() {
  const [url, setUrl] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<DownloadTarget[] | null>(null);
  const [pageTitle, setPageTitle] = useState("");

  const run = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Enter a web address first.");
      return;
    }
    let parsed: URL;
    try {
      parsed = new URL(trimmed);
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
    } catch {
      setError(
        "That doesn't look like a valid web address (needs http:// or https://)."
      );
      return;
    }
    setError(null);
    setWorking(true);
    try {
      const response = await fetch(
        `/api/fetch-page?url=${encodeURIComponent(parsed.toString())}`
      );
      const payload = (await response.json()) as
        | { html?: string; title?: string }
        | { error: string };
      if (!response.ok || !("html" in payload) || !payload.html) {
        throw new Error("error" in payload ? payload.error : "Couldn't fetch that page.");
      }
      const prepared = prepareHtml(payload.html, parsed.toString());
      const { blob, filename } = await convertInFrame(
        prepared,
        payload.title ?? "webpage"
      );
      setPageTitle(filename);
      setDownloads([{ name: filename, blob, primary: true }]);
    } catch (e) {
      console.error("Webpage to PDF failed", e);
      setError(
        e instanceof Error
          ? e.message
          : "Couldn't convert that page. It may block fetching, or have no HTML."
      );
    } finally {
      setWorking(false);
    }
  };

  const reset = () => {
    setDownloads(null);
    setPageTitle("");
    setError(null);
  };

  if (downloads) {
    return (
      <ResultPanel
        heading="Webpage converted to PDF!"
        detail={`${pageTitle} · ${formatBytes(downloads[0].blob.size)} · assembled entirely in your browser`}
        downloads={downloads}
        onReset={reset}
        resetLabel="Convert another page"
        related="webpage-to-pdf"
        autoDownload
      />
    );
  }

  return (
    <div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Web address
          </span>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void run();
              }}
              placeholder="https://example.com/article"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="w-full flex-1 rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
            />
            <ActionButton
              className="sm:w-auto"
              onClick={run}
              busy={working}
              busyLabel="Fetching & converting…"
            >
              {!working && <Globe className="h-4 w-4" aria-hidden="true" />}
              Convert to PDF
            </ActionButton>
          </div>
        </label>

        {error && <ErrorBanner message={error} />}

        <p className="mt-4 flex items-start gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
          <FileDown className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" aria-hidden="true" />
          <span>
            The page&apos;s HTML is fetched through our server, then the PDF is
            assembled on your device — scripts are stripped for safety. Some
            sites block automated fetching, and external images may not load if
            the host blocks cross-origin sharing.
          </span>
        </p>
      </div>
    </div>
  );
}