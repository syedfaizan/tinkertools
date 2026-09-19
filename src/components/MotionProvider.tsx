"use client";

import { MotionConfig } from "framer-motion";

/**
 * Applies MotionConfig to the whole tree. `reducedMotion="user"` disables
 * transform/layout animations for users who set prefers-reduced-motion.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}