import type { ToolMeta } from "@/tools/registry";
import dynamic from "next/dynamic";
import { LockOpen } from "lucide-react";

export const UnlockPdf = dynamic(() =>
  import("./index").then((mod) => mod.UnlockPdf)
);

export const unlockPdfMeta: ToolMeta = {
  slug: "unlock-pdf",
  title: "Unlock PDF",
  description:
    "Remove the password from a protected PDF you have the password for — decrypted locally on your device, with nothing uploaded.",
  category: "Security",
  keywords: [
    "unlock pdf",
    "remove pdf password",
    "decrypt pdf online",
    "unlock protected pdf",
  ],
  icon: LockOpen,
  component: UnlockPdf,
};