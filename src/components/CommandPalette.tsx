"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Search } from "lucide-react";
import { TOOLS, TOOL_ROUTE } from "@/tools/registry";
import { cn } from "@/lib/utils";

/**
 * Cmd+K / Ctrl+K command palette. Renders its own trigger button plus the
 * modal, so open/close state stays colocated with the header.
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TOOLS;
    return TOOLS.filter(
      (tool) =>
        tool.title.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q) ||
        tool.keywords.some((keyword) => keyword.toLowerCase().includes(q))
    );
  }, [query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) {
          setOpen(false);
        } else {
          setQuery("");
          setActive(0);
          setOpen(true);
        }
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
      return () => window.clearTimeout(timer);
    }
  }, [open]);

  const openPalette = () => {
    setQuery("");
    setActive(0);
    setOpen(true);
  };

  const go = (slug: string) => {
    setOpen(false);
    router.push(TOOL_ROUTE(slug));
  };

  return (
    <>
      <button
        type="button"
        onClick={openPalette}
        aria-label="Search tools (Cmd+K)"
        className="hidden h-11 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-400 transition-colors hover:border-zinc-300 hover:text-zinc-600 sm:flex dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:text-zinc-300"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        <span>Search tools</span>
        <kbd className="ml-2 rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-sans text-[10px] font-medium text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800">
          ⌘K
        </kbd>
      </button>
      <button
        type="button"
        onClick={openPalette}
        aria-label="Search tools (Cmd+K)"
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 transition-colors hover:bg-zinc-50 sm:hidden dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        <Search className="h-5 w-5" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Find a tool"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={(event) => {
              if (event.target === event.currentTarget) setOpen(false);
            }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-[12vh] backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center gap-2 border-b border-zinc-100 px-4 dark:border-zinc-800">
                <Search className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden="true" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActive(0);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && results[active]) {
                      go(results[active].slug);
                    }
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      setActive((current) =>
                        Math.min(current + 1, results.length - 1)
                      );
                    }
                    if (event.key === "ArrowUp") {
                      event.preventDefault();
                      setActive((current) => Math.max(current - 1, 0));
                    }
                  }}
                  placeholder="Search tools… e.g. pdf, words"
                  className="h-12 flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                />
                <kbd className="rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-sans text-[10px] font-medium text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800">
                  ESC
                </kbd>
              </div>
              <ul className="max-h-[50vh] overflow-y-auto p-2">
                {results.length === 0 && (
                  <li className="px-3 py-8 text-center text-sm text-zinc-400">
                    No tools match your search.
                  </li>
                )}
                {results.map((tool, index) => {
                  const Icon = tool.icon;
                  const isActive = index === active;
                  return (
                    <li key={tool.slug}>
                      <button
                        type="button"
                        onMouseEnter={() => setActive(index)}
                        onClick={() => go(tool.slug)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm",
                          isActive
                            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                            : "text-zinc-600 dark:text-zinc-300"
                        )}
                      >
                        <Icon
                          className="h-4 w-4 shrink-0 text-zinc-400"
                          aria-hidden="true"
                        />
                        <span className="flex-1 truncate">{tool.title}</span>
                        <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                          {tool.category}
                        </span>
                        {isActive && (
                          <CornerDownLeft
                            className="h-3.5 w-3.5 shrink-0 text-zinc-400"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}