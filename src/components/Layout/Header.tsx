"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Wrench, X } from "lucide-react";
import { CommandPalette } from "@/components/CommandPalette";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SITE_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/#tools", label: "All Tools" },
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

/** Brand mark — matches the SVG favicon (indigo→violet tile, white wrench). */
export function BrandMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <span
      className={`flex ${className} items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm`}
    >
      <Wrench className="h-1/2 w-1/2" aria-hidden="true" />
    </span>
  );
}

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => {
    const path = href.split("#")[0];
    return path === "/" ? pathname === "/" : pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/85 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        <Link
          href="/"
          aria-label={`${SITE_NAME} — home`}
          className="flex min-h-11 items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-50"
        >
          <BrandMark />
          <span className="text-[15px] sm:text-base">{SITE_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-11 items-center rounded-xl px-3 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <CommandPalette />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-50 md:hidden dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {menuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-zinc-200 bg-white px-4 pb-4 pt-2 md:hidden dark:border-zinc-800 dark:bg-zinc-950"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "flex min-h-11 items-center rounded-xl px-3 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                  : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}