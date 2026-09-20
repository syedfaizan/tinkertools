import type { ToolMeta } from "@/tools/registry";
import dynamic from "next/dynamic";
import { Scissors } from "lucide-react";

export const SplitPdf = dynamic(() =>
  import("./index").then((mod) => mod.SplitPdf)
);

export const splitPdfMeta: ToolMeta = {
  slug: "split-pdf",
  title: "Split PDF",
  description:
    "Split a PDF into separate files by page ranges or every single page — quickly and in your browser. Your documents never leave your device.",
  category: "pdf",
  keywords: [
    "split pdf",
    "separate pdf pages",
    "extract pages from pdf",
    "pdf splitter",
  ],
  icon: Scissors,
  component: SplitPdf,
};