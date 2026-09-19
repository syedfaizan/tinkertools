"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { History } from "lucide-react";
import {
  getRecentSlugsServerSnapshot,
  getRecentSlugsSnapshot,
  subscribeRecent,
} from "@/lib/storage";
import { getToolBySlug, TOOL_ROUTE } from "@/tools/registry";

/**
 * "Recently used" strip for the homepage, backed by localStorage only.
 * Reads via useSyncExternalStore — no effect-based mount pattern, SSR-safe
 * (renders nothing until hydration), and updates on same-tab writes.
 */
export function RecentlyUsed() {
  const slugs = useSyncExternalStore(
    subscribeRecent,
    getRecentSlugsSnapshot,
    getRecentSlugsServerSnapshot
  );

  const tools = slugs
    .map((slug) => getToolBySlug(slug))
    .filter((tool) => tool !== undefined);

  if (tools.length === 0) return null;

  return (
    <section aria-label="Recently used tools" className="mt-10">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        <History className="h-4 w-4" aria-hidden="true" />
        Recently used
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.slug}
              href={TOOL_ROUTE(tool.slug)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-indigo-500/50 dark:hover:text-indigo-400"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {tool.title}
            </Link>
          );
        })}
      </div>
    </section>
  );
}