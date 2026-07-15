# Architectural Decision — Isolated Dev-Preview Host (outside the main App)

## Decision

Mount the first real route/menu through an **isolated dev-preview host located
outside the main App** (alternative 2), rather than wiring a route into the
production router of `App.jsx` (alternative 1).

## Alternatives considered

1. **Wire into the main App router** — a `<Route path="/__dev/studio/preview">`
   registered inside the product router. Rejected: it couples the preview to the
   production route tree, touches `App.jsx`, and expands blast radius. A regression
   or an accidentally-enabled flag could surface the preview in production.

2. **Isolated dev-preview host outside the main App** — a standalone host graph
   (`StudioDevPreviewRouteMenuHost.jsx`) mounted only through explicit dependency
   injection (`rootFactory` + `mountNode`), never imported by `App.jsx`, never
   auto-mounting. **Chosen.**

## Why alternative 2

- **Minimal blast radius** — nothing in the production import graph references the
  host; the preview cannot appear unless a caller explicitly injects a root.
- **Fail-closed by construction** — the mount adapter returns `blocked` (without
  calling `rootFactory`) for production/staging, disabled flags, missing checkpoint,
  missing DI, or a denied route guard.
- **Reversible** — deleting the subtree or simply not consuming it removes the
  feature entirely; no App wiring to unwind.
- **Node-test safe** — the `.js` runtime graph never imports `.jsx`, so
  `node --test` parses the whole tree; the React host is referenced by name only.

## Consequences

- Mounting requires a deliberate host that injects `rootFactory`/`mountNode`.
- The App integration remains a **future** slice, gated behind its own checkpoint.
