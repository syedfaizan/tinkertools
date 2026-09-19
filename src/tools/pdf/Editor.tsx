"use client";

/**
 * Shared bits for the canvas-based tools (Edit PDF, Sign PDF, Redact PDF):
 * a page preview stage with a stacking overlay canvas, and a coordinate
 * mapper from pointer/display space into canvas pixel space.
 */
import type { PointerEvent as ReactPointerEvent, ReactNode, RefObject } from "react";
import { cn } from "@/lib/utils";

export function EditorStage({
  bgUrl,
  overlayRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerLeave,
  className,
  children,
}: {
  bgUrl: string | null;
  overlayRef: RefObject<HTMLCanvasElement | null>;
  onPointerDown?: (event: ReactPointerEvent<HTMLCanvasElement>) => void;
  onPointerMove?: (event: ReactPointerEvent<HTMLCanvasElement>) => void;
  onPointerUp?: (event: ReactPointerEvent<HTMLCanvasElement>) => void;
  onPointerLeave?: (event: ReactPointerEvent<HTMLCanvasElement>) => void;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative w-full select-none overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 shadow-sm dark:border-zinc-800 dark:bg-zinc-950",
        className
      )}
    >
      {bgUrl && (
        <img src={bgUrl} alt="Page preview" className="block w-full" draggable={false} />
      )}
      <canvas
        ref={overlayRef}
        className="absolute inset-0 h-full w-full touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
      />
      {children}
    </div>
  );
}

/** Map a pointer event on a canvas element into canvas pixel coordinates. */
export function canvasPoint(
  event: ReactPointerEvent<Element> | PointerEvent,
  canvas: HTMLCanvasElement
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
  return { x: Math.max(0, Math.min(canvas.width, x)), y: Math.max(0, Math.min(canvas.height, y)) };
}