import type { ToolMeta } from "@/tools/registry";
import dynamic from "next/dynamic";
import { GitCompareArrows } from "lucide-react";

export const ComparePdfs = dynamic(() =>
  import("./index").then((mod) => mod.ComparePdfs)
);

export const comparePdfsMeta: ToolMeta = {
  slug: "compare-pdfs",
  title: "Compare PDFs",
  description:
    "Side-by-side page comparison plus word-level similarity scoring between two PDF versions — processed privately on your device.",
  category: "pdf",
  keywords: [
    "compare pdfs",
    "pdf difference",
    "compare pdf files online",
    "pdf diff tool",
  ],
  icon: GitCompareArrows,
  component: ComparePdfs,
};