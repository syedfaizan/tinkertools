import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Trust signal shown next to upload controls on file-processing tools.
 * Only use this on tools that genuinely process files in the browser —
 * never on a tool backed by a server-side API.
 */
export function FileTrustBadge({ className }: { className?: string }) {
  return (
    <p
      role="note"
      className={cn(
        "flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2.5 text-xs leading-5 text-emerald-800 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300",
        className
      )}
    >
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>
        Processed entirely in your browser — files are never uploaded to or
        stored on our servers.
      </span>
    </p>
  );
}