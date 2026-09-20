import type { ToolMeta } from "@/tools/registry";
import dynamic from "next/dynamic";
import { Globe } from "lucide-react";

export const WebpageToPdf = dynamic(() =>
  import("./index").then((mod) => mod.WebpageToPdf)
);

export const webpageToPdfMeta: ToolMeta = {
  slug: "webpage-to-pdf",
  title: "Webpage to PDF",
  description:
    "Turn any web page into a clean PDF document. Paste a URL and download the page as a file — assembled in your browser.",
  category: "web",
  keywords: [
    "webpage to pdf",
    "url to pdf",
    "website to pdf",
    "save webpage as pdf",
  ],
  icon: Globe,
  component: WebpageToPdf,
};