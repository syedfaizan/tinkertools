import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";

import { CATEGORIES } from "@/tools/categories";

import { wordCounterMeta } from "@/tools/word-counter/meta";
import { pdfMergeMeta } from "@/tools/pdf-merge/meta";

import { splitPdfMeta } from "@/tools/split-pdf/meta";
import { compressPdfMeta } from "@/tools/compress-pdf/meta";
import { editPdfMeta } from "@/tools/edit-pdf/meta";
import { signPdfMeta } from "@/tools/sign-pdf/meta";
import { pdfConverterMeta } from "@/tools/pdf-converter/meta";
import { imagesToPdfMeta } from "@/tools/images-to-pdf/meta";
import { pdfToImagesMeta } from "@/tools/pdf-to-images/meta";
import { extractPdfImagesMeta } from "@/tools/extract-pdf-images/meta";
import { protectPdfMeta } from "@/tools/protect-pdf/meta";
import { unlockPdfMeta } from "@/tools/unlock-pdf/meta";
import { rotatePdfPagesMeta } from "@/tools/rotate-pdf-pages/meta";
import { removePdfPagesMeta } from "@/tools/remove-pdf-pages/meta";
import { extractPdfPagesMeta } from "@/tools/extract-pdf-pages/meta";
import { rearrangePdfPagesMeta } from "@/tools/rearrange-pdf-pages/meta";
import { webpageToPdfMeta } from "@/tools/webpage-to-pdf/meta";
import { pdfOcrMeta } from "@/tools/pdf-ocr/meta";
import { addWatermarkMeta } from "@/tools/add-watermark/meta";
import { addPageNumbersMeta } from "@/tools/add-page-numbers/meta";
import { pdfOverlayMeta } from "@/tools/pdf-overlay/meta";
import { comparePdfsMeta } from "@/tools/compare-pdfs/meta";
import { webOptimizePdfMeta } from "@/tools/web-optimize-pdf/meta";
import { redactPdfMeta } from "@/tools/redact-pdf/meta";
import { createPdfMeta } from "@/tools/create-pdf/meta";

/**
 * Central tool registry.
 *
 * Adding a new tool is: 1) create `src/tools/<slug>/` with a `meta.ts` and an
 * `index.tsx`, 2) add its meta import + entry to the `TOOLS` array below.
 * Routing, SEO pages, the homepage grid, related-tools and the command palette
 * all derive from this array — no manual wiring elsewhere.
 */
export interface ToolMeta {
  /** URL slug, e.g. "pdf-merge" → /tools/pdf-merge */
  slug: string;
  /** Display + SEO title. */
  title: string;
  /** Short description used on cards, SEO meta, and the tool page header. */
  description: string;
  /** Category grouping, e.g. "PDF", "Text". */
  category: string;
  /** Extra SEO keywords. */
  keywords: string[];
  /** Icon shown on cards / in the palette. */
  icon: LucideIcon;
  /** The tool's UI component (client component or next/dynamic wrapper). */
  component: ComponentType;
}

export const TOOLS: ToolMeta[] = [
  wordCounterMeta,
  pdfMergeMeta,
  splitPdfMeta,
  compressPdfMeta,
  editPdfMeta,
  signPdfMeta,
  pdfConverterMeta,
  imagesToPdfMeta,
  pdfToImagesMeta,
  extractPdfImagesMeta,
  webpageToPdfMeta,
  pdfOcrMeta,
  protectPdfMeta,
  unlockPdfMeta,
  redactPdfMeta,
  rotatePdfPagesMeta,
  removePdfPagesMeta,
  extractPdfPagesMeta,
  rearrangePdfPagesMeta,
  addWatermarkMeta,
  addPageNumbersMeta,
  pdfOverlayMeta,
  comparePdfsMeta,
  webOptimizePdfMeta,
  createPdfMeta,
];

export function getToolBySlug(slug: string): ToolMeta | undefined {
  return TOOLS.find((tool) => tool.slug === slug);
}

export function getToolsByCategory(category: string): ToolMeta[] {
  return TOOLS.filter((tool) => tool.category === category);
}

/** Category ids that currently have tools, in canonical display order. */
export function getCategories(): string[] {
  return CATEGORIES.map((category) => category.id).filter((id) =>
    TOOLS.some((tool) => tool.category === id)
  );
}

/** 2–3 tools to surface next to a given tool (same category first). */
export function getRelatedTools(current: ToolMeta, limit = 3): ToolMeta[] {
  const sameCategory = TOOLS.filter(
    (tool) => tool.slug !== current.slug && tool.category === current.category
  );
  const others = TOOLS.filter(
    (tool) => tool.slug !== current.slug && tool.category !== current.category
  );
  return [...sameCategory, ...others].slice(0, limit);
}

export const TOOL_ROUTE = (slug: string) => `/tools/${slug}`;