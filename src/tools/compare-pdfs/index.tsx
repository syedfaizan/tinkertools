"use client";

import { useEffect, useState } from "react";
import { FileDown, GitCompareArrows, X } from "lucide-react";
import { ErrorBanner, FileDrop } from "@/tools/pdf/ui";
import { useThumbs } from "@/tools/pdf/useThumbs";
import { isPdf } from "@/tools/pdf/lib";
import { extractPageTexts, similarity } from "@/tools/pdf/text";
import { formatBytes } from "@/lib/utils";

interface CompareResult {
  overall: number;
  perPage: number[];
  wordsA: number[];
  wordsB: number[];
}

export function ComparePdfs() {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [bytesA, setBytesA] = useState<ArrayBuffer | null>(null);
  const [bytesB, setBytesB] = useState<ArrayBuffer | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [compare, setCompare] = useState<CompareResult | null>(null);
  const [failed, setFailed] = useState(false);

  const thumbsA = useThumbs(bytesA, 400);
  const thumbsB = useThumbs(bytesB, 400);

  const busy =
    fileA !== null && fileB !== null && compare === null && !failed;

  const addA = async (files: File[]) => {
    const chosen = files.find(isPdf);
    if (!chosen) {
      setError("That file isn't a PDF.");
      return;
    }
    setFileA(chosen);
    setBytesA(await chosen.arrayBuffer());
    setCompare(null);
    setFailed(false);
    setError(null);
  };

  const addB = async (files: File[]) => {
    const chosen = files.find(isPdf);
    if (!chosen) {
      setError("That file isn't a PDF.");
      return;
    }
    setFileB(chosen);
    setBytesB(await chosen.arrayBuffer());
    setCompare(null);
    setFailed(false);
    setError(null);
  };

  // Compute text similarity once both documents are loaded.
  useEffect(() => {
    if (!fileA || !fileB) return;
    let cancelled = false;
    (async () => {
      try {
        const [textsA, textsB] = await Promise.all([
          extractPageTexts(fileA),
          extractPageTexts(fileB),
        ]);
        if (cancelled) return;
        const length = Math.min(textsA.length, textsB.length);
        const perPage: number[] = [];
        let total = 0;
        for (let index = 0; index < length; index += 1) {
          const sim = similarity(textsA[index], textsB[index]);
          perPage.push(sim);
          total += sim;
        }
        setCompare({
          overall: length > 0 ? total / length : 1,
          perPage,
          wordsA: textsA.map((text) => text.split(/\s+/).filter(Boolean).length),
          wordsB: textsB.map((text) => text.split(/\s+/).filter(Boolean).length),
        });
        setPageNumber(1);
        setFailed(false);
      } catch (e) {
        console.error("Compare failed", e);
        if (!cancelled) {
          setError("Couldn't read the text from one of the PDFs.");
          setFailed(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fileA, fileB]);

  const totalPagesA = thumbsA.status === "ready" ? thumbsA.thumbs.length : null;
  const totalPagesB = thumbsB.status === "ready" ? thumbsB.thumbs.length : null;
  const pageA = thumbsA.status === "ready" ? thumbsA.thumbs[pageNumber - 1] ?? null : null;
  const pageB = thumbsB.status === "ready" ? thumbsB.thumbs[pageNumber - 1] ?? null : null;
  const maxPages =
    totalPagesA !== null && totalPagesB !== null ? Math.min(totalPagesA, totalPagesB) : 0;
  const settledPage = pageNumber > maxPages ? maxPages : pageNumber;

  return (
    <div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {error && <ErrorBanner message={error} />}

        <div className="grid gap-3 sm:grid-cols-2">
          {fileA ? (
            <div className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 dark:border-zinc-700">
              <FileDown className="h-5 w-5 shrink-0 text-indigo-500" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {fileA.name}
                </p>
              </div>
              <span className="shrink-0 text-xs text-zinc-400">{formatBytes(fileA.size)}</span>
              <button
                type="button"
                onClick={() => {
                  setFileA(null);
                  setBytesA(null);
                  setCompare(null);
                }}
                aria-label="Remove file A"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <FileDrop
              onFiles={(incoming) => void addA(incoming)}
              multiple={false}
              title="Original PDF"
              hint="The first version of your document"
            />
          )}
          {fileB ? (
            <div className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 dark:border-zinc-700">
              <FileDown className="h-5 w-5 shrink-0 text-indigo-500" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {fileB.name}
                </p>
              </div>
              <span className="shrink-0 text-xs text-zinc-400">{formatBytes(fileB.size)}</span>
              <button
                type="button"
                onClick={() => {
                  setFileB(null);
                  setBytesB(null);
                  setCompare(null);
                }}
                aria-label="Remove file B"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <FileDrop
              onFiles={(incoming) => void addB(incoming)}
              multiple={false}
              title="Changed PDF"
              hint="The second version you want to compare"
            />
          )}
        </div>

        {busy && (
          <p className="mt-4 animate-pulse text-sm text-zinc-400">
            Reading both documents and comparing text…
          </p>
        )}

        {compare && thumbsA.status === "ready" && thumbsB.status === "ready" && (
          <>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-zinc-200 p-3 text-center dark:border-zinc-700">
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  {Math.round(compare.overall * 100)}%
                </p>
                <p className="text-xs text-zinc-400">Overall similarity</p>
              </div>
              <div className="rounded-xl border border-zinc-200 p-3 text-center dark:border-zinc-700">
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  {compare.perPage.reduce((sum, sim) => sum + (sim < 0.98 ? 1 : 0), 0)}
                </p>
                <p className="text-xs text-zinc-400">Pages with changes</p>
              </div>
              <div className="rounded-xl border border-zinc-200 p-3 text-center dark:border-zinc-700">
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  {compare.perPage.length}
                </p>
                <p className="text-xs text-zinc-400">Pages compared</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                Page{" "}
                <select
                  value={Math.min(pageNumber, maxPages)}
                  onChange={(event) => setPageNumber(Number(event.target.value))}
                  className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                >
                  {Array.from({ length: maxPages }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>{" "}
                of {maxPages}
              </span>
              <div className="flex w-64 items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className={
                      compare.perPage[settledPage - 1] >= 0.98
                        ? "h-full rounded-full bg-emerald-500"
                        : compare.perPage[settledPage - 1] >= 0.8
                          ? "h-full rounded-full bg-amber-500"
                          : "h-full rounded-full bg-red-500"
                    }
                    style={{ width: `${Math.round(compare.perPage[settledPage - 1] * 100)}%` }}
                  />
                </div>
                <span className="shrink-0 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  {Math.round(compare.perPage[settledPage - 1] * 100)}% match
                </span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1 truncate text-xs font-medium text-zinc-400">
                  {fileA?.name} · {compare.wordsA[settledPage - 1] ?? 0} words
                </p>
                {pageA ? (
                  <img
                    src={pageA.url}
                    alt={`Page ${settledPage} of the original`}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800"
                  />
                ) : (
                  <div className="flex aspect-[3/4] w-full items-center justify-center rounded-xl border border-dashed border-zinc-200 text-xs text-zinc-400 dark:border-zinc-800">
                    Rendering…
                  </div>
                )}
              </div>
              <div>
                <p className="mb-1 truncate text-xs font-medium text-zinc-400">
                  {fileB?.name} · {compare.wordsB[settledPage - 1] ?? 0} words
                </p>
                {pageB ? (
                  <img
                    src={pageB.url}
                    alt={`Page ${settledPage} of the changed PDF`}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800"
                  />
                ) : (
                  <div className="flex aspect-[3/4] w-full items-center justify-center rounded-xl border border-dashed border-zinc-200 text-xs text-zinc-400 dark:border-zinc-800">
                    Rendering…
                  </div>
                )}
              </div>
            </div>

            <p className="mt-3 flex items-start gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
              <GitCompareArrows className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                A page counts as unchanged when word-level similarity is 98%+
                (formatting-only edits still score 100%). Visual differences in
                images and layout aren&apos;t covered by this text comparison.
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}