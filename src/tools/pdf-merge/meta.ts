import type { ToolMeta } from "@/tools/registry";
import dynamic from "next/dynamic";
import { Files } from "lucide-react";

/**
 * The merge UI depends on pdf-lib (a few hundred KB), so we code-split it:
 * the loader only ships to browsers that actually visit /tools/pdf-merge.
 */
export const PdfMerge = dynamic(() =>
  import("./index").then((mod) => mod.PdfMerge)
);

export const pdfMergeMeta: ToolMeta = {
  slug: "pdf-merge",
  title: "PDF Merge",
  description:
    "Combine multiple PDF files into a single document, entirely in your browser. Files never leave your device.",
  category: "PDF",
  keywords: ["merge pdf", "combine pdf", "join pdf files", "pdf merger online"],
  icon: Files,
  component: PdfMerge,
};