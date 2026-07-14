# Studio Dev Preview Contract Bridge — Report

## Purpose
Bridge between the **Module Preview Sandbox** metadata and a future (still-blocked)
visual dev-preview slice. Given a sandbox contract, it emits a deterministic object graph
of render/layout/screen/table/form/detail/field/action/permission CONTRACTS plus an
allowed-component contract, a visual-adapter contract, blocked route/placement plans,
runtime-safety metadata, a readiness decision, a manifest, verifier, compatibility and
diagnostics.

## Public surface (`index.js`)
- Config + flags: `DEV_PREVIEW_BRIDGE_*`, `ALLOWED_COMPONENT_KINDS`, `BLOCKED_COMPONENT_KINDS`,
  `DEV_PREVIEW_BRIDGE_HEADLESS_CAPABILITIES`, `is*Enabled`, `bridgeDigest`.
- Errors: `DEV_PREVIEW_BRIDGE_ERROR_CODES`, `DevPreviewBridgeError`, `createDevPreviewBridgeError`.
- Builders: session, render/layout/screen schema, table/form/detail/field/action/permission bridge,
  allowed-component contract, visual-adapter contract, route/placement plan, runtime-safety,
  readiness, manifest, verifier, compatibility, diagnostics, fallback.
- Composer: `createStudioDevPreviewContractBridge({ sandbox })`.

## Contract shape (top level)
`kind: studio-dev-preview-contract-bridge`, `bridgeVersion: studio-dev-preview-contract-bridge@1.0.0`,
`mode: headless_dev_preview_contract_bridge`, `readiness: studio_dev_preview_contract_bridge_ready`,
`readyForDevPreviewBridge: true`, `readyForRealModuleGeneration: false`, `readyForProduction: false`,
`blockerCount: 0`, `warningCount: 0`, plus frozen `capabilities` with every side-effect flag `false`.
