"use client";

import { useMemo, useState } from "react";
import { diffLines, type Change } from "diff";
import {
  ArrowLeftRight,
  Eraser,
  FlaskConical,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SAMPLE_ORIGINAL = `TinkerTools ships dozens of free tools.
Every one of them runs entirely in your browser.
No uploads, no sign-ups, no queues.
Your files never leave your device.`;

const SAMPLE_MODIFIED = `TinkerTools ships dozens of free tools.
Every one of them runs entirely in your browser — no server costs at all.
No uploads, no sign-ups, no queues.
Your files and your text never leave your device.`;

type DiffRow = { kind: "add" | "remove" | "context"; text: string };

/** Turns a jsdiff result into individual, display-ready lines. */
function rowsFromDiff(a: string, b: string): DiffRow[] {
  const parts: Change[] = diffLines(a, b);
  const rows: DiffRow[] = [];
  for (const part of parts) {
    const kind = part.added ? "add" : part.removed ? "remove" : "context";
    const chunk = part.value.split("\n");
    for (let i = 0; i < chunk.length - 1; i++) {
      rows.push({ kind, text: chunk[i] });
    }
    if (chunk[chunk.length - 1] !== "") {
      rows.push({ kind, text: chunk[chunk.length - 1] });
    }
  }
  return rows;
}

export function TextDiff() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");

  const rows = useMemo(() => rowsFromDiff(left, right), [left, right]);
  const stats = useMemo(
    () => ({
      additions: rows.filter((row) => row.kind === "add").length,
      removals: rows.filter((row) => row.kind === "remove").length,
      unchanged: rows.filter((row) => row.kind === "context").length,
    }),
    [rows]
  );
  const hasText = left.length > 0 || right.length > 0;
  const identical = hasText && left === right;

  const loadSample = () => {
    setLeft(SAMPLE_ORIGINAL);
    setRight(SAMPLE_MODIFIED);
  };
  const clear = () => {
    setLeft("");
    setRight("");
  };
  const swap = () => {
    setLeft(right);
    setRight(left);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="td-original"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Original text
            </label>
            <textarea
              id="td-original"
              value={left}
              onChange={(event) => setLeft(event.target.value)}
              placeholder="Paste the original text here…"
              className="min-h-[220px] w-full resize-y rounded-xl border border-zinc-300 bg-white p-4 text-[15px] leading-6 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600"
            />
          </div>
          <div>
            <label
              htmlFor="td-modified"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Modified text
            </label>
            <textarea
              id="td-modified"
              value={right}
              onChange={(event) => setRight(event.target.value)}
              placeholder="Paste the new version here…"
              className="min-h-[220px] w-full resize-y rounded-xl border border-zinc-300 bg-white p-4 text-[15px] leading-6 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-zinc-400 dark:text-zinc-500" aria-live="polite">
            {hasText
              ? `Live diff · ${stats.additions} added · ${stats.removals} removed · ${stats.unchanged} unchanged`
              : "Add text on both sides to see what changed"}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={swap}
              disabled={!hasText}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
              Swap sides
            </button>
            <button
              type="button"
              onClick={loadSample}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <FlaskConical className="h-4 w-4" aria-hidden="true" />
              Try sample
            </button>
            <button
              type="button"
              onClick={clear}
              disabled={!hasText}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <Eraser className="h-4 w-4" aria-hidden="true" />
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-sm sm:p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-2xl font-bold tabular-nums tracking-tight text-emerald-500 sm:text-3xl">
            {stats.additions}
          </p>
          <p className="mt-1 text-xs font-medium text-zinc-400 dark:text-zinc-500">
            Added
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-sm sm:p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-2xl font-bold tabular-nums tracking-tight text-red-500 sm:text-3xl">
            {stats.removals}
          </p>
          <p className="mt-1 text-xs font-medium text-zinc-400 dark:text-zinc-500">
            Removed
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-sm sm:p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-2xl font-bold tabular-nums tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
            {stats.unchanged}
          </p>
          <p className="mt-1 text-xs font-medium text-zinc-400 dark:text-zinc-500">
            Unchanged
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2.5 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Differences
          </h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {identical
              ? "Both texts match"
              : hasText
                ? `${stats.additions} added · ${stats.removals} removed`
                : "Waiting for input"}
          </p>
        </div>
        <div
          aria-label="Diff result"
          className="max-h-[420px] overflow-auto bg-zinc-50 p-1 font-mono text-xs leading-5 dark:bg-zinc-950"
        >
          {!hasText ? (
            <p className="p-4 text-zinc-400 dark:text-zinc-600">
              Paste two versions of your text above and the differences will
              show up here.
            </p>
          ) : identical ? (
            <p className="flex items-center gap-2 p-4 text-emerald-600 dark:text-emerald-400">
              <Wand2 className="h-4 w-4" aria-hidden="true" />
              No differences — the two texts are identical.
            </p>
          ) : (
            <table className="w-full border-collapse">
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={index}
                    className={cn(
                      row.kind === "add" &&
                        "bg-emerald-50 dark:bg-emerald-950/50",
                      row.kind === "remove" &&
                        "bg-red-50 dark:bg-red-950/50"
                    )}
                  >
                    <td
                      className={cn(
                        "w-6 select-none border-r border-zinc-200 px-1 text-center dark:border-zinc-800",
                        row.kind === "add"
                          ? "text-emerald-500"
                          : row.kind === "remove"
                            ? "text-red-500"
                            : "text-zinc-300 dark:text-zinc-700"
                      )}
                    >
                      {row.kind === "add" ? "+" : row.kind === "remove" ? "−" : " "}
                    </td>
                    <td
                      className={cn(
                        "whitespace-pre-wrap break-words px-2 py-0.5",
                        row.kind === "add"
                          ? "text-emerald-800 dark:text-emerald-300"
                          : row.kind === "remove"
                            ? "text-red-700 dark:text-red-300"
                            : "text-zinc-500 dark:text-zinc-400"
                      )}
                    >
                      {row.text || "\u00A0"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
        <p className="flex items-start gap-2">
          <Wand2
            className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500"
            aria-hidden="true"
          />
          <span>
            <strong className="font-semibold text-zinc-700 dark:text-zinc-300">
              How it works:
            </strong>{" "}
            both texts are compared entirely in your browser (line by line
            using a tried-and-tested diff algorithm) — nothing is sent to any
            server. The diff updates as you type.
          </span>
        </p>
      </div>
    </div>
  );
}