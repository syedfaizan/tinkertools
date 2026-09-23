import type { ToolMeta } from "@/tools/registry";
import dynamic from "next/dynamic";
import { FileText } from "lucide-react";

export const WordToPdf = dynamic(() =>
  import("./index").then((mod) => mod.WordToPdf)
);

export const wordToPdfMeta: ToolMeta = {
  slug: "word-to-pdf",
  title: "Word to PDF",
  description:
    "Convert Word documents (.docx) to PDF in your browser. Headings, tables, images and formatting are preserved — files never leave your device.",
  category: "pdf",
  keywords: [
    "word to pdf",
    "docx to pdf",
    "convert word document to pdf",
    "word to pdf converter",
  ],
  icon: FileText,
  component: WordToPdf,
};