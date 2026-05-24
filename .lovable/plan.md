
# MY PDF FIX — Build Plan

A mobile-first PDF tools site with 17 tools (12 client-side via pdf-lib, 5 placeholders), iLovePDF-style red/white design, full marketing + legal + blog scaffolding.

## Stack adjustments (confirmed with you)

- **Framework**: keep TanStack Start (Vite + React + TS, SSR). Routing via file-based TanStack Router instead of React Router v6.
- **SEO**: per-route `head()` (SSR-rendered) — no `react-helmet-async`.
- **Everything else from your spec stays**: Tailwind, Lucide, pdf-lib, Framer Motion only if needed.
- Routes live in `src/routes/` (TanStack convention), not `src/pages/`. Reusable code stays in `src/components/`, `src/lib/`, `src/data/`, `src/context/` as you specified.
- No backend, no auth, no Supabase, no UI kits, no analytics packages — pure frontend.

## Design tokens (wired into Tailwind v4 via `src/styles.css`)

Defined as CSS variables and Tailwind theme tokens:
- `--primary` #E5322D, `--primary-hover` #C42924
- `--background` #FFFFFF, `--section` #F5F7FA
- `--foreground` #1A1A1A, `--muted-foreground` #6B7280, `--border` #E5E7EB
- 9 pastel accent tokens for tool cards (red/blue/green/purple/orange/teal/pink/yellow/indigo) with paired bg + foreground
- Inter via Google Fonts, preloaded with `display=swap`, system-ui fallback

## File structure

```text
src/
  routes/
    __root.tsx              (Layout: Navbar + <Outlet/> + Footer, sitewide head defaults, JSON-LD Organization)
    index.tsx               (Home)
    merge-pdf.tsx … flatten-pdf.tsx   (17 tool routes, each ~5 lines wrapping <ToolPage toolSlug=… />)
    about.tsx, contact.tsx, privacy.tsx, terms.tsx, disclaimer.tsx, cookie-policy.tsx
    blog.tsx, blog.$slug.tsx
    guides.tsx, guides.$slug.tsx
  components/
    layout/    Navbar.tsx, Footer.tsx, Layout.tsx
    home/      Hero.tsx, ToolGrid.tsx, ToolCard.tsx, Features.tsx, HowItWorks.tsx, FAQ.tsx
    tools/     ToolPage.tsx, FileUpload.tsx, ResultPanel.tsx, options/*.tsx (page-range, rotation, text, etc.)
    common/    SEO.tsx (head() helper), AdSlot.tsx, Button.tsx, Accordion.tsx, HeadScripts.tsx, Spinner.tsx
  context/SiteConfigContext.tsx
  lib/pdf/    merge.ts, split.ts, jpgToPdf.ts, pngToPdf.ts, extractPages.ts, removePages.ts,
              reorderPages.ts, rotate.ts, pageNumbers.ts, addText.ts, addBlankPage.ts,
              addMargin.ts, watermark.ts, types.ts
  data/       tools.ts (17 entries), blogPosts.ts (3 long-form drafts), guides.ts (3 long-form drafts), faqs.ts
public/       logo.svg, favicon.ico (neutral), robots.txt, ads.txt, og-default.svg
```

Note: TanStack auto-codesplits routes by default, so no manual `React.lazy` wrapping needed — every route page becomes its own chunk automatically.

## Data model (`src/data/tools.ts`)

```ts
type Tool = {
  slug: string; name: string; description: string;
  category: 'Organize'|'Optimize'|'Convert'|'Edit';
  accent: 'red'|'blue'|'green'|'purple'|'orange'|'teal'|'pink'|'yellow'|'indigo';
  icon: keyof typeof LucideIcons;
  processingType: 'client'|'placeholder';
  accepts: string[]; multiple: boolean;
  related: string[]; // slugs
};
```
All 17 tools per your list, accents and Lucide icons assigned for visual variety.

## Tool page architecture

`ToolPage.tsx` is a single shared layout that takes a `slug`, looks up metadata, and renders:
1. Title + subtitle, breadcrumb back to Home
2. `<FileUpload>` (drag-drop + click, validates `accepts` + `multiple`)
3. Tool-specific options panel (rendered via a small switch on slug)
4. Primary red Process button
5. `<ResultPanel>` with download link after processing
6. Privacy note (client tools only)
7. `{/* CONTENT GOES HERE */}` empty long-form slot
8. "Related Tools" — 3 cards from `related[]`

Each `src/routes/<slug>.tsx` is a thin wrapper that sets `head()` (unique title/description/og) and renders `<ToolPage slug="…" />`.

Placeholder tools render the same UI; Process click fires `toast("This tool requires server processing — coming soon.")` via sonner (already in template).

## pdf-lib functions

