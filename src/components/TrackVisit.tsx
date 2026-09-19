"use client";

import { useEffect } from "react";
import { recordToolVisit } from "@/lib/storage";

/**
 * Records a tool visit in localStorage when the tool page mounts — powers the
 * homepage "recently used" strip. No backend involved.
 */
export function TrackVisit({ slug }: { slug: string }) {
  useEffect(() => {
    recordToolVisit(slug);
  }, [slug]);

  return null;
}