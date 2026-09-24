import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { TrackVisit } from "@/components/TrackVisit";
import { TOOLS, getToolBySlug, TOOL_ROUTE } from "@/tools/registry";
import { getCategoryById } from "@/tools/categories";
import { breadcrumbSchema, softwareAppSchema } from "@/lib/seo";
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

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
      <JsonLd data={breadcrumbSchema(tool)} />
      <JsonLd data={softwareAppSchema(tool)} />

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
      </header>

      <ToolComponent />

      <AdSlot placement="below-tool" className="mt-10" />

      <RelatedTools current={tool.slug} limit={3} className="mt-12" />
    </div>
  );
}