import type { ToolMeta } from "@/tools/registry";
import { Type } from "lucide-react";
import { WordCounter } from "./index";

export const wordCounterMeta: ToolMeta = {
  slug: "word-counter",
  title: "Word Counter",
  description:
    "Count words, characters, sentences and paragraphs and estimate reading time — live, in your browser, with zero uploads.",
  category: "text",
  keywords: [
    "word counter",
    "character count",
    "count words online",
    "sentence counter",
    "reading time calculator",
  ],
  icon: Type,
  component: WordCounter,
};