import type { ToolMeta } from "@/tools/registry";
import dynamic from "next/dynamic";
import { ArrowLeftRight } from "lucide-react";

export const PdfConverter = dynamic(() =>
  import("./index").then((mod) => mod.PdfConverter)
);

export const pdfConverterMeta: ToolMeta = {
  slug: "pdf-converter",
  title: "PDF Converter",
  description:
    "Turn any PDF into a plain-text or HTML file — fast, free and entirely in your browser. None of your documents ever leave your device.",
  category: "Convert",
  keywords: [
    "pdf to text",
    "pdf to html",
    "convert pdf online",
    "pdf text extractor",
  ],
  icon: ArrowLeftRight,
  component: PdfConverter,
};