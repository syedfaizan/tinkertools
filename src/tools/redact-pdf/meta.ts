import type { ToolMeta } from "@/tools/registry";
import dynamic from "next/dynamic";
import { Eraser } from "lucide-react";

export const RedactPdf = dynamic(() =>
  import("./index").then((mod) => mod.RedactPdf)
);

export const redactPdfMeta: ToolMeta = {
  slug: "redact-pdf",
  title: "Redact PDF",
  description:
    "Permanently black out names, numbers and any sensitive text before sharing a document — redaction happens locally in your browser.",
  category: "pdf",
  keywords: [
    "redact pdf",
    "black out pdf text",
    "redact document",
    "hide information in pdf",
  ],
  icon: Eraser,
  component: RedactPdf,
};