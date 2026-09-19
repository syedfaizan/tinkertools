import type { ToolMeta } from "@/tools/registry";
import dynamic from "next/dynamic";
import { Hash } from "lucide-react";

export const AddPageNumbers = dynamic(() =>
  import("./index").then((mod) => mod.AddPageNumbers)
);

export const addPageNumbersMeta: ToolMeta = {
  slug: "add-page-numbers",
  title: "Add Page Numbers",
  description:
    "Number the pages of any PDF with your choice of position, start number and style — processed locally, private and free.",
  category: "PDF",
  keywords: [
    "add page numbers to pdf",
    "page numbers pdf",
    "insert page numbers",
    "pdf page numbering",
  ],
  icon: Hash,
  component: AddPageNumbers,
};