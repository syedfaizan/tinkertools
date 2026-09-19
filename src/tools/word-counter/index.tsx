"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";
import { Eraser, Wand2 } from "lucide-react";

/** Counts up to `value` whenever it changes (respects reduced motion). */
function CountUp({ value }: { value: number }) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const previous = useRef(value);

  useEffect(() => {
    const from = previous.current;
    const to = value;
    previous.current = value;
    if (reduced || from === to) {
      setDisplay(to);
      return;
    }
    const controls = animate(from, to, {
      duration: 0.6,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, reduced]);

  return <>{display.toLocaleString()}</>;
}

interface Stat {
  label: string;
  value: number;
  suffix?: string;
}

export function WordCounter() {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const stats = useMemo<Stat[]>(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const sentenceMatches = text.match(/[^.!?]+[.!?]+(\s+|$)/g) ?? [];
    const sentences = trimmed ? Math.max(sentenceMatches.length, 1) : 0;
    const paragraphs = trimmed
      ? (text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length || 1)
      : 0;
    return [
      { label: "Words", value: words },
      { label: "Characters", value: characters },
      { label: "Characters (no spaces)", value: charactersNoSpaces },
      { label: "Sentences", value: sentences },
      { label: "Paragraphs", value: paragraphs },
      { label: "Reading time", value: Math.max(1, Math.ceil(words / 200)), suffix: " min" },
    ];
  }, [text]);

  const clear = () => {
    setText("");
    textareaRef.current?.focus();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <label htmlFor="wc-text" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Your text
        </label>
        <textarea
          id="wc-text"
          ref={textareaRef}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type or paste your text here to count words, characters and sentences…"
          className="min-h-[220px] w-full resize-y rounded-xl border border-zinc-300 bg-white p-4 text-[15px] leading-6 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-zinc-400 dark:text-zinc-500" aria-live="polite">
            {text.length > 0
              ? `Updated live · ${text.length.toLocaleString()} characters`
              : "Nothing to count yet"}
          </p>
          <button
            type="button"
            onClick={clear}
            disabled={text.length === 0}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Eraser className="h-4 w-4" aria-hidden="true" />
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-sm sm:p-5 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-2xl font-bold tabular-nums tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
              <CountUp value={stat.value} />
              {stat.suffix ?? ""}
            </p>
            <p className="mt-1 text-xs font-medium text-zinc-400 dark:text-zinc-500">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
        <p className="flex items-start gap-2">
          <Wand2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" aria-hidden="true" />
          <span>
            <strong className="font-semibold text-zinc-700 dark:text-zinc-300">How it works:</strong>{" "}
            your text is analyzed entirely in your browser — nothing is sent to any server.
            Counts update as you type.
          </span>
        </p>
      </div>
    </div>
  );
}