import type { ToolMeta } from "@/tools/registry";
import dynamic from "next/dynamic";
import { Shuffle } from "lucide-react";

export const RearrangePdfPages = dynamic(() =>
  import("./index").then((mod) => mod.RearrangePdfPages)
);

export const rearrangePdfPagesMeta: ToolMeta = {
  slug: "rearrange-pdf-pages",
  title: "Rearrange PDF Pages",
  description:
    "Reorder the pages of a PDF by dragging thumbnails into a new order, then download the reorganized document — all in your browser.",
  category: "pdf",
  keywords: [
    "rearrange pdf pages",
    "reorder pdf pages",
    "sort pdf pages online",
    "move pdf pages",
  ],
  icon: Shuffle,
  component: RearrangePdfPages,
};