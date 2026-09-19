import type { ToolMeta } from "@/tools/registry";
import dynamic from "next/dynamic";
import { FileX } from "lucide-react";

export const RemovePdfPages = dynamic(() =>
  import("./index").then((mod) => mod.RemovePdfPages)
);

export const removePdfPagesMeta: ToolMeta = {
  slug: "remove-pdf-pages",
  title: "Remove PDF Pages",
  description:
    "Delete unwanted pages from a PDF with visual page thumbnails — pick the pages and download the cleaned file, privately in your browser.",
  category: "Organize",
  keywords: [
    "remove pdf pages",
    "delete pages from pdf",
    "delete pdf pages online",
    "remove page from document",
  ],
  icon: FileX,
  component: RemovePdfPages,
};