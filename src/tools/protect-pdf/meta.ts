import type { ToolMeta } from "@/tools/registry";
import dynamic from "next/dynamic";
import { LockKeyhole } from "lucide-react";

export const ProtectPdf = dynamic(() =>
  import("./index").then((mod) => mod.ProtectPdf)
);

export const protectPdfMeta: ToolMeta = {
  slug: "protect-pdf",
  title: "Protect PDF",
  description:
    "Lock a PDF with a password and optional copy/print restrictions — encryption applied right in your browser, never on a server.",
  category: "Security",
  keywords: [
    "protect pdf",
    "password protect pdf",
    "lock pdf",
    "pdf encryption online",
  ],
  icon: LockKeyhole,
  component: ProtectPdf,
};