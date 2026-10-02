import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { FaqList } from "@/components/FaqList";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { TrackVisit } from "@/components/TrackVisit";
import { TOOLS, getToolBySlug, TOOL_ROUTE } from "@/tools/registry";
import { getToolContent } from "@/tools/content";
import { getCategoryById } from "@/tools/categories";
import { breadcrumbSchema, faqSchema, softwareAppSchema } from "@/lib/seo";
import { SITE_NAME, SITE_URL } from "@/lib/config";

export const dynamicParams = false;

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/tools/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};

  return {
    title: `${tool.title} — Free Online Tool`,
    description: tool.description,
    keywords: [...tool.keywords, ...tool.description.split(" ").slice(0, 6)],
    alternates: { canonical: `${SITE_URL}${TOOL_ROUTE(tool.slug)}` },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: `${tool.title} — Free Online Tool`,
      description: tool.description,
      url: `${SITE_URL}${TOOL_ROUTE(tool.slug)}`,
      locale: "en_US",
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function ToolPage({
  params,
}: PageProps<"/tools/[slug]">) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const ToolComponent = tool.component;
  const content = getToolContent(tool.slug);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
      <JsonLd data={breadcrumbSchema(tool)} />
      <JsonLd data={softwareAppSchema(tool)} />
      {content && <JsonLd data={faqSchema(content.faqs)} />}

      <TrackVisit slug={tool.slug} />

      <AdSlot placement="above-tool" className="mb-8" />

      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          {getCategoryById(tool.category)?.label ?? tool.category}
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
          {tool.title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-500 sm:text-base dark:text-zinc-400">
          {tool.description}
        </p>
        {content && (
          <p className="mt-4 text-sm leading-6 text-zinc-500 sm:text-base dark:text-zinc-400">
            {content.intro}
          </p>
        )}
      </header>

      <ToolComponent />

      <AdSlot placement="below-tool" className="mt-10" />

      {content && (
        <section className="mt-12" aria-labelledby="howto-heading">
          <h2
            id="howto-heading"
            className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            How to use {tool.title}
          </h2>
          <ol className="mt-4 space-y-3">
            {content.steps.map((step, index) => (
              <li
                key={step}
                className="flex gap-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300"
              >
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {content && (
        <section className="mt-10" aria-labelledby="faq-heading">
          <h2
            id="faq-heading"
            className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            Frequently asked questions
          </h2>
          <div className="mt-4">
            <FaqList faqs={content.faqs} />
          </div>
        </section>
      )}

      <RelatedTools current={tool.slug} limit={3} className="mt-12" />
    </div>
  );
}