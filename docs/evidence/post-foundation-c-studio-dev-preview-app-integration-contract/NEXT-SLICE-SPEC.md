# Next Slice — Recommendation

## Recommended next slice

**POST-FOUNDATION C — STUDIO DEV PREVIEW APP INTEGRATION IMPLEMENTATION PLAN**

With the App integration **contract** in place (headless, metadata-only, proven fail-closed), the
next step is a headless **implementation plan** that sequences a future controlled integration —
still **without touching the real App**.

## Scope of the next slice

- A headless `dev-preview-app-integration-implementation-plan` subtree that plans the integration
  phases, App/router/menu attachment plans, mount adapter wiring plan, dependency injection plan,
  lifecycle/cleanup plan, rollout/rollback plan, and manual enablement gate plan.
- Consumes this slice's App integration contract as its upstream input.
- Still **no** change to `App.jsx`, product router, product menu, or Runtime UI mount — the plan
  only describes the future integration.

## Guardrails carried forward

- 1 slice = 1 PR; dev-only; default-off; fail-closed; metadata-only.
- No prototype relink; no new dependencies; no `.jsx`/`.tsx`/`.css`.
- A real App integration slice may follow **only** after the enterprise checkpoint
  `pre_app_integration_implementation_enterprise_checkpoint`.
