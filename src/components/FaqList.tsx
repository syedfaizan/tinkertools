import type { FaqItem } from "@/tools/content";
import { ChevronDown } from "lucide-react";

/**
 * Accessible accordion list of Q&As, styled to match the site's card look.
 * Used by the homepage and every tool page — the same markup backs the
 * FAQPage JSON-LD those pages emit, so visible content and schema stay in sync.
 */
export function FaqList({ faqs }: { faqs: FaqItem[] }) {
  return (
    <div className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/60">
      {faqs.map((faq) => (
        <details key={faq.q} name="faq" className="group px-5 py-4">
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
  );
}
