import type { ToolMeta } from "@/tools/registry";
import dynamic from "next/dynamic";
import { FileImage } from "lucide-react";

export const PdfToImages = dynamic(() =>
  import("./index").then((mod) => mod.PdfToImages)
);

export const pdfToImagesMeta: ToolMeta = {
  slug: "pdf-to-images",
  title: "PDF to Images",
  description:
    "Export every page of a PDF as high-quality JPG or PNG images — as separate files or one zip. All rendered locally on your device.",
  category: "image",
  keywords: [
    "pdf to images",
    "pdf to jpg",
    "pdf to png",
    "convert pdf pages to pictures",
  ],
  icon: FileImage,
  component: PdfToImages,
};