One file per client tool in `src/lib/pdf/`, each `(files: File[], options) => Promise<Blob>`:
- merge, split (by ranges), jpgToPdf, pngToPdf, extractPages, removePages, reorderPages, rotate (per-page or all, 90/180/270), pageNumbers (position + format), addText (page + x/y + font size), addBlankPage (position + size), addMargin (mm), watermark (text or image, opacity, rotation), plus a tiny `download(blob, filename)` helper.

All pure functions, fully typed, no I/O outside the browser.

## Marketing + content pages

- **Home**: Hero, category filter pills (All/Organize/Optimize/Convert/Edit) with client-side filter state, ToolGrid (1/2/3/4 cols), Features (3 icons), HowItWorks (3 steps), FAQ accordion (5 Qs from `data/faqs.ts`) wired to FAQPage JSON-LD via `head()`.
- **About / Contact / Privacy / Terms / Disclaimer / CookiePolicy**: realistic long-form drafts (multi-paragraph) you can replace.
- **Contact form**: name/email/message → success toast, no backend.
- **Blog & Guides**: listing grid + `$slug` article template, populated with 3 realistic long-form sample posts each so templates render fully. Article routes use Article JSON-LD derived from loader data.
- **404**: friendly message + Home link, set in `__root.tsx`'s `notFoundComponent`.

## SEO

- `SEO.tsx` exports a helper `seoHead({ title, description, ogImage?, canonical })` that returns a `head()` payload. Each route imports and spreads it.
- Root `head()`: charset, viewport, sitewide og defaults, Inter preconnect/preload, Organization JSON-LD. No canonical at root (TanStack link concat bug). No `og:image` at root (leaf overrides only).
- Every route sets unique title + description + og:title + og:description. Leaf routes set canonical + their own og:image when meaningful.
- Twitter card tags via meta.

## Site config + injected scripts

`SiteConfigContext.tsx` provides `{ siteName, siteUrl, defaultTitle, defaultDescription, defaultOgImage, adsenseId, adsenseAutoAdsCode, gaId, gtmId, clarityId }` — all default to `""`.

`HeadScripts.tsx` mounted in `__root.tsx` reads context and conditionally injects AdSense/GA/GTM/Clarity scripts only when the corresponding ID is non-empty.

`AdSlot.tsx` renders a gray dashed "Ad slot" placeholder when no AdSense ID, real `<ins class="adsbygoogle">` markup when set.

## Navbar + Footer

- **Navbar** (sticky white, shadow on scroll): logo, Tools dropdown (grouped by category, hover/click on desktop, accordion on mobile), Guides, Blog, Contact. Hamburger → slide-in panel on mobile.
- **Footer** (#F5F7FA, 4 columns): Tools (top 8), Company, Legal, Contact + social icon placeholders. Copyright row.

## Lovable-branding scrub

- `index.html` (or root shell): remove Lovable title/description/og/twitter/favicon references; neutral defaults only.
- `package.json`: neutral `name`, no Lovable/gpt-engineer references.
- `public/`: replace favicon + add neutral `og-default.svg`, `robots.txt`, `ads.txt`.
- Sweep all template comments.

## Accessibility & performance

- Semantic `<header>/<nav>/<main>/<footer>/<article>`; single `<main>` in `__root.tsx`.
- Alt text everywhere, `aria-label` on icon-only buttons, visible red focus ring, full keyboard nav, WCAG AA contrast (red on white passes for bold).
- Lazy `loading="lazy"` on non-hero images.
- Code-splitting: automatic via TanStack route splitting; loading fallback = simple red spinner component.

## Build order (delivered in this sequence)

1. Tailwind tokens + Inter + `SiteConfigContext` + `__root.tsx` shell with Navbar/Footer/HeadScripts/Toaster/Spinner fallback. Scrub Lovable branding.
2. `data/tools.ts` (all 17), `ToolCard`, `ToolGrid`, `Hero`, `Features`, `HowItWorks`, `FAQ` → Home route.
3. `ToolPage` + `FileUpload` + `ResultPanel` + options panels + `download` helper.
4. `lib/pdf/*` — 12 client functions, typed.
5. 17 tool route files (thin wrappers, unique SEO each).
6. Static pages (About, Contact w/ form + toast, Privacy, Terms, Disclaimer, Cookie Policy) with realistic long-form drafts.
7. Blog + Guides list + article templates, `data/blogPosts.ts` + `data/guides.ts` with 3 long-form sample posts each.
8. 404 page (root `notFoundComponent`).
9. `SEO.tsx`, `AdSlot.tsx`, finalize JSON-LD (Organization, FAQPage, Article).
10. Polish pass: hover/transitions, responsive sweep at 375/768/1280, a11y sweep, build check.

After each major section I'll post a one-line summary and continue.

## Final checklist (verified before sign-off)

- Build passes cleanly.
- Zero Lovable strings in `index.html`, `package.json`, `public/`, components.
- All 17 tool routes reachable; 12 client tools download a real Blob; 5 placeholders toast.
- Mobile responsive at 375/768/1280.
- Every route has unique `head()` meta.
- Tailwind-only styling, no inline `style={}`.
