import type { ToolMeta } from "@/tools/registry";
import dynamic from "next/dynamic";
import { FileType } from "lucide-react";

export const PdfToWord = dynamic(() =>
  import("./index").then((mod) => mod.PdfToWord)
);

export const pdfToWordMeta: ToolMeta = {
  slug: "pdf-to-word",
  title: "PDF to Word",
  description:
    "Convert PDF to an editable Word (.docx) document in your browser. Text, paragraphs and page breaks are carried over — files never leave your device.",
  category: "pdf",
  keywords: [
    "pdf to word",
    "pdf to docx",
    "convert pdf to word document",
    "edit pdf in word",
  ],
  icon: FileType,
  component: PdfToWord,
};