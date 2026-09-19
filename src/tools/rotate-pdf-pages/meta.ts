import type { ToolMeta } from "@/tools/registry";
import dynamic from "next/dynamic";
import { RotateCw } from "lucide-react";

export const RotatePdfPages = dynamic(() =>
  import("./index").then((mod) => mod.RotatePdfPages)
);

export const rotatePdfPagesMeta: ToolMeta = {
  slug: "rotate-pdf-pages",
  title: "Rotate PDF Pages",
  description:
    "Permanently rotate one page, several, or every page of a PDF by 90 or 180 degrees — all within your browser.",
  category: "Organize",
  keywords: [
    "rotate pdf pages",
    "rotate pdf",
    "turn pdf pages",
    "landscape to portrait pdf",
  ],
  icon: RotateCw,
  component: RotatePdfPages,
};