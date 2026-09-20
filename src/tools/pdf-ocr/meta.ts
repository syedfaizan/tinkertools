import type { ToolMeta } from "@/tools/registry";
import dynamic from "next/dynamic";
import { ScanText } from "lucide-react";

export const PdfOcr = dynamic(() =>
  import("./index").then((mod) => mod.PdfOcr)
);

export const pdfOcrMeta: ToolMeta = {
  slug: "pdf-ocr",
  title: "PDF OCR",
  description:
    "Turn scanned PDFs into real, selectable text using AI character recognition in your browser — copy, download and search the result.",
  category: "text",
  keywords: [
    "pdf ocr",
    "scanned pdf to text",
    "optical character recognition pdf",
    "ocr pdf online",
  ],
  icon: ScanText,
  component: PdfOcr,
};