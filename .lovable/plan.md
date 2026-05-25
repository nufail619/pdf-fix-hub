## Plan: Fetch long-form content from backend in ToolPage

Add a client-side fetch in `src/components/tools/ToolPage.tsx` that loads tool content from the Express backend at `/api/tool/{slug}` on mount, with graceful fallback to the existing `{children}` slot.

### Changes to `src/components/tools/ToolPage.tsx`

1. Add imports: `useEffect` (alongside existing `useState`).
2. Add two state hooks:
   - `const [content, setContent] = useState<string | null>(null);`
   - `const [loading, setLoading] = useState(true);`
3. Add a `useEffect` keyed on `slug`:
   - `fetch(\`/api/tool/${slug}\`)`
   - On ok response, parse JSON and set `content` to `data.content` (string) if truthy, else `null`.
   - On any error or non-ok response, set `content` to `null` (silent fallback).
   - Always set `loading` to `false` in `finally`.
   - Use an `ignore` flag to avoid setting state after unmount.
4. Replace the content slot:
   ```tsx
   <div className="mt-16">{children}{/* CONTENT GOES HERE */}</div>
   ```
   with:
   ```tsx
   <div className="mt-16">
     {loading ? null : content ? (
       <div
         className="max-w-3xl mx-auto py-12 space-y-8 prose prose-slate"
         dangerouslySetInnerHTML={{ __html: content }}
       />
     ) : (
       children
     )}
   </div>
   ```
   (No spinner shown during loading to avoid flicker; falls through to children/content once resolved.)

### Behavior

- API returns `{ content: "<h2>...</h2>..." }` → render injected HTML, hide JSX children.
- API returns empty/missing content, 404, or network error → render existing `{children}` (the long-form JSX already in `merge-pdf.tsx` and `split-pdf.tsx`).
- During SPA dev (no backend) → fetch fails silently → JSX children render as today. No behavior change.

### Out of scope

- No changes to `ToolPage` props, route files, or any other component.
- No sanitization library — content is trusted to come from the user's own backend (as implied by the request using `dangerouslySetInnerHTML`).
- No loading skeleton or error UI.
