import type { ToolMeta } from "@/tools/registry";
import dynamic from "next/dynamic";
import { FilePenLine } from "lucide-react";

export const CreatePdf = dynamic(() =>
  import("./index").then((mod) => mod.CreatePdf)
);

export const createPdfMeta: ToolMeta = {
  slug: "create-pdf",
  title: "Create PDF from Text",
  description:
    "Write or paste text and instantly download it as a clean, print-ready PDF — composed entirely in your browser, with nothing uploaded.",
  category: "Text",
  keywords: [
    "create pdf from text",
    "text to pdf",
    "make a pdf online",
    "write pdf online",
  ],
  icon: FilePenLine,
  component: CreatePdf,
};