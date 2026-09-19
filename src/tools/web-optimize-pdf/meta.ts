import type { ToolMeta } from "@/tools/registry";
import dynamic from "next/dynamic";
import { Zap } from "lucide-react";

export const WebOptimizePdf = dynamic(() =>
  import("./index").then((mod) => mod.WebOptimizePdf)
);

export const webOptimizePdfMeta: ToolMeta = {
  slug: "web-optimize-pdf",
  title: "Optimize PDF for Web",
  description:
    "Clean up metadata and compact the file structure of a PDF so it loads faster in browsers — done locally, with no uploads.",
  category: "PDF",
  keywords: [
    "optimize pdf for web",
    "optimize pdf",
    "clean pdf metadata",
    "smaller pdf online",
  ],
  icon: Zap,
  component: WebOptimizePdf,
};