import type { ToolMeta } from "@/tools/registry";
import dynamic from "next/dynamic";
import { Signature } from "lucide-react";

export const SignPdf = dynamic(() =>
  import("./index").then((mod) => mod.SignPdf)
);

export const signPdfMeta: ToolMeta = {
  slug: "sign-pdf",
  title: "Sign PDF",
  description:
    "Draw or type your signature, then drag it onto the page and download the signed PDF — all in your browser with no uploads.",
  category: "PDF",
  keywords: [
    "sign pdf",
    "signature online",
    "sign a document",
    "add signature to pdf",
  ],
  icon: Signature,
  component: SignPdf,
};