"use client";

import { getRelatedTools, getToolBySlug } from "@/tools/registry";
import { ToolCard } from "@/components/ToolCard";
import { cn } from "@/lib/utils";

/**
 * Surfaces 2–3 related tools, preferring the same category. Rendered at the
 * bottom of every tool page and right next to the result of file-based tools.
 */
export function RelatedTools({
  current,
  limit = 3,
  className,
}: {
  current: string;
  limit?: number;
  className?: string;
}) {
  const currentTool = getToolBySlug(current);
  if (!currentTool) return null;

  const tools = getRelatedTools(currentTool, limit);
  if (tools.length === 0) return null;

  return (
    <section
      aria-label="Related tools"
      className={cn("mt-10", className)}
    >
      <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        More free tools
      </h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        More related tools for {currentTool.title.toLowerCase()}.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} slug={tool.slug} />
        ))}
      </div>
    </section>
  );
}