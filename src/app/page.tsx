import { ShieldCheck, Sparkles } from "lucide-react";
import { AdSlot } from "@/components/AdSlot";
import { RecentlyUsed } from "@/components/RecentlyUsed";
import { ToolCard } from "@/components/ToolCard";
import { TOOLS, getCategories } from "@/tools/registry";
import { getCategoryById } from "@/tools/categories";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/config";

export default function HomePage() {
  const categories = getCategories();

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-14">
      <section className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-[2.6rem] sm:leading-[1.15] dark:text-zinc-50">
          Free online tools that run entirely in your browser
        </h1>
        <p className="mt-4 text-base leading-7 text-zinc-500 sm:text-lg dark:text-zinc-400">
          {SITE_TAGLINE}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href="#tools"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
          >
            Browse all tools
          </a>
          <p className="inline-flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
            <ShieldCheck className="h-4 w-4 text-emerald-500" aria-hidden="true" />
            No sign-ups. No uploads. Files never leave your device.
          </p>
        </div>
      </section>

      <RecentlyUsed />

      <AdSlot placement="home-hero" className="mt-10" />

      <section id="tools" className="mt-10 scroll-mt-24">
        {categories.map((categoryId) => {
          const category = getCategoryById(categoryId);
          const CategoryIcon = category?.icon ?? Sparkles;
          return (
            <div key={categoryId} className="mt-10 first:mt-0">
              <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                <CategoryIcon
                  className="h-4 w-4 text-indigo-500"
                  aria-hidden="true"
                />
                {category?.label ?? categoryId} tools
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {TOOLS.filter((tool) => tool.category === categoryId).map(
                  (tool) => (
                    <ToolCard key={tool.slug} slug={tool.slug} />
                  )
                )}
              </div>
            </div>
          );
        })}
      </section>

      <section className="mt-14 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/60">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          What is {SITE_NAME}?
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          {SITE_NAME} is a growing collection of fast, free utilities for
          everyday tasks — from counting words to merging PDFs. Every tool runs
          in your browser using open-source libraries like pdf-lib, so there is
          no server cost, no queue, and no reason to worry about where your
          files go: they never leave your device. More tools are added
          regularly, so check back often.
        </p>
      </section>

      <AdSlot placement="home-bottom" className="mt-10" />
    </div>
  );
}