# Architecture Decision — Option A (minimal integration in the main App)

## Decision

Per the Fable 5 checkpoint, **option A — minimal integration in the main App** — was chosen: add a
single dev-only route to `src/App.jsx`, following the existing sanctioned dev-route mounts, rather
than a broader integration.

## Why option A

- **Minimal blast radius** — one additive route, no new router, no provider/auth/layout changes.
- **Sanctioned precedent** — mirrors `__dev/runtime-v2/previews` and `__dev/modelobase2/fuel`
  exactly (flag-gated conditional `<Route>` + lazy import), so the change is familiar and auditable.
- **Reversible** — flag-off disables it instantly; removing the additive block removes it structurally.
- **Stricter than precedent on the bundle** — the lazy import is wrapped in a build-time
  `import.meta.env.DEV` guard, so unlike the two prior mounts (which emit a chunk), the production
  build strips the Studio preview entirely.

## Consequences

- The dev route requires an explicit flag **and** checkpoint receipt (strict equality) and a dev
  environment; it fails closed in production/staging.
- Product exposure (menu/sidebar/public route) is explicitly NOT part of this slice and remains a
  future, separately-approved step behind a new checkpoint.
