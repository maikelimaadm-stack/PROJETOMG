# Next Checkpoint — Recommendation

## Required next step

Before ANY product exposure of the Studio Dev Preview (a real menu/sidebar entry, a public/product
route, production availability, or real-data wiring), a NEW enterprise checkpoint is required — e.g.

**FABLE 5 — PRE-STUDIO-DEV-PREVIEW PRODUCT-EXPOSURE ENTERPRISE CHECKPOINT**

This slice delivers only the minimal, dev-only, default-off, fail-closed mount; it authorizes
**nothing** beyond it. `readyForProductExposure`, `readyForRealModuleGeneration`,
`readyForProduction` are all `false`.

## Candidate follow-up (after that checkpoint)

A controlled slice that, behind its own flag + checkpoint, would consider a dev-tools menu entry
(still dev-only) and richer synthetic previews — never production data, never a public route without
explicit authorization.

## Guardrails carried forward

- 1 slice = 1 PR; dev-only; default-off; fail-closed; synthetic-data-only.
- Additive App.jsx / productionUiGuard only; no prototype relink; no new dependencies.
- Governance registry entries stay specific to the slice — never a broad wildcard.
