import type { Metadata } from "next";
import { ChevronDown, ShieldCheck, Sparkles } from "lucide-react";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd } from "@/components/JsonLd";
import { RecentlyUsed } from "@/components/RecentlyUsed";
import { ToolCard } from "@/components/ToolCard";
import { TOOLS, getCategories } from "@/tools/registry";
import { getCategoryById } from "@/tools/categories";
import {
  faqSchema,
  itemListSchema,
  organizationSchema,
  webSiteSchema,
} from "@/lib/seo";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/config";

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
  openGraph: { type: "website", url: SITE_URL, locale: "en_US" },
  twitter: { card: "summary_large_image" },
};

const FAQS: { q: string; a: string }[] = [
  {
    q: "Is TinkerTools free?",
    a: "Yes — every tool is 100% free with no sign-ups, no limits and no queue. The site is supported by unobtrusive ads.",
  },
  {
    q: "Are my files uploaded to a server?",
    a: "No. Every tool runs entirely in your browser, so your files are processed right on your device and are never uploaded, stored or seen by anyone.",
  },
  {
    q: "Which devices does TinkerTools work on?",
    a: "All tools run in any modern browser on desktop, tablet and mobile. There is nothing to install and no app to download.",
  },
  {
    q: "Can I convert Word to PDF and PDF to Word?",
    a: "Yes — see PDF to Word and Word to PDF under the PDF tools. Both run entirely in your browser and keep your files private.",
  },
];

export default function HomePage() {
  const categories = getCategories();

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-14">
      <JsonLd data={webSiteSchema()} />
      <JsonLd data={organizationSchema()} />
      <JsonLd data={itemListSchema()} />
      <JsonLd data={faqSchema(FAQS)} />

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

      <section className="mt-10" aria-labelledby="faq-heading">
        <h2
          id="faq-heading"
          className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          Frequently asked questions
        </h2>
        <div className="mt-4 divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/60">
          {FAQS.map((faq) => (
            <details
              key={faq.q}
              name="faq"
              className="group px-5 py-4"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50 [&::-webkit-details-marker]:hidden">
                {faq.q}
                <ChevronDown
                  className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <AdSlot placement="home-bottom" className="mt-10" />
    </div>
  );
}