import type { ToolMeta } from "@/tools/registry";
import dynamic from "next/dynamic";
import { FileOutput } from "lucide-react";

export const ExtractPdfPages = dynamic(() =>
  import("./index").then((mod) => mod.ExtractPdfPages)
);

export const extractPdfPagesMeta: ToolMeta = {
  slug: "extract-pdf-pages",
  title: "Extract PDF Pages",
  description:
    "Pull any selection of pages out of a PDF into a brand-new file, or split pages into separate PDFs — done locally, no uploads.",
  category: "pdf",
  keywords: [
    "extract pages from pdf",
    "extract pdf pages",
    "save specific pdf pages",
    "extract page range",
  ],
  icon: FileOutput,
  component: ExtractPdfPages,
};