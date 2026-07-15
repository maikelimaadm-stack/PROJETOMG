# Next Slice — Recommendation

## Recommended next slice

**POST-FOUNDATION C — STUDIO DEV PREVIEW APP INTEGRATION CONTRACT**

Now that the isolated route/menu runtime exists and is proven dev-only, default-off
and fail-closed, the next step is a **contract** (headless, no wiring) describing how
the isolated host would eventually attach to the real App — behind its own checkpoint.

## Scope of the next slice

- A headless `dev-preview-app-integration-contract` subtree that specifies the
  attachment points, the required checkpoint receipt
  (`approved_for_app_integration`), and the guard order for a future integration.
- Still **no** change to `App.jsx`, product router, or product menu — the contract
  only describes the integration; it does not perform it.
- Consumes this slice's route/menu runtime as its upstream input.

## Guardrails carried forward

- 1 slice = 1 PR; dev-only; default-off; fail-closed; synthetic-data-only.
- No prototype relink; no new dependencies; no `.tsx`/`.css`.
- Requires an explicit checkpoint before any real App integration slice follows.
