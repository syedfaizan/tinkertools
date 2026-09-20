import type { ToolMeta } from "@/tools/registry";
import dynamic from "next/dynamic";
import { FileArchive } from "lucide-react";

export const CompressPdf = dynamic(() =>
  import("./index").then((mod) => mod.CompressPdf)
);

export const compressPdfMeta: ToolMeta = {
  slug: "compress-pdf",
  title: "Compress PDF",
  description:
    "Shrink PDF file size by re-encoding pages as quality-controlled images — right in your browser, so none of your files leave your device.",
  category: "pdf",
  keywords: [
    "compress pdf",
    "reduce pdf size",
    "shrink pdf file",
    "pdf compression online",
  ],
  icon: FileArchive,
  component: CompressPdf,
};