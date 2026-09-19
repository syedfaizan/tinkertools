import type { ToolMeta } from "@/tools/registry";
import dynamic from "next/dynamic";
import { Layers } from "lucide-react";

export const PdfOverlay = dynamic(() =>
  import("./index").then((mod) => mod.PdfOverlay)
);

export const pdfOverlayMeta: ToolMeta = {
  slug: "pdf-overlay",
  title: "Overlay PDF",
  description:
    "Layer a second PDF on top of another — perfect for annotating templates, drafts and comparisons, entirely in your browser.",
  category: "PDF",
  keywords: ["overlay pdf", "pdf overlay", "stack pdfs", "combine pdf layers"],
  icon: Layers,
  component: PdfOverlay,
};