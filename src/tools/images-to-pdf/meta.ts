import type { ToolMeta } from "@/tools/registry";
import dynamic from "next/dynamic";
import { Images } from "lucide-react";

export const ImagesToPdf = dynamic(() =>
  import("./index").then((mod) => mod.ImagesToPdf)
);

export const imagesToPdfMeta: ToolMeta = {
  slug: "images-to-pdf",
  title: "Images to PDF",
  description:
    "Combine JPG, PNG, WebP and other images into a single PDF with adjustable page size and orientation — securely in your browser.",
  category: "Convert",
  keywords: [
    "images to pdf",
    "jpg to pdf",
    "png to pdf",
    "picture to pdf converter",
  ],
  icon: Images,
  component: ImagesToPdf,
};