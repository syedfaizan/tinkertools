# TinkerTools — Free Online Tools Portal

A Next.js (App Router, TypeScript, Tailwind CSS) site hosting small free
utilities — PDF, text, and eventually image tools. Every tool runs entirely in
the browser (client-side JS), so there are no server costs, no uploads, and a
genuine privacy selling point: **your files never leave your device.**

Built so adding a new tool is a ~5-minute task: drop a folder, write one
component, add one registry entry. Done.

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19 + TypeScript
- **Tailwind CSS v4** with class-based dark mode
- **framer-motion** for page transitions, card hover/tap, and success animations
  (respects `prefers-reduced-motion`)
- **pdf-lib** for client-side PDF work (code-split per tool)
- **lucide-react** for icons, **clsx** for class merging

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build    # production build (Turbopack)
npm start        # serve the production build
npm run lint     # ESLint (flat config)
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in what you need:

| Variable                      | Purpose                                                              |
| ----------------------------- | -------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_NAME`       | Site name shown in header/footer/SEO (default `TinkerTools`)         |
| `NEXT_PUBLIC_SITE_URL`        | Canonical URL used by sitemap/robots (default `https://tinkertools.tech`) |
| `NEXT_PUBLIC_ADS_ENABLED`     | `true` enables real AdSense units (default: placeholders only)       |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | AdSense publisher ID, e.g. `ca-pub-1234567890123456`               |
| `NEXT_PUBLIC_GA_ID`           | GA4 measurement ID, e.g. `G-XXXXXXXXXX`                              |

**Ads workflow:** develop with the placeholder `<AdSlot />` components
(nothing renders for real users — just neutral labelled boxes for layout
testing). Once AdSense approves your site, set
`NEXT_PUBLIC_ADS_ENABLED=true` and your client ID. No code changes elsewhere.

## How to add a new tool

1. Copy `src/tools/word-counter/` to `src/tools/your-tool/`.
2. Edit `meta.ts` — slug, title, description, category, keywords, icon
   (any lucide icon), and the `component` import.
   - Small dependency-free tools: `import { YourTool } from "./index"`.
   - Heavy tools (anything with a big library): wrap in `next/dynamic` like
     `src/tools/pdf-merge/meta.ts` so the library only loads on that tool's page.
3. Write the tool UI in `index.tsx` (a `"use client"` component).
4. Add one import + one entry to the `TOOLS` array in `src/tools/registry.ts`.

That's it — the tool automatically appears on the homepage grid, gets its own
indexable route `/tools/<slug>` with SEO metadata, shows up in the Cmd+K
command palette, the footer, the sitemap, and related-tools suggestions.

### Conventions worth keeping

- **Mobile-first everywhere** — design at ~375px, then layer `sm:`/`md:`/`lg:`.
- Touch targets ≥ 44px; keep primary actions reachable without scrolling on
  mobile (see the sticky bottom bar in the PDF Merge tool).
- **File-processing tools must show `<FileTrustBadge />`** next to the upload
  control. Only use it on tools that genuinely process files in the browser —
  never on a tool backed by a server API.
- Put `<RelatedTools current={slug} />` in the "result" state of file tools to
  catch users at their highest-intent moment.

## Project structure

```
src/
  app/
    layout.tsx              Root layout: fonts, theme bootstrap, nav, footer, GA4
    page.tsx                Homepage: hero + recently-used + tool grid by category
    tools/[slug]/page.tsx   Dynamic tool page (SEO metadata from registry)
    privacy/page.tsx        Privacy Policy (restates the no-server-storage point)
    terms/page.tsx          Terms of Use
    sitemap.ts, robots.ts   Generated from the registry
  tools/
    registry.ts             ToolMeta type + TOOLS array + lookup helpers
    word-counter/           One real tool (zero dependencies)
    pdf-merge/              One real tool (pdf-lib, code-split)
  components/
    AdSlot.tsx              Config-driven ad placeholder/AdSense wrapper
    ToolCard.tsx, RelatedTools.tsx, RecentlyUsed.tsx
    FileTrustBadge.tsx      "Files never leave your browser" trust signal
    CommandPalette.tsx      Cmd+K jump-to-tool search
    ThemeToggle.tsx, Layout/{Header,Footer}.tsx
  lib/
    config.ts               Env-driven site config
    storage.ts              localStorage helpers (theme, recently used)
```

## Deploying

1. Push this repo to GitHub.
2. Import it in Vercel (free Hobby tier is plenty) — auto-deploys on push.
3. Set the `NEXT_PUBLIC_*` env vars in Vercel's project settings
   (`NEXT_PUBLIC_SITE_URL=https://tinkertools.tech`).
4. Point your domain at Vercel (DNS via Vercel's domain settings).
5. Get a handful of tools live with real content, then apply to AdSense.
6. When approved: flip `NEXT_PUBLIC_ADS_ENABLED=true` and set your client ID
   in Vercel — done.