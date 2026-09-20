import type { ToolMeta } from "@/tools/registry";
import dynamic from "next/dynamic";
import { Droplets } from "lucide-react";

export const AddWatermark = dynamic(() =>
  import("./index").then((mod) => mod.AddWatermark)
);

export const addWatermarkMeta: ToolMeta = {
  slug: "add-watermark",
  title: "Add Watermark to PDF",
  description:
    "Stamp every page of a PDF with a text or image watermark at any angle and opacity, completely in your browser.",
  category: "pdf",
  keywords: [
    "watermark pdf",
    "add watermark to pdf",
    "stamp pdf",
    "pdf watermark online",
  ],
  icon: Droplets,
  component: AddWatermark,
};