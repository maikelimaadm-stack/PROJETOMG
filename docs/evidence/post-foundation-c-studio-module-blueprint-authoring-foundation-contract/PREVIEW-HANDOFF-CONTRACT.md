# Preview Handoff Contract

`createPreviewHandoffContract()` — metadata only. A validated draft would hand off to the
**synthetic Preview Sandbox** destination only.

Fields: `handoffKind:'synthetic_preview_candidate'`, `handoffTarget:'synthetic-preview-sandbox'`,
`targetSandboxVersion`, `compatibleWithPreviewSandbox:true`, `syntheticOnly:true`,
`previewPayloadCreated:false`, `previewMounted:false`, `realDataAttached:false`,
`handoffToProduct:false`, `routeCreated:false`, `menuCreated:false`, `requiresValidatedDraft:true`.

No preview payload is created, nothing is mounted, no route/menu is created, no real data attached.
