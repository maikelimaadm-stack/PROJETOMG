# Studio Dev Preview Isolated Runtime — Report

## Purpose
Run an initial, isolated, dev-only, headless preview runtime using only existing contracts and
synthetic/metadata-only data. It validates contracts, resolves contractual placeholders, simulates
lifecycle/event/render-request safely, and produces a deterministic virtual preview frame. It never
renders a screen — output is virtual, deterministic, and auditable.

## Public surface (`index.js`)
- Config + flags: `ISOLATED_RUNTIME_*`, `ISOLATED_RUNTIME_LIFECYCLE_STEPS`,
  `ISOLATED_RUNTIME_EVENT_KINDS`, `MANUAL_GATE_NAME/STATUS`, `ISOLATED_RUNTIME_CAPABILITIES`,
  `is*Enabled`, `runtimeDigest`.
- Errors: `ISOLATED_RUNTIME_ERROR_CODES`, `IsolatedRuntimeError`, `createIsolatedRuntimeError`.
- Parts: session, preflight, contract loader, synthetic data provider, placeholder resolver,
  virtual frame, lifecycle executor, event dispatcher, render request executor, state container,
  permission enforcer, data boundary, isolation boundary, manual gate, safety policy, manifest,
  verifier, compatibility, diagnostics, fallback.
- Composer: `createStudioDevPreviewIsolatedRuntime({ implementationPlan })`.

## Contract shape (top level)
`kind: studio-dev-preview-isolated-runtime`, `isolatedRuntimeVersion:
studio-dev-preview-isolated-runtime@1.0.0`, `mode: headless_dev_preview_isolated_runtime`,
`readiness: studio_dev_preview_isolated_runtime_ready`, `readyForIsolatedRuntime: true`,
`readyForDevPreviewRuntimeUI: false`, `readyForRouteMenuIntegration: false`,
`readyForRealModuleGeneration: false`, `readyForProduction: false`, `blockerCount: 0`,
`warningCount: 0`, plus frozen `capabilities` with `isolatedRuntimeImplemented: true`,
`visualRuntimeImplemented: false`, and every other forbidden flag `false`.
