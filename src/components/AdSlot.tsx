"use client";

import { useEffect } from "react";
import Script from "next/script";
import { ADSENSE_CLIENT_ID, ADS_ENABLED } from "@/lib/config";
import { cn } from "@/lib/utils";

const ADS_SCRIPT_SRC = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";

/**
 * Config-driven ad slot.
 *
 * - Ads disabled or no client ID set → renders a neutral, labelled placeholder
 *   (useful for layout testing before AdSense approval), never real ad code.
 * - Ads enabled → renders a standard AdSense <ins> unit and loads the
 *   AdSense script once (Next.js dedupes the <script src> across slots).
 *
 * Flip it on in production by setting NEXT_PUBLIC_ADS_ENABLED=true and
 * NEXT_PUBLIC_ADSENSE_CLIENT_ID — no code changes needed.
 */
export function AdSlot({
  placement,
  slot,
  className,
}: {
  placement: string;
  /** AdSense unit slot ID ("1234567890"). */
  slot?: string;
  className?: string;
}) {
  const adsEnabled = ADS_ENABLED && ADSENSE_CLIENT_ID.length > 0;

  useEffect(() => {
    if (!adsEnabled) return;
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      w.adsbygoogle = w.adsbygoogle || [];
      w.adsbygoogle.push({});
    } catch {
      /* never block the page on ad plumbing */
    }
  }, [adsEnabled]);

  if (!adsEnabled) {
    return (
      <div
        aria-hidden="true"
        data-placement={placement}
        className={cn(
          "flex min-h-[90px] items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-xs font-medium uppercase tracking-widest text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-600",
          className
        )}
      >
        Ad · {placement}
      </div>
    );
  }

  return (
    <div className={cn("min-h-[90px]", className)}>
      <Script src={ADS_SCRIPT_SRC} strategy="afterInteractive" />
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}