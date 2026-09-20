import type { ToolMeta } from "@/tools/registry";
import dynamic from "next/dynamic";
import { Diff } from "lucide-react";

export const TextDiff = dynamic(() =>
  import("./index").then((mod) => mod.TextDiff)
);

export const textDiffMeta: ToolMeta = {
  slug: "text-diff",
  title: "Text Diff",
  description:
    "Compare two texts and see exactly what changed — additions, removals and edits highlighted line by line, entirely in your browser.",
  category: "text",
  keywords: [
    "text diff",
    "compare text",
    "diff checker",
    "compare two texts",
    "text comparison",
  ],
  icon: Diff,
  component: TextDiff,
};