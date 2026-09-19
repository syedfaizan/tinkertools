"use client";

/**
 * Small presentational card for a rendered page thumbnail. Bordered, with an
 * optional page-number badge, optional selection behaviour, and an optional
 * action strip below the image.
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { PdfThumb } from "./useThumbs";

export function PageCard({
  thumb,
  selected = false,
  onSelect,
  badge,
  actions,
  className,
}: {
  thumb: PdfThumb;
  selected?: boolean;
  onSelect?: () => void;
  badge?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-zinc-100 dark:bg-zinc-950",
        selected
          ? "border-indigo-500 ring-2 ring-indigo-500/40"
          : "border-zinc-200 dark:border-zinc-800",
        className
      )}
    >
      {onSelect ? (
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          aria-label={`Toggle page ${thumb.page}`}
          className="relative block w-full"
        >
          <img src={thumb.url} alt={`Page ${thumb.page}`} className="w-full" />
          {badge && (
            <span className="absolute left-1.5 top-1.5 rounded-md bg-zinc-900/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {badge}
            </span>
          )}
        </button>
      ) : (
        <div className="relative">
          <img src={thumb.url} alt={`Page ${thumb.page}`} className="w-full" />
          {badge && (
            <span className="absolute left-1.5 top-1.5 rounded-md bg-zinc-900/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {badge}
            </span>
          )}
        </div>
      )}
      {actions && (
        <div className="flex flex-wrap items-center justify-center gap-1 border-t border-zinc-200 bg-white p-1.5 dark:border-zinc-800 dark:bg-zinc-900">
          {actions}
        </div>
      )}
    </div>
  );
}