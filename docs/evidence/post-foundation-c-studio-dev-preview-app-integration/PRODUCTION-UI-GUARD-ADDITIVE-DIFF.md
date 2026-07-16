# productionUiGuard — Additive Diff

The `scripts/gates/lib/productionUiGuard.mjs` change is additive and non-weakening: **two existing
allowlist regexes were extended (append-only) — the sanctioned extension mechanism used when the
second dev mount (`__dev/modelobase2/fuel`) was added.**

## What changed

1. `DEV_ROUTE_MARKER` — appended `StudioDevPreviewAppRoute`, `STUDIO_DEV_PREVIEW_ROUTE_PATH`,
   `shouldMountStudioDevPreviewRoute`, `__dev/studio/preview`, `DEV-ONLY: Studio dev preview`,
   `dev-preview-app-integration`.
2. The added-path allowlist in `appJsxChangeIsOnlyDevRouteMount` — appended
   `STUDIO_DEV_PREVIEW_ROUTE_PATH` / `__dev/studio/preview`.

## Invariants (asserted by the slice gate)

- **All prior markers preserved** — `RuntimeV2DevPreview`, `__dev/runtime-v2/previews`,
  `ModeloBase2FuelDevPreview`, `__dev/modelobase2/fuel` still present.
- **New marker specific** — only the Studio dev-preview tokens/path were added.
- **No broad wildcard** — no `.*` introduced.
- **No logic weakened** — `FORBIDDEN` regex byte-identical; the `if (removed.length > 0) return false`
  App.jsx check preserved; `productionUiOffendingFiles`, `ISOLATED_READONLY_TEST_SUBTREES`,
  `AUTHORIZED_BETA_FILES`, `appJsxChangeIsOnlyDevRouteMount` all intact.
- **0 markers removed** — the two regex lines are pure appends (added === removed line count, all
  removed content re-appears verbatim inside the extended lines).
