/**
 * Builder helpers for schema.org (JSON-LD) structured data. Homepage wiring
 * lives in src/app/page.tsx; per-tool wiring in src/app/tools/[slug]/page.tsx.
 */
import type { ToolMeta } from "@/tools/registry";
import { TOOLS, TOOL_ROUTE } from "@/tools/registry";
import { getCategoryById } from "@/tools/categories";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/config";

export const CONTEXT = "https://schema.org";

export function webSiteSchema() {
  return {
    "@context": CONTEXT,
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: ["TinkerTools.tech", "Tinker Tools", "Free PDF and online tools"],
    url: SITE_URL,
    description: SITE_TAGLINE,
    inLanguage: "en",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon.png`,
    },
  };
}

export function organizationSchema() {
  return {
    "@context": CONTEXT,
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: "TinkerTools.tech",
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    description: SITE_TAGLINE,
  };
}

export function itemListSchema() {
  return {
    "@context": CONTEXT,
    "@type": "ItemList",
    itemListElement: TOOLS.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: tool.title,
      url: `${SITE_URL}${TOOL_ROUTE(tool.slug)}`,
    })),
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": CONTEXT,
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

/** schema.org applicationCategory by tool category. */
export function applicationCategoryFor(category: string): string {
  return ["image", "video", "audio"].includes(category)
    ? "MultimediaApplication"
    : "UtilitiesApplication";
}

export function softwareAppSchema(tool: ToolMeta) {
  return {
    "@context": CONTEXT,
    "@type": "SoftwareApplication",
    name: tool.title,
    description: tool.description,
    url: `${SITE_URL}${TOOL_ROUTE(tool.slug)}`,
    applicationCategory: applicationCategoryFor(tool.category),
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript on a modern browser",
    inLanguage: "en",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };
}

export function breadcrumbSchema(tool: ToolMeta) {
  const category = getCategoryById(tool.category);
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: `${category?.label ?? tool.category} tools`,
        item: `${SITE_URL}/#tools`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tool.title,
        item: `${SITE_URL}${TOOL_ROUTE(tool.slug)}`,
      },
    ],
  };
}