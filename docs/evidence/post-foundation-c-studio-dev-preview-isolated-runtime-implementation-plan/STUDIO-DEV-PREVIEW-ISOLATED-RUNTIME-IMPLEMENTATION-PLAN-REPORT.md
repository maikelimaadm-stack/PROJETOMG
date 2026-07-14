# Studio Dev Preview Isolated Runtime Implementation Plan — Report

## Purpose
Define, as headless metadata, the auditable PLAN a future isolated dev-preview runtime would
follow — the phases, the isolation boundaries, the dev-only execution policy, the adapter/
render/lifecycle/event surfaces, the data/permission enforcement, the test harness, and the
rollout/rollback and observability plans — WITHOUT implementing any runtime.

## Public surface (`index.js`)
- Config + flags: `IMPLEMENTATION_PLAN_*`, `IMPLEMENTATION_PHASE_IDS`, `LIFECYCLE_EXECUTION_STEPS`,
  `EVENT_HANDLING_KINDS`, `RENDER_PIPELINE_STEPS`, `TEST_HARNESS_FIXTURE_KINDS`,
  `IMPLEMENTATION_PLAN_HEADLESS_CAPABILITIES`, `is*Enabled`, `planDigest`.
- Errors: `IMPLEMENTATION_PLAN_ERROR_CODES`, `IsolatedRuntimeImplementationPlanError`, `createIsolatedRuntimeImplementationPlanError`.
- Builders: session, phases, boundary, execution policy, adapter, render pipeline, lifecycle,
  event handling, data access blocked, permission enforcement, test harness, rollout/rollback,
  observability, route/placement blocked, safety, readiness, manifest, verifier, compatibility,
  diagnostics, fallback.
- Composer: `createStudioDevPreviewIsolatedRuntimeImplementationPlan({ runtimeShellContract })`.

## Contract shape (top level)
`kind: studio-dev-preview-isolated-runtime-implementation-plan`, `implementationPlanVersion:
studio-dev-preview-isolated-runtime-implementation-plan@1.0.0`, `mode:
headless_dev_preview_isolated_runtime_implementation_plan`, `readiness:
studio_dev_preview_isolated_runtime_implementation_plan_ready`,
`readyForIsolatedRuntimeImplementationPlan: true`,
`readyForIsolatedRuntimeImplementationSlice: false`, `readyForRealModuleGeneration: false`,
`readyForProduction: false`, `blockerCount: 0`, `warningCount: 0`, plus frozen `capabilities`
with `runtimeImplemented: false` and every side-effect flag `false`.
