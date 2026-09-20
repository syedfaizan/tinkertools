import type { LucideIcon } from "lucide-react";
import {
  Clapperboard,
  FileText,
  Globe,
  Image,
  Music,
  Type,
} from "lucide-react";

/**
 * Canonical tool categories, in display order (non-empty ones show on the
 * homepage). Each tool's `meta.ts` stores a category `id`; the label, icon and
 * ordering all live here, so renaming or reordering a category is a one-line
 * change. Add new categories here as the tool set grows (audio → video → etc.).
 */
export interface ToolCategory {
  /** Stable id stored in each tool's meta.ts, e.g. "pdf". */
  id: string;
  /** Display label, e.g. "PDF". */
  label: string;
  /** Icon used for the homepage section heading. */
  icon: LucideIcon;
}

export const CATEGORIES: ToolCategory[] = [
  { id: "pdf", label: "PDF", icon: FileText },
  { id: "image", label: "Image", icon: Image },
  { id: "video", label: "Video", icon: Clapperboard },
  { id: "text", label: "Text", icon: Type },
  { id: "audio", label: "Audio", icon: Music },
  { id: "web", label: "Web", icon: Globe },
];

export function getCategoryById(id: string): ToolCategory | undefined {
  return CATEGORIES.find((category) => category.id === id);
}