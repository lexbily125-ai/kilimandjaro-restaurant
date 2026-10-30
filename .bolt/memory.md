# Project memory

## Product intent & audience

- E-commerce app with a cart drawer (commerce/consumer-facing storefront).

## Brand personality & voice

- Not yet established.

## Visual design & UX direction

- Cart drawer pattern is a core UI component; state persists across debugging/reinstall cycles.
- Built with React + Vite (fast-refresh dev preview expected).

## Decisions, constraints & rationale

- Vite + React framework stack confirmed.
- Rolldown is involved in the build toolchain (may be via Vite's experimental rolldown integration or related packages).
- Dev-server preview can break from corrupted/broken native module installs (rolldown native binding).
- **Fix pattern that worked:** delete `node_modules` and lock file → clean reinstall → verify production build (`vite build`) passes.
- Production build (`vite build`) is more resilient than dev server; passing build ≠ dev preview working.
- Assistant cannot self-start the preview server; user must manually reload preview after fixes.

## Open questions & assumptions

- Exact Vite version and whether rolldown-vite is intentionally chosen vs. default Vite — not confirmed.
- Whether the native binding issue will recur on environment resets/deploys.
- Cart drawer feature details and overall app scope beyond cart (products, checkout, etc.) — not yet explored.
- Full tech stack beyond Vite + React (state management, styling, routing, API) — not yet established.