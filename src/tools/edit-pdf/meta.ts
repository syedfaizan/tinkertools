import type { ToolMeta } from "@/tools/registry";
import dynamic from "next/dynamic";
import { PencilLine } from "lucide-react";

export const EditPdf = dynamic(() =>
  import("./index").then((mod) => mod.EditPdf)
);

export const editPdfMeta: ToolMeta = {
  slug: "edit-pdf",
  title: "Edit PDF",
  description:
    "Draw, highlight and add text to any page of a PDF and save the result — a lightweight markup editor that keeps your files on your device.",
  category: "pdf",
  keywords: [
    "edit pdf",
    "annotate pdf",
    "draw on pdf",
    "highlight pdf online",
  ],
  icon: PencilLine,
  component: EditPdf,
};