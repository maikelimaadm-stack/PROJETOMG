# Studio Dev Preview Visual Contract — Report

## Purpose
Bridge the Dev Preview Contract Bridge to a future (still-blocked) visual dev-preview runtime.
Given a bridge contract, it emits a deterministic object graph describing HOW a preview WOULD
look — visual tree, screens, sections, component placeholders, states, interactions, theme
tokens, validation and accessibility — entirely as metadata.

## Public surface (`index.js`)
- Config + flags: `VISUAL_CONTRACT_*`, `ALLOWED_VISUAL_PLACEHOLDER_KINDS`,
  `BLOCKED_VISUAL_PLACEHOLDER_KINDS`, `VISUAL_STATE_KINDS`, `VISUAL_INTERACTION_KINDS`,
  `VISUAL_THEME_TOKEN_GROUPS`, `VISUAL_CONTRACT_HEADLESS_CAPABILITIES`, `is*Enabled`, `visualDigest`.
- Errors: `VISUAL_CONTRACT_ERROR_CODES`, `DevPreviewVisualContractError`, `createDevPreviewVisualContractError`.
- Builders: session, visual tree/screen/section, component placeholder registry, state,
  interaction, theme token, validation, accessibility, route/placement plan, runtime safety,
  readiness, manifest, verifier, compatibility, diagnostics, fallback.
- Composer: `createStudioDevPreviewVisualContract({ bridge })`.

## Contract shape (top level)
`kind: studio-dev-preview-visual-contract`, `visualContractVersion:
studio-dev-preview-visual-contract@1.0.0`, `mode: headless_dev_preview_visual_contract`,
`readiness: studio_dev_preview_visual_contract_ready`, `readyForDevPreviewVisualContract: true`,
`readyForDevPreviewVisualRuntime: false`, `readyForRealModuleGeneration: false`,
`readyForProduction: false`, `blockerCount: 0`, `warningCount: 0`, plus frozen `capabilities`
with every side-effect flag `false`.
