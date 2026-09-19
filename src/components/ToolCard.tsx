"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { getToolBySlug, TOOL_ROUTE } from "@/tools/registry";
import { cn } from "@/lib/utils";

/**
 * A single tool card. Pass only the `slug` (serializable) — the metadata is
 * looked up from the registry on the client. Hover-lift on desktop, tap-scale
 * on touch; both are disabled automatically for users with reduced motion via
 * the global <MotionConfig reducedMotion="user" />.
 */
export function ToolCard({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const tool = getToolBySlug(slug);
  if (!tool) return null;
  const Icon = tool.icon;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className={cn("h-full", className)}
    >
      <Link
        href={TOOL_ROUTE(tool.slug)}
        className="group flex h-full flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
      >
        <div className="flex items-start justify-between gap-2">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:bg-zinc-800 dark:text-zinc-300 dark:group-hover:bg-indigo-500/10 dark:group-hover:text-indigo-400">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <ChevronRight
            className="h-4 w-4 shrink-0 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-400 dark:text-zinc-600"
            aria-hidden="true"
          />
        </div>
        <div>
          <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">
            {tool.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-zinc-500 dark:text-zinc-400">
            {tool.description}
          </p>
        </div>
        <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
          Open tool
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </Link>
    </motion.div>
  );
}