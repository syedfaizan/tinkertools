import type { ToolMeta } from "@/tools/registry";
import dynamic from "next/dynamic";
import { GalleryThumbnails } from "lucide-react";

export const ExtractPdfImages = dynamic(() =>
  import("./index").then((mod) => mod.ExtractPdfImages)
);

export const extractPdfImagesMeta: ToolMeta = {
  slug: "extract-pdf-images",
  title: "Extract Images from PDF",
  description:
    "Pull every embedded photo and graphic out of a PDF as original-quality JPG or PNG files — instantly, in your browser.",
  category: "image",
  keywords: [
    "extract images from pdf",
    "pdf images extractor",
    "save images from pdf",
    "get pictures out of pdf",
  ],
  icon: GalleryThumbnails,
  component: ExtractPdfImages,
